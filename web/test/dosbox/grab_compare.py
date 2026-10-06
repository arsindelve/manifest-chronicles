"""Capture DOSBox's 640x480 frame and compare it with ours (raw RGB file). Prints the mismatch count."""
import os, subprocess, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from unscale import unscale
SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("CAPTURE_DIR", os.path.join(SP, "captures"))
os.makedirs(OUT, exist_ok=True)
ours_raw, name = sys.argv[1], sys.argv[2]
subprocess.run([sys.executable, os.path.join(SP, "grab.py"), "cmp_" + name], check=True, capture_output=True)
ref = unscale(os.path.join(OUT, "cmp_" + name + ".png"))
ours = Image.frombytes("RGB", (640, 480), open(ours_raw, "rb").read())
ref.save(os.path.join(OUT, f"{name}_ref.png")); ours.save(os.path.join(OUT, f"{name}_ours.png"))
rp, op = ref.load(), ours.load()
corner = lambda x, y: (x < 8 or x > 631) and (y < 8 or y > 471)
bad = [(x, y) for y in range(480) for x in range(640) if not corner(x, y) and rp[x, y] != op[x, y]]
if bad:
    diffimg = Image.new("RGB", (640, 480)); d = diffimg.load()
    for x, y in bad: d[x, y] = (255, 0, 255)
    diffimg.save(os.path.join(OUT, f"{name}_diff.png"))
print(len(bad), bad[:8])
