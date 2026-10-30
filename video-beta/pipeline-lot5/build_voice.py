"""Voix d'une vidéo du lot : choisit la meilleure prise ElevenLabs, la découpe en phrases
(pauses détectées puis réparties sur les phrases du script), ajoute les respirations,
calcule le minutage mot à mot et écrit timeline.json + sous-titres.
Usage : python3 -I build_voice.py v1 prise1.mp3 [prise2.mp3]"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from videos import VIDEOS  # noqa: E402

VID = sys.argv[1]
TAKES = sys.argv[2:]
CFG = VIDEOS[VID]
CHUNKS = [dict(c) for c in CFG["chunks"]]
BUILD = os.path.join(HERE, VID)
OUT = "/home/user/test-claude/video-beta/lot-5"
WHISPER = os.environ.get("WHISPER_DIR", "")
SR = 44100
START = 0.12
END_HOLD = 3.0
os.makedirs(BUILD, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def spoken(cap):
    out = []
    for tok in cap.split(" "):
        tok = tok.lstrip("*^")
        disp, sp = (tok.split("|", 1) + [None])[:2]
        out.append((sp or disp).replace("_", " ").replace("¶", ""))
    return " ".join(out)


def letters(s):
    return len(re.sub(r"[^\wÀ-ÿ]", "", s))


def runs(db, thr, min_sil):
    voiced = db > thr
    out, i, n = [], 0, len(voiced)
    while i < n:
        if not voiced[i]:
            i += 1
            continue
        j = i
        while j < n:
            if voiced[j]:
                j += 1
                continue
            k = j
            while k < n and not voiced[k]:
                k += 1
            if k - j >= min_sil * 100 or k >= n:
                break
            j = k
        out.append([i / 100, j / 100])
        i = j
    return [r for r in out if r[1] - r[0] > .1]


def segment(a):
    """Passages de voix, puis groupement optimal en autant de phrases que le script."""
    F = int(SR * .01)
    rms = np.sqrt(np.convolve(a ** 2, np.ones(F) / F, mode="same"))[::F]
    db = 20 * np.log10(rms + 1e-9)
    n = len(CHUNKS)
    for thr, ms in [(-38, .15), (-36, .12), (-34, .10), (-32, .08)]:
        sp = runs(db, thr, ms)
        if len(sp) >= n:
            break
    m = len(sp)
    assert m >= n, f"{m} passages pour {n} phrases"
    w = np.array([letters(spoken(c["cap"])) for c in CHUNKS], float)
    speech = sum(e - s for s, e in sp)
    rate = speech / w.sum()
    gaps = [sp[k + 1][0] - sp[k][1] for k in range(m - 1)]
    INF = 1e18
    # cost[i][j] : phrases 0..i-1 couvrent les passages 0..j-1
    cost = np.full((n + 1, m + 1), INF)
    back = np.zeros((n + 1, m + 1), int)
    cost[0][0] = 0
    for i in range(1, n + 1):
        for j in range(i, m - (n - i) + 1):
            for k in range(i - 1, j):
                if cost[i - 1][k] >= INF:
                    continue
                dur = sp[j - 1][1] - sp[k][0]
                err = ((dur - w[i - 1] * rate) / max(w[i - 1] * rate, .4)) ** 2
                bonus = -1.5 * min(gaps[j - 1], .8) if j < m else 0
                c = cost[i - 1][k] + err + bonus
                if c < cost[i][j]:
                    cost[i][j], back[i][j] = c, k
    groups, j = [], m
    for i in range(n, 0, -1):
        k = back[i][j]
        groups.append((sp[k][0], sp[j - 1][1]))
        j = k
    groups.reverse()
    return groups, cost[n][m]


def transcribe(a, groups):
    if not WHISPER:
        return None
    import sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{WHISPER}/small-encoder.int8.onnx", decoder=f"{WHISPER}/small-decoder.int8.onnx",
        tokens=f"{WHISPER}/small-tokens.txt", language="fr", task="transcribe", num_threads=4)
    x16 = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a).astype(np.float32)
    res = []
    for s0, s1 in groups:
        s = rec.create_stream()
        s.accept_waveform(16000, x16[int(max(s0 - .05, 0) * 16000):int((s1 + .05) * 16000)])
        rec.decode_stream(s)
        res.append(s.result.text.strip())
    return res


def score(ref, hyp):
    norm = lambda s: re.sub(r"[^a-zà-ÿ0-9 ]", " ", s.lower()).split()
    r, h = norm(ref), set(norm(hyp))
    return sum(1 for x in r if x in h) / max(len(r), 1)


# 1. choix de la prise
best = None
for path in TAKES:
    a = decode(path)
    groups, c = segment(a)
    hyp = transcribe(a, groups)
    sc = np.mean([score(spoken(ch["cap"]), h) for ch, h in zip(CHUNKS, hyp)]) if hyp else 0
    print(f"{os.path.basename(path)} : durée {len(a) / SR:.1f} s, écart de découpage {c:.2f}, concordance {sc:.2f}")
    if hyp:
        for ch, h in zip(CHUNKS, hyp):
            print(f"   {spoken(ch['cap'])[:58]:58} | {h[:58]}")
    key = (round(sc, 2), -c)
    if best is None or key > best[0]:
        best = (key, path, a, groups)
_, path, a, groups = best
print("prise retenue :", os.path.basename(path))

# 2. reconstruction avec respirations
parts = [np.zeros(int(START * SR))]
t, prev = START, 0.0
for i, (c, (s0, s1)) in enumerate(zip(CHUNKS, groups)):
    cut = (s1 + groups[i + 1][0]) / 2 if i + 1 < len(groups) else len(a) / SR
    seg = a[int(prev * SR):int(cut * SR)]
    c["start"], c["end"] = t + (s0 - prev), t + (s1 - prev)
    parts.append(seg)
    t += len(seg) / SR
    if c.get("add"):
        parts.append(np.zeros(int(c["add"] * SR)))
        t += c["add"]
    prev = cut
parts.append(np.zeros(int(END_HOLD * SR)))
voice = np.concatenate(parts)
TOTAL = CHUNKS[-1]["end"] + END_HOLD
tmp = os.path.join(BUILD, "voice_raw.wav")
with wave.open(tmp, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(voice / np.max(np.abs(voice)) * .9, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", tmp, "-af",
    "highpass=f=60,equalizer=f=120:t=q:w=1:g=2.5,equalizer=f=450:t=q:w=1.2:g=-1.5,"
    "equalizer=f=3300:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=3,"
    "alimiter=limit=0.89", "-ac", "1", "-ar", str(SR), os.path.join(BUILD, "voice.wav"),
], check=True)

# 3. minutage des mots
words = []
for c in CHUNKS:
    toks = []
    for tok in c["cap"].split(" "):
        hl = ""
        if tok.startswith("*"):
            hl, tok = "g", tok[1:]
        elif tok.startswith("^"):
            hl, tok = "r", tok[1:]
        disp, sp = (tok.split("|", 1) + [None])[:2]
        sp = (sp or disp).replace("_", " ")
        pause = 2 if disp.rstrip("¶").endswith(",") else 3 if disp.rstrip("¶")[-1:] in ".?:!" else 0
        toks.append((disp, hl, max(letters(sp), 1) + pause))
    tot = sum(x[2] for x in toks)
    dur, acc = c["end"] - c["start"], 0
    for disp, hl, wgt in toks:
        t0 = c["start"] + dur * acc / tot
        acc += wgt
        words.append(dict(w=disp, seg=c["seg"], hl=hl, t0=round(t0, 3), t1=round(c["start"] + dur * acc / tot, 3)))
segs = {}
for c in CHUNKS:
    s = segs.setdefault(c["seg"], dict(start=round(c["start"], 3)))
    s["end"] = round(c["end"], 3)
json.dump(dict(total=round(TOTAL, 3), segs=segs, words=words),
          open(os.path.join(BUILD, "timeline.json"), "w"), ensure_ascii=False, indent=1)


def ts(x):
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s_, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s_:02},{ms:03}"


with open(os.path.join(OUT, CFG["name"] + ".srt"), "w", encoding="utf-8") as f:
    for k, (sid, s) in enumerate(segs.items(), 1):
        text = " ".join(x["w"].replace("¶", "") for x in words if x["seg"] == sid)
        f.write(f"{k}\n{ts(s['start'])} --> {ts(s['end'])}\n{text}\n\n")
print("durée totale %.2f s" % TOTAL)
for sid, s in segs.items():
    print(f"  {sid:3} {s['start']:6.2f} -> {s['end']:6.2f}")
