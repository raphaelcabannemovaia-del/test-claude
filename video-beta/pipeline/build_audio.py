import json
import os
import subprocess
import wave

import numpy as np

BUILD = os.path.dirname(os.path.abspath(__file__))
SR = 44100
TL = json.load(open(os.path.join(BUILD, "timeline.json")))
S = TL["segs"]
TOTAL = TL["total"]
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(3)


def norm(s):
    for ch in ".,:?!«»":
        s = s.replace(ch, "")
    return s.lower().replace(" ", " ")


def wt(seg, key, nth=0, exact=False):
    k = 0
    for w in TL["words"]:
        if w["seg"] != seg:
            continue
        n = norm(w["w"])
        if (n == key) if exact else (key in n):
            if k == nth:
                return w["t0"]
            k += 1
    return S[seg]["start"]


# mêmes repères que dans l'animation
SW = S["h4"]["start"]
W = {"B": S["b1"]["start"] - .25, "C": S["s2"]["start"] - .3, "D": S["v1"]["start"] - .3, "R": S["r"]["start"] - .3,
     "E": S["c1"]["start"] - .35}
V_CLICK = wt("s5", "valid") + .25
H_CLICK = S["c3"]["start"] + 1.0


def lp_fft(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def pad(freqs, t0, t1, cutoff, gain):
    n0, n1 = int(t0 * SR), int(t1 * SR)
    t = np.arange(n1 - n0) / SR
    L = np.zeros(n1 - n0)
    R = np.zeros(n1 - n0)
    for f in freqs:
        for det, ch in ((-.18, L), (.18, R)):
            ff = f * (1 + det / 100)
            for h in range(1, 7):
                ch += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h
    lfo = 1 + .12 * np.sin(2 * np.pi * .11 * t)
    L, R = lp_fft(L, cutoff) * lfo, lp_fft(R, cutoff) * lfo
    fade = int(1.5 * SR)
    env = np.ones(n1 - n0)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    m = max(np.max(np.abs(L)), 1e-9)
    return n0, L / m * env * gain, R / m * env * gain


mus = np.zeros((2, N))


def add(n0, L, R=None):
    R = L if R is None else R
    n1 = min(N, n0 + len(L))
    mus[0, n0:n1] += L[:n1 - n0]
    mus[1, n0:n1] += R[:n1 - n0]


def env_burst(dur, a, d):
    n = int(dur * SR)
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nd:] = np.linspace(1, 0, nd) ** 2
    return e


def whoosh(t0, gain=.16, dur=.6):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = lp_fft(x, 2500) - lp_fft(x, 300)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    y = x / np.max(np.abs(x)) * e * gain
    add(int((t0 - dur / 2) * SR), y * .8, y)


def impact(t0, gain=.5):
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    f = 38 + 40 * np.exp(-tt * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt * 3.5) * gain
    y[:400] += rng.standard_normal(400) * .3 * np.linspace(1, 0, 400)
    add(int(t0 * SR), y)


def riser(t0, dur=1.0, gain=.12):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = x - lp_fft(x, 1500)
    e = np.linspace(0, 1, n) ** 2
    add(int((t0 - dur) * SR), x / np.max(np.abs(x)) * e * gain)


def blip(t0, f=1800, gain=.09, d=.06):
    n = int(d * SR)
    tt = np.arange(n) / SR
    add(int(t0 * SR), np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70) * gain)


def alert(t0):
    blip(t0, 660, .10, .09)
    blip(t0 + .09, 520, .10, .12)
    n = int(.25 * SR)
    tt = np.arange(n) / SR
    add(int(t0 * SR), np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 18) * .25)


def click(t0):
    n = int(.012 * SR)
    add(int(t0 * SR), rng.standard_normal(n) * np.linspace(1, 0, n) * .25)
    blip(t0 + .004, 3200, .12, .03)


def shimmer(t0):
    for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        n = int(.9 * SR)
        tt = np.arange(n) / SR
        y = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) * .05
        add(int((t0 + k * .07) * SR), y * (.8 + .1 * k), y * (1.1 - .1 * k))


A2, C3, E3, G3, A3, C4, E4, D5 = 110, 130.81, 164.81, 196, 220, 261.63, 329.63, 587.33
logo_t = S["b1"]["end"] + .4
END_GROOVE = S["c3"]["end"] + .6
add(*pad([A2, E3, A3, C4], 0, logo_t + .6, 800, .16))
add(*pad([55, 82.4], SW - .2, S["b1"]["start"] + .3, 300, .18))
add(*pad([C3, G3, E4, D5], logo_t - .2, TOTAL + .5, 1600, .13))

BPM = 112
BEAT = 60 / BPM


def kick(t0, g=.5):
    n = int(.38 * SR)
    tt = np.arange(n) / SR
    f = 45 + 80 * np.exp(-tt * 28)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * g
    y[:220] += rng.standard_normal(220) * .12 * np.linspace(1, 0, 220)
    add(int(t0 * SR), y)


def clap(t0, g=.2):
    n = int(.22 * SR)
    x = rng.standard_normal(n)
    x = lp_fft(x, 3800) - lp_fft(x, 900)
    x = x / np.max(np.abs(x)) * np.exp(-np.arange(n) / SR * 20)
    for k, dt in enumerate((0, .011, .022)):
        add(int((t0 + dt) * SR), x * g * (1 if k == 2 else .5), x * g * (.9 if k == 2 else .6))


def hat(t0, g=.045):
    n = int(.05 * SR)
    x = rng.standard_normal(n)
    x = x - lp_fft(x, 7000)
    x = x / np.max(np.abs(x)) * np.exp(-np.arange(n) / SR * 90) * g
    add(int(t0 * SR), x * .8, x * 1.2)


def bass(t0, f, dur, g=.15):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 9))
    y = lp_fft(y, 280)
    y = y / np.max(np.abs(y)) * np.minimum(1, tt / .008) * np.exp(-tt * 2.5) * g
    add(int(t0 * SR), y)


# tension : battement sourd jusqu'à la bascule, puis pouls + tic-tac
t = .25
while t < SW:
    kick(t, .22)
    t += BEAT * 2
t = SW + .55
while t < S["b1"]["start"] - .1:
    kick(t, .32)
    bass(t, 55, BEAT * .45, .09)
    hat(t + BEAT / 2, .03)
    t += BEAT
# montée, puis groove complet au logo (do, la, fa, sol)
riser(logo_t, 1.6, .14)
roots = [65.41, 55.0, 43.65, 49.0]
t, b = logo_t, 0
while t < END_GROOVE:
    bar = int(b // 4)
    kick(t, .48)
    if b % 4 in (1, 3):
        clap(t, .18)
    hat(t + BEAT / 2, .045)
    hat(t, .025)
    bass(t, roots[bar % 4], BEAT * .48, .14)
    bass(t + BEAT / 2, roots[bar % 4], BEAT * .4, .1)
    t += BEAT
    b += 1
impact(END_GROOVE, .35)


riser(SW, .9)
impact(SW)
whoosh(SW, .2)
for k in [W["B"], W["C"], W["D"], W["R"], W["E"], S["h6"]["start"], S["v0"]["start"]]:
    whoosh(k)
# notification de la demande, puis avance rapide de l'horloge
blip(.12, 1320, .09, .12)
blip(.24, 1760, .09, .16)
ff0 = S["h3"]["start"]
for k in range(14):
    blip(ff0 + .9 * (1 - (1 - k / 14) ** 2), 2600 - k * 60, .04, .025)
whoosh(ff0 + .45, .12, .9)
blip(ff0 + .9, 880, .08, .12)
alert(SW)
for key in ["vendeurs", "nouvelles", "mandat", "danger"]:
    blip(wt("v0", key), 520, .08, .1)
shimmer(S["b1"]["end"] + .4)
shimmer(W["E"] + .1)
for k in [wt("s3", "répond"), wt("s3", "qualifie"), wt("s3", "propose"), wt("s3", "propose") + .8]:
    blip(k, 2000, .08)
click(V_CLICK)
blip(V_CLICK + .05, 1400, .1, .1)
for k in [S["v1"]["start"] + .3, wt("v1", "compte"), wt("v1", "rendu") + .4, wt("v1", "automatiquement")]:
    blip(k, 1700, .07)
# résolution : rature puis validation, pour chaque problème
for kg in [wt("r", "réponse"), wt("r", "nouvelles")]:
    whoosh(kg - .35, .08, .35)
    blip(kg, 1568, .08, .12)
    blip(kg + .08, 2093, .07, .14)
click(H_CLICK)

# baisse de la musique sous la voix
with wave.open(os.path.join(BUILD, "voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
envv = np.sqrt(np.convolve(v ** 2, np.ones(4410) / 4410, mode="same"))
envv = envv / (envv.max() + 1e-9)
duck = 1 - .5 * np.clip(envv * 3, 0, 1)
mus *= duck
fin = int(1.6 * SR)
end = int(TOTAL * SR)
mus[:, end - fin:end] *= np.linspace(1, 0, fin)
mus[:, end:] = 0

mix = mus + .9 * v
mix = mix[:, :end]
mix /= np.max(np.abs(mix)) / .95
out = os.path.join(BUILD, "mix_raw.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", out, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100",
                os.path.join(BUILD, "mix.wav")], check=True)
print("mix ok", round(end / SR, 2), "s")
