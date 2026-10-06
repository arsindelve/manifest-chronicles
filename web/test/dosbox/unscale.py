"""Rebuild the native 640x480 frame from a nearest-neighbour upscaled DOSBox capture."""
import sys
from PIL import Image
def unscale(path, W=640, H=480):
    im = Image.open(path).convert("RGB"); sw, sh = im.size
    px = im.load(); out = Image.new("RGB", (W, H)); o = out.load()
    for y in range(H):
        sy = int((y + 0.5) * sh / H)
        for x in range(W):
            o[x, y] = px[int((x + 0.5) * sw / W), sy]
    return out
if __name__ == "__main__":
    out = unscale(sys.argv[1]); out.save(sys.argv[2])
    print(out.size, sorted(out.getcolors(1 << 16), reverse=True)[:6])
