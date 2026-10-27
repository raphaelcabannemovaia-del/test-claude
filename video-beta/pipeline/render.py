import json
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

BUILD = os.path.dirname(os.path.abspath(__file__))
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FPS = 30
TL = json.load(open(os.path.join(BUILD, "timeline.json")))
TOTAL = TL["total"]


def open_page(p):
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--disable-gpu"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    pg.goto("file://" + os.path.join(BUILD, "video.html"))
    pg.evaluate("document.fonts.ready")
    return b, pg


def stills(times):
    os.makedirs(os.path.join(BUILD, "stills"), exist_ok=True)
    with sync_playwright() as p:
        b, pg = open_page(p)
        for t in times:
            pg.evaluate(f"render({t})")
            pg.screenshot(path=os.path.join(BUILD, "stills", f"t{t:06.2f}.png"))
        b.close()


def full(out_silent):
    n = int(TOTAL * FPS)
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out_silent],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    t0 = time.time()
    with sync_playwright() as p:
        b, pg = open_page(p)
        for i in range(n):
            pg.evaluate(f"render({i / FPS})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=95))
            if i % 150 == 0:
                print(f"frame {i}/{n}  {time.time() - t0:.0f}s", flush=True)
        b.close()
    ff.stdin.close()
    ff.wait()
    print("done", out_silent, f"{time.time() - t0:.0f}s")


if __name__ == "__main__":
    if sys.argv[1] == "stills":
        stills([float(x) for x in sys.argv[2:]])
    else:
        full(sys.argv[2])
