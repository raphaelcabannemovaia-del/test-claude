"""Musique, bruitages et mixage d'une vidéo du lot, d'après v?/events.json et v?/voice.wav.
Usage : python3 -I build_audio.py v1"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, sys.argv[1])
SR = 44100
EV = json.load(open(os.path.join(BUILD, "events.json")))
M = EV["music"]
TOTAL = EV["total"]
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(3)
mus = np.zeros((2, N))


def add(n0, L, R=None):
    R = L if R is None else R
    n0 = max(n0, 0)
    n1 = min(N, n0 + len(L))
    if n1 > n0:
        mus[0, n0:n1] += L[:n1 - n0]
        mus[1, n0:n1] += R[:n1 - n0]


def lp(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def pad(freqs, t0, t1, cutoff, gain):
    n0, n1 = int(t0 * SR), int(t1 * SR)
    t = np.arange(n1 - n0) / SR
    L, R = np.zeros(n1 - n0), np.zeros(n1 - n0)
    for f in freqs:
        for det, ch in ((-.18, L), (.18, R)):
            for h in range(1, 7):
                ch += np.sin(2 * np.pi * f * (1 + det / 100) * h * t + rng.uniform(0, 6.28)) / h
    lfo = 1 + .12 * np.sin(2 * np.pi * .11 * t)
    L, R = lp(L, cutoff) * lfo, lp(R, cutoff) * lfo
    fade = int(min(1.5, (t1 - t0) / 3) * SR)
    env = np.ones(n1 - n0)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    m = max(np.max(np.abs(L)), 1e-9)
    add(n0, L / m * env * gain, R / m * env * gain)


def whoosh(t0, gain=.16, dur=.6):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = lp(x, 2500) - lp(x, 300)
    y = x / np.max(np.abs(x)) * np.sin(np.linspace(0, np.pi, n)) ** 2 * gain
    add(int((t0 - dur / 2) * SR), y * .8, y)


def impact(t0, gain=.5):
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 3.5) * gain
    y[:400] += rng.standard_normal(400) * .3 * np.linspace(1, 0, 400)
    add(int(t0 * SR), y)


def riser(t0, dur=1.0, gain=.12):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = x - lp(x, 1500)
    add(int((t0 - dur) * SR), x / np.max(np.abs(x)) * np.linspace(0, 1, n) ** 2 * gain)


def blip(t0, f=1800, gain=.09, d=.06):
    tt = np.arange(int(d * SR)) / SR
    add(int(t0 * SR), np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70) * gain)


def alert(t0):
    blip(t0, 660, .10, .09)
    blip(t0 + .09, 520, .10, .12)
    tt = np.arange(int(.25 * SR)) / SR
    add(int(t0 * SR), np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 18) * .25)


def click(t0):
    n = int(.012 * SR)
    add(int(t0 * SR), rng.standard_normal(n) * np.linspace(1, 0, n) * .25)
    blip(t0 + .004, 3200, .12, .03)


def shimmer(t0):
    for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        tt = np.arange(int(.9 * SR)) / SR
        y = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) * .05
        add(int((t0 + k * .07) * SR), y * (.8 + .1 * k), y * (1.1 - .1 * k))


def notif(t0):
    blip(t0, 1320, .09, .12)
    blip(t0 + .12, 1760, .09, .16)


def ticks(t0, dur=.9, n=14):
    for k in range(n):
        blip(t0 + dur * (1 - (1 - k / n) ** 2), 2600 - k * 60, .04, .025)


def typing(t0, dur, cps=14):
    t = t0
    while t < t0 + dur:
        n = int(.008 * SR)
        x = rng.standard_normal(n) * np.linspace(1, 0, n) * .05
        add(int(t * SR), x * .8, x)
        t += 1 / cps * rng.uniform(.7, 1.3)


BPM = 112
BEAT = 60 / BPM


def kick(t0, g=.5):
    tt = np.arange(int(.38 * SR)) / SR
    y = np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-tt * 28)) / SR) * np.exp(-tt * 9) * g
    y[:220] += rng.standard_normal(220) * .12 * np.linspace(1, 0, 220)
    add(int(t0 * SR), y)


def clap(t0, g=.2):
    n = int(.22 * SR)
    x = rng.standard_normal(n)
    x = lp(x, 3800) - lp(x, 900)
    x = x / np.max(np.abs(x)) * np.exp(-np.arange(n) / SR * 20)
    for k, dt in enumerate((0, .011, .022)):
        add(int((t0 + dt) * SR), x * g * (1 if k == 2 else .5), x * g * (.9 if k == 2 else .6))


def hat(t0, g=.045):
    n = int(.05 * SR)
    x = rng.standard_normal(n)
    x = x - lp(x, 7000)
    x = x / np.max(np.abs(x)) * np.exp(-np.arange(n) / SR * 90) * g
    add(int(t0 * SR), x * .8, x * 1.2)


def bass(t0, f, dur, g=.15):
    tt = np.arange(int(dur * SR)) / SR
    y = lp(sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 9)), 280)
    add(int(t0 * SR), y / np.max(np.abs(y)) * np.minimum(1, tt / .008) * np.exp(-tt * 2.5) * g)


# musique : tension (la mineur), bascule rouge éventuelle, puis groove (do majeur) au logo
G, END = M["groove"], M["end"]
red, red_end = M.get("red"), M.get("redEnd")
pad([110, 164.81, 220, 261.63], 0, G + .6, 800, .16)
if red is not None:
    pad([55, 82.4], red - .2, red_end + .3, 300, .18)
t = .25
while t < (red if red is not None else G - 1.2):
    kick(t, .22)
    t += BEAT * 2
if red is not None:
    t = red + .55
    while t < red_end - .1:
        kick(t, .32)
        bass(t, 55, BEAT * .45, .09)
        hat(t + BEAT / 2, .03)
        t += BEAT
riser(G, 1.6, .14)
pad([130.81, 196, 329.63, 587.33], G - .2, TOTAL + .5, 1600, .13)
roots = [65.41, 55.0, 43.65, 49.0]
t, b = G, 0
while t < END:
    kick(t, .48)
    if b % 4 in (1, 3):
        clap(t, .18)
    hat(t + BEAT / 2, .045)
    hat(t, .025)
    bass(t, roots[(b // 4) % 4], BEAT * .48, .14)
    bass(t + BEAT / 2, roots[(b // 4) % 4], BEAT * .4, .1)
    t += BEAT
    b += 1
impact(END, .35)

FX = dict(whoosh=whoosh, impact=impact, riser=riser, blip=blip, alert=alert, click=click,
          shimmer=shimmer, notif=notif, ticks=ticks, typing=typing)
for e in EV["sfx"]:
    FX[e[0]](*e[1:])

# la musique baisse sous la voix
with wave.open(os.path.join(BUILD, "voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
envv = np.sqrt(np.convolve(v ** 2, np.ones(4410) / 4410, mode="same"))
envv = envv / (envv.max() + 1e-9)
mus *= 1 - .5 * np.clip(envv * 3, 0, 1)
fin, end = int(1.6 * SR), int(TOTAL * SR)
mus[:, end - fin:end] *= np.linspace(1, 0, fin)
mix = (mus + .9 * v)[:, :end]
mix /= np.max(np.abs(mix)) / .95
raw = os.path.join(BUILD, "mix_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100",
                os.path.join(BUILD, "mix.wav")], check=True)
print(sys.argv[1], "mixage ok", round(TOTAL, 2), "s")
