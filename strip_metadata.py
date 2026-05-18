"""Strip metadata from EBC Logo&Video assets.

PNG/JPEG: PIL re-save without metadata
MP4:      ffmpeg -map_metadata -1 -c copy
"""
import subprocess
import sys
from pathlib import Path
from PIL import Image

SRC = Path(r"E:\EBC E.COLI BACTERIUM CLEAR FŰTHETŐ INTIMBETÉT\Logo&Video")
PUB = Path(r"E:\EBC E.COLI BACTERIUM CLEAR FŰTHETŐ INTIMBETÉT\WelnessClaude05.18.2026\code\web\public\brand")
CLEAN = SRC / "cleaned"
CLEAN.mkdir(exist_ok=True)


def list_png_metadata(path: Path):
    """Return all text/info entries in a PNG before stripping."""
    try:
        with Image.open(path) as im:
            info = dict(im.info)
            text = {}
            if hasattr(im, "text"):
                text = dict(im.text)
            return {**info, **text}
    except Exception as e:
        return {"_err": str(e)}


def strip_png(src: Path, dst: Path):
    with Image.open(src) as im:
        data = list(im.getdata())
        clean = Image.new(im.mode, im.size)
        clean.putdata(data)
        clean.save(dst, format="PNG", optimize=True)


def strip_jpeg(src: Path, dst: Path):
    with Image.open(src) as im:
        clean = Image.new(im.mode, im.size)
        clean.putdata(list(im.getdata()))
        clean.save(dst, format="JPEG", quality=95, optimize=True)


def strip_mp4(src: Path, dst: Path):
    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-map_metadata", "-1",
        "-map_chapters", "-1",
        "-c", "copy",
        str(dst),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  ffmpeg ERROR: {res.stderr[-500:]}", file=sys.stderr)


def process(src: Path):
    dst = CLEAN / src.name
    ext = src.suffix.lower()
    if ext == ".png":
        before = list_png_metadata(src)
        if before:
            print(f"  BEFORE meta: {list(before.keys())[:8]}")
        strip_png(src, dst)
        after = list_png_metadata(dst)
        print(f"  AFTER meta:  {list(after.keys())[:8]}")
    elif ext in (".jpg", ".jpeg"):
        strip_jpeg(src, dst)
    elif ext == ".mp4":
        strip_mp4(src, dst)
    else:
        print(f"  SKIP (unknown ext): {src.name}")
        return
    print(f"  {src.stat().st_size:>10,} -> {dst.stat().st_size:>10,} bytes")


print("=" * 60)
print(f"Processing {SRC}")
print("=" * 60)
for f in sorted(SRC.iterdir()):
    if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".mp4"):
        print(f"\n[{f.name}]")
        process(f)

# Update web/public/brand/ from cleaned/
print("\n" + "=" * 60)
print("Updating web/public/brand/")
print("=" * 60)
mapping = {
    "LuxusLogo.png":  "logo-luxus.png",
    "LuxusLogo.mp4":  "logo-luxus.mp4",
    "Lux2Bibor.png":  "logo-lux2bibor.png",
    "EBCLOGO.png":    "logo-original.png",
}
for src_name, dst_name in mapping.items():
    src = CLEAN / src_name
    dst = PUB / dst_name
    if src.exists():
        dst.write_bytes(src.read_bytes())
        print(f"  {src_name} -> public/brand/{dst_name}")

print("\nDone.")
