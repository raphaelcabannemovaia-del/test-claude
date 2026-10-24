import json
import os
import re
import subprocess
import wave

import numpy as np
from piper import PiperVoice, SynthesisConfig

BUILD = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(BUILD, "audio")
MODEL = os.path.join(os.path.dirname(BUILD), "tts-models", "vits-piper-fr_FR-upmc-medium", "fr_FR-upmc-medium")
OUT = "/home/user/test-claude/video-beta"
os.makedirs(AUD, exist_ok=True)
NB = " "

# tts : texte lu. cap : texte affiché, "affiché|lu" pour le timing,
# préfixe "*" = mot en vert, "^" = mot en rouge. gap : silence après. ls : lenteur.
SEGS = [
    # S1 — accroche : le problème
    dict(id="h1", gap=0.25, ls=1.00,
         tts="Votre agence reçoit des demandes tous les jours.",
         cap="Votre agence reçoit des *demandes tous les jours."),
    dict(id="h2", gap=0.45, ls=1.10,
         tts="Le problème ?",
         cap="Le ^problème ?"),
    dict(id="h3", gap=0.35, ls=0.98,
         tts="Sur plus de deux mille demandes envoyées à des agences, soixante-huit pour cent sont restées sans réponse en vingt-quatre heures.",
         cap=f"Sur 2{NB}198|plus_de_deux_mille demandes envoyées à des agences, ^68{NB}%|soixante-huit_pour_cent sont restées ^sans ^réponse en 24{NB}h.|vingt-quatre_heures."),
    dict(id="h4", gap=0.35, ls=1.00,
         tts="Et un acheteur sans réponse, c'est un acheteur qui visite ailleurs.",
         cap="Et un acheteur sans réponse, c'est un acheteur qui visite ^ailleurs."),
    dict(id="h5", gap=0.70, ls=1.00,
         tts="Même chose pour vos vendeurs : sans nouvelles, votre mandat est en danger.",
         cap=f"Même chose pour vos vendeurs{NB}: sans nouvelles, votre ^mandat est en ^danger."),
    # S2 — pont + logo
    dict(id="b1", gap=1.90, ls=1.05,
         tts="Il existe une meilleure façon de travailler.",
         cap="Il existe une *meilleure *façon de travailler."),
    dict(id="s1", gap=0.35, ls=1.00,
         tts="Mova, I.A. installe dans votre agence des agents I.A. sur mesure.",
         cap="*mova.ia|Mova_I.A. installe dans votre agence des agents IA|I.A. sur *mesure."),
    # S3 — démonstration
    dict(id="s2", gap=0.30, ls=0.98,
         tts="Une demande arrive à vingt-deux heures ? L'agent répond aussitôt, qualifie le projet, et propose une visite.",
         cap=f"Une demande arrive à 22{NB}h ?|vingt-deux_heures L'agent *répond aussitôt, *qualifie le projet et *propose une visite."),
    dict(id="s3", gap=0.60, ls=1.02,
         tts="Vous n'avez plus qu'à valider.",
         cap="Vous n'avez plus qu'à *valider."),
    # S4 — vendeurs
    dict(id="v1", gap=0.65, ls=1.00,
         tts="Et vos vendeurs reçoivent un compte rendu après chaque visite. Automatiquement.",
         cap="Et vos vendeurs reçoivent un compte rendu après chaque visite. *Automatiquement."),
    # S5 — appel à l'action
    dict(id="c1", gap=0.30, ls=1.00,
         tts="Diagnostic offert de trente minutes, en visio.",
         cap=f"*Diagnostic *offert de 30{NB}minutes,|trente_minutes, en visio."),
    dict(id="c2", gap=0.0, ls=1.02,
         tts="Le lien est dans la bio.",
         cap="Le lien est dans la *bio."),
]

START = 0.25
PACE = 1.06
END_HOLD = 2.8


def synth(voice, text, ls):
    cfg = SynthesisConfig(speaker_id=1, length_scale=ls * PACE, noise_scale=0.75, noise_w_scale=0.9)
    chunks = [c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)]
    a = np.concatenate(chunks).astype(np.float32)
    # coupe les silences de début et de fin
    env = np.convolve(np.abs(a), np.ones(256) / 256, mode="same")
    idx = np.where(env > 0.01)[0]
    a = a[max(idx[0] - 200, 0): idx[-1] + 600]
    fade = min(300, len(a) // 4)
    a[:fade] *= np.linspace(0, 1, fade)
    a[-fade:] *= np.linspace(1, 0, fade)
    return a


voice = PiperVoice.load(MODEL + ".onnx", config_path=MODEL + ".onnx.json")
SR = voice.config.sample_rate

track = [np.zeros(int(SR * START), np.float32)]
t = START
for s in SEGS:
    a = synth(voice, s["tts"], s["ls"])
    s["dur"] = len(a) / SR
    s["start"] = t
    s["end"] = t + s["dur"]
    track.append(a)
    track.append(np.zeros(int(SR * s["gap"]), np.float32))
    t = s["end"] + s["gap"]
TOTAL = SEGS[-1]["end"] + END_HOLD
track.append(np.zeros(int(SR * END_HOLD), np.float32))
voice_track = np.concatenate(track)
peak = np.max(np.abs(voice_track))
voice_track = voice_track / peak * 0.9

raw = os.path.join(BUILD, "voice_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((voice_track * 32767).astype(np.int16).tobytes())

# légère mise en forme : coupe-bas, présence, compression
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", raw, "-af",
    "aresample=44100,highpass=f=70,rubberband=pitch=0.965:formant=preserved,equalizer=f=160:t=q:w=1:g=2,"
    "equalizer=f=3000:t=q:w=1.2:g=2.5,equalizer=f=7200:t=q:w=2:g=-2,"
    "acompressor=threshold=-20dB:ratio=3:attack=6:release=120:makeup=3,aecho=0.85:0.6:28|43:0.10|0.06",
    "-ac", "1", os.path.join(BUILD, "voice.wav"),
], check=True)

# timing des mots, proportionnel à la longueur lue
words = []
for s in SEGS:
    toks = []
    for tok in s["cap"].split(" "):
        hl = ""
        if tok.startswith("*"):
            hl, tok = "g", tok[1:]
        elif tok.startswith("^"):
            hl, tok = "r", tok[1:]
        disp, spoken = (tok.split("|", 1) + [None])[:2]
        spoken = (spoken or disp).replace("_", " ")
        letters = len(re.sub(r"[^\wÀ-ÿ]", "", spoken))
        pause = 2 if disp.endswith(",") else 4 if disp[-1:] in ".?:!" else 0
        toks.append((disp, hl, max(letters, 1) + pause))
    tot = sum(x[2] for x in toks)
    acc = 0
    for disp, hl, wgt in toks:
        t0 = s["start"] + s["dur"] * acc / tot
        acc += wgt
        t1 = s["start"] + s["dur"] * acc / tot
        words.append(dict(w=disp, seg=s["id"], hl=hl, t0=round(t0, 3), t1=round(t1, 3)))

timeline = dict(
    total=round(TOTAL, 3),
    segs={s["id"]: dict(start=round(s["start"], 3), end=round(s["end"], 3)) for s in SEGS},
    words=words,
)
json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w"), ensure_ascii=False, indent=1)


def ts(x):
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s_, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s_:02},{ms:03}"


with open(os.path.join(OUT, "mova-ia-pub-beta-v2.srt"), "w", encoding="utf-8") as f:
    for n, s in enumerate(SEGS, 1):
        text = " ".join(w["w"] for w in words if w["seg"] == s["id"])
        f.write(f"{n}\n{ts(s['start'])} --> {ts(s['end'])}\n{text}\n\n")

print("durée totale %.2f s" % TOTAL)
for s in SEGS:
    print(f"{s['id']} {s['start']:6.2f} -> {s['end']:6.2f}  ({s['dur']:.2f} s)")
