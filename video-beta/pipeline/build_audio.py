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
SW = S["h2"]["start"]
W = {"B": S["b1"]["start"] - .25, "C": S["s2"]["start"] - .3, "D": S["v1"]["start"] - .3, "E": S["c1"]["start"] - .35}
V_CLICK = wt("s3", "valider") + .25
H_CLICK = S["c2"]["start"] + 1.2


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


A2, C3, E3, G3, A3, C4, E4, D5 = 110, 130.81, 164.81, 196, 220, 261.63, 329.63, 587.33
logo_t = S["b1"]["end"] + .4
add(*pad([A2, E3, A3, C4], 0, logo_t + .8, 900, .22))
add(*pad([55, 82.4], SW - .2, W["B"] + .5, 300, .2))
add(*pad([C3, G3, E4, D5], logo_t - .4, TOTAL + .5, 1800, .2))

step = 60 / 100 / 2
notes = [523.25, 659.25, 783.99, 587.33, 659.25, 783.99, 880.0, 783.99]
t = W["C"] + .2
i = 0
while t < W["E"] + 3:
    n = int(.5 * SR)
    tt = np.arange(n) / SR
    tone = np.sin(2 * np.pi * notes[i % 8] * tt) * np.exp(-tt * 9) * .05
    add(int(t * SR), tone * .9, tone * 1.1)
    t += step
    i += 1
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


riser(SW, .9)
impact(SW)
whoosh(SW, .2)
for k in [W["B"], W["C"], W["D"], W["E"], S["h3"]["start"], S["h5"]["start"]]:
    whoosh(k)
alert(S["h4"]["start"])
alert(wt("h4", "ailleurs") - .15)
for key in ["vendeurs", "nouvelles", "mandat", "danger"]:
    blip(wt("h5", key), 520, .08, .1)
shimmer(S["b1"]["end"] + .4)
shimmer(W["E"] + .1)
for k in [wt("s2", "répond"), wt("s2", "qualifie"), wt("s2", "propose"), wt("s2", "propose") + .8]:
    blip(k, 2000, .08)
click(V_CLICK)
blip(V_CLICK + .05, 1400, .1, .1)
for key in ["vendeurs", "compte", "visite", "automatiquement"]:
    blip(wt("v1", key), 1700, .07)
click(H_CLICK)

# baisse de la musique sous la voix
with wave.open(os.path.join(BUILD, "voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
envv = np.sqrt(np.convolve(v ** 2, np.ones(4410) / 4410, mode="same"))
envv = envv / (envv.max() + 1e-9)
duck = 1 - .45 * np.clip(envv * 3, 0, 1)
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
