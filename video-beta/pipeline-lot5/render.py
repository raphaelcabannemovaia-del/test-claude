"""Rendu d'une vidéo du lot.
python3 -I render.py v1 page            -> assemble v1.html (moteur + minutage + scènes)
python3 -I render.py v1 stills 1.0 5.2  -> images fixes dans v1/stills/
python3 -I render.py v1 events          -> v1/events.json (bruitages et musique)
python3 -I render.py v1 full            -> v1/silent.mp4"""
import json
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
VID, MODE = sys.argv[1], sys.argv[2]
BUILD = os.path.join(HERE, VID)
PAGE = os.path.join(HERE, VID + ".html")
FPS = 30


def build_page():
    tl = open(os.path.join(BUILD, "timeline.json")).read()
    js = open(os.path.join(HERE, "scenes", VID + ".js")).read()
    html = open(os.path.join(HERE, "engine.html")).read().replace("/*TL*/", tl).replace("/*VIDEO*/", js)
    open(PAGE, "w").write(html)


def open_page(p):
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox", "--disable-gpu"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("file://" + PAGE)
    pg.evaluate("document.fonts.ready")
    if errors:
        raise SystemExit("erreur JS : " + errors[0])
    return b, pg


build_page()
if MODE == "page":
    pass
elif MODE == "stills":
    os.makedirs(os.path.join(BUILD, "stills"), exist_ok=True)
    with sync_playwright() as p:
        b, pg = open_page(p)
        for t in [float(x) for x in sys.argv[3:]]:
            pg.evaluate(f"render({t})")
            pg.screenshot(path=os.path.join(BUILD, "stills", f"t{t:06.2f}.png"))
        b.close()
elif MODE == "events":
    with sync_playwright() as p:
        b, pg = open_page(p)
        ev = pg.evaluate("events()")
        b.close()
    json.dump(ev, open(os.path.join(BUILD, "events.json"), "w"), indent=1)
    print(len(ev["sfx"]), "bruitages")
else:
    total = json.load(open(os.path.join(BUILD, "timeline.json")))["total"]
    n = int(total * FPS)
    out = os.path.join(BUILD, "silent.mp4")
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    t0 = time.time()
    with sync_playwright() as p:
        b, pg = open_page(p)
        for i in range(n):
            pg.evaluate(f"render({i / FPS})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=95))
            if i % 300 == 0:
                print(f"{VID} image {i}/{n}  {time.time() - t0:.0f}s", flush=True)
        b.close()
    ff.stdin.close()
    ff.wait()
    print(VID, "rendu terminé", f"{time.time() - t0:.0f}s")
