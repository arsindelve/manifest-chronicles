"""Capture the client area of *our* DOSBox window (by process image dosbox.exe, never the user's
dosbox_with_debugger session), or the one whose process id is in DOSBOX_PID, with PrintWindow, which works even when the window is covered."""
import ctypes, os, sys
from ctypes import wintypes
from PIL import Image
SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("CAPTURE_DIR", os.path.join(SP, "captures"))
u = ctypes.WinDLL("user32"); g = ctypes.WinDLL("gdi32"); k = ctypes.WinDLL("kernel32")
u.SetProcessDPIAware()
found = []
@ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
def cb(h, _):
    c = ctypes.create_unicode_buffer(64); u.GetClassNameW(h, c, 64)
    if c.value == "SDL_app":
        pid = wintypes.DWORD(); u.GetWindowThreadProcessId(h, ctypes.byref(pid))
        hp = k.OpenProcess(0x1000, False, pid.value); buf = ctypes.create_unicode_buffer(512); sz = wintypes.DWORD(512)
        if os.environ.get("DOSBOX_PID"):
            if pid.value == int(os.environ["DOSBOX_PID"]):
                found.append(h)
        elif hp and k.QueryFullProcessImageNameW(hp, 0, buf, ctypes.byref(sz)) and buf.value.lower().endswith(r"\dosbox.exe"):
            found.append(h)
    return True
u.EnumWindows(cb, 0)
if not found: sys.exit("our DOSBox window not found")
h = found[0]
r = wintypes.RECT(); u.GetClientRect(h, ctypes.byref(r)); w, hgt = r.right, r.bottom
hdc = u.GetDC(h); mdc = g.CreateCompatibleDC(hdc); bmp = g.CreateCompatibleBitmap(hdc, w, hgt); g.SelectObject(mdc, bmp)
ok = u.PrintWindow(h, mdc, 3)  # PW_CLIENTONLY | PW_RENDERFULLCONTENT
class BMI(ctypes.Structure):
    _fields_ = [("biSize", wintypes.DWORD), ("biWidth", wintypes.LONG), ("biHeight", wintypes.LONG), ("biPlanes", wintypes.WORD),
                ("biBitCount", wintypes.WORD), ("biCompression", wintypes.DWORD), ("biSizeImage", wintypes.DWORD),
                ("biXPelsPerMeter", wintypes.LONG), ("biYPelsPerMeter", wintypes.LONG), ("biClrUsed", wintypes.DWORD), ("biClrImportant", wintypes.DWORD)]
bmi = BMI(ctypes.sizeof(BMI), w, -hgt, 1, 32, 0, 0, 0, 0, 0, 0)
data = ctypes.create_string_buffer(w * hgt * 4)
g.GetDIBits(mdc, bmp, 0, hgt, data, ctypes.byref(bmi), 0)
g.DeleteObject(bmp); g.DeleteDC(mdc); u.ReleaseDC(h, hdc)
img = Image.frombuffer("RGBA", (w, hgt), data, "raw", "BGRA", 0, 1).convert("RGB")
dst = os.path.join(OUT, sys.argv[1] + ".png"); os.makedirs(os.path.dirname(dst), exist_ok=True)
img.save(dst); print(dst, img.size, "printwindow", ok, len(img.getcolors(1 << 20) or []), "colours")
