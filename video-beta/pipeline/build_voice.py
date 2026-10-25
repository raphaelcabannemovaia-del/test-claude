"""Voix v4 : prise ElevenLabs (« Hugo from Paris », eleven_v4) découpée en phrases
par détection des pauses, quelques respirations ajoutées, puis minutage mot à mot."""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

BUILD = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BUILD, "voice-v4-hugo.mp3")
OUT = "/home/user/test-claude/video-beta"
NAME = "mova-ia-pub-beta-v4"
SR = 44100
NB = " "

# Phrases dans l'ordre de la prise. Une phrase = un passage de voix entre deux pauses.
# cap : texte affiché, "affiché|lu" pour le timing, "*" = vert, "^" = rouge.
# seg : bloc de texte affiché à l'écran (plusieurs phrases peuvent partager un bloc).
# add : silence ajouté après la phrase.
CHUNKS = [
    dict(seg="h1", cap=f"Samedi, 21{NB}h{NB}47.|vingt_et_une_heures_quarante-sept."),
    dict(seg="h2", cap="Un acheteur vous écrit pour le T3 du centre."),
    dict(seg="h3", cap="Lundi matin, vous le rappelez."),
    dict(seg="h4", cap="Il a déjà ^visité ^ailleurs."),
    dict(seg="h5", cap="Et il n'est pas le seul."),
    dict(seg="h6", add=.25, cap=f"Sur 2{NB}198|plus_de_deux_mille demandes envoyées à des agences, ^68{NB}%|soixante-huit_pour_cent sont restées ^sans ^réponse en 24{NB}h.|vingt-quatre_heures."),
    dict(seg="v0", cap="Côté vendeurs, même histoire :"),
    dict(seg="v0", cap="sans nouvelles, votre ^mandat est en ^danger."),
    dict(seg="b1", add=.95, cap="Ces deux problèmes ont une *solution."),
    dict(seg="s1", cap="*mova.ia|Mova_I.A. conçoit des agents IA|I.A. sur *mesure pour votre agence."),
    dict(seg="s2", cap=f"Une demande arrive à 22{NB}h ?|vingt-deux_heures"),
    dict(seg="s3", cap="L'agent *répond aussitôt,"),
    dict(seg="s3", cap="*qualifie le projet, et *propose une visite."),
    dict(seg="s5", cap="Vous gardez la *main :"),
    dict(seg="s5", cap="vous *validez,"),
    dict(seg="s5", cap="c'est tout."),
    dict(seg="v1", cap="Après chaque visite, vos vendeurs reçoivent un compte rendu."),
    dict(seg="v1", cap="*Automatiquement."),
    dict(seg="r", cap="Chaque demande a sa *réponse.¶"),
    dict(seg="r", add=.3, cap="Chaque vendeur a ses *nouvelles."),
    dict(seg="c1", cap="Réservez votre *one-to-one de 30{NB}minutes.|trente_minutes.".replace("{NB}", NB)),
    dict(seg="c2", cap="On identifie ensemble où votre agence perd des affaires."),
    dict(seg="c3", cap="Le lien est dans la *bio."),
]
START = 0.12
END_HOLD = 2.9

# 1. décodage
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     check=True, capture_output=True).stdout
a = np.frombuffer(raw, np.float32).astype(np.float64)

# 2. détection des passages de voix (trames de 10 ms, seuil -38 dBFS, pause >= 0,15 s)
F = int(SR * .01)
rms = np.sqrt(np.convolve(a ** 2, np.ones(F) / F, mode="same"))[::F]
db = 20 * np.log10(rms + 1e-9)


def runs(thr, min_sil):
    voiced = db > thr
    out, i, n = [], 0, len(voiced)
    while i < n:
        if voiced[i]:
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
        else:
            i += 1
    return [r for r in out if r[1] - r[0] > .12]


sp = runs(-38, .18)
assert len(sp) == len(CHUNKS), (len(sp), sp)
for c, (s0, s1) in zip(CHUNKS, sp):
    print(f"  {s0:6.2f}-{s1:6.2f}  {c['cap'][:60]}")

# 3. reconstruction avec respirations ajoutées
parts = [np.zeros(int(START * SR))]
t = START
prev_cut = 0
for i, (c, (s0, s1)) in enumerate(zip(CHUNKS, sp)):
    nxt = sp[i + 1][0] if i + 1 < len(sp) else len(a) / SR
    cut = (s1 + nxt) / 2 if i + 1 < len(sp) else len(a) / SR
    seg_audio = a[int(prev_cut * SR):int(cut * SR)]
    c["start"] = t + (s0 - prev_cut)
    c["end"] = t + (s1 - prev_cut)
    parts.append(seg_audio)
    t += len(seg_audio) / SR
    if c.get("add"):
        parts.append(np.zeros(int(c["add"] * SR)))
        t += c["add"]
    prev_cut = cut
parts.append(np.zeros(int(END_HOLD * SR)))
voice = np.concatenate(parts)
TOTAL = CHUNKS[-1]["end"] + END_HOLD

tmp = os.path.join(BUILD, "voice_raw.wav")
with wave.open(tmp, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(voice / np.max(np.abs(voice)) * .9, -1, 1) * 32767).astype(np.int16).tobytes())

# 4. mise en forme légère : la prise est déjà propre, on ajoute du coffre et de la présence
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", tmp, "-af",
    "highpass=f=60,equalizer=f=120:t=q:w=1:g=2.5,equalizer=f=450:t=q:w=1.2:g=-1.5,"
    "equalizer=f=3300:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=3,"
    "alimiter=limit=0.89",
    "-ac", "1", "-ar", str(SR), os.path.join(BUILD, "voice.wav"),
], check=True)

# 5. minutage des mots, proportionnel à la longueur lue dans chaque phrase
words = []
for c in CHUNKS:
    toks = []
    for tok in c["cap"].split(" "):
        hl = ""
        if tok.startswith("*"):
            hl, tok = "g", tok[1:]
        elif tok.startswith("^"):
            hl, tok = "r", tok[1:]
        disp, spoken = (tok.split("|", 1) + [None])[:2]
        spoken = (spoken or disp).replace("_", " ")
        letters = len(re.sub(r"[^\wÀ-ÿ]", "", spoken))
        pause = 2 if disp.endswith(",") else 3 if disp[-1:] in ".?:!" else 0
        toks.append((disp, hl, max(letters, 1) + pause))
    tot = sum(x[2] for x in toks)
    dur = c["end"] - c["start"]
    acc = 0
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


with open(os.path.join(OUT, NAME + ".srt"), "w", encoding="utf-8") as f:
    for n, (sid, s) in enumerate(segs.items(), 1):
        text = " ".join(w["w"].replace("¶", "") for w in words if w["seg"] == sid)
        f.write(f"{n}\n{ts(s['start'])} --> {ts(s['end'])}\n{text}\n\n")

print("durée totale %.2f s" % TOTAL)
for sid, s in segs.items():
    print(f"{sid:3} {s['start']:6.2f} -> {s['end']:6.2f}")
