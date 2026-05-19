import io
import ssl
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image


CANVAS_W = 1200
CANVAS_H = 630
GAP = 18
BG = (245, 247, 250)
SSL_CONTEXT = ssl._create_unverified_context()


def fetch_image(url: str) -> Image.Image:
  req = urllib.request.Request(
    url,
    headers={
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://www.coupang.com/",
    },
  )
  last_error = None
  for _ in range(3):
    try:
      with urllib.request.urlopen(req, timeout=20, context=SSL_CONTEXT) as response:
        data = response.read()
      return Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
      last_error = exc
      time.sleep(1)
  raise last_error


def cover_crop(image: Image.Image, width: int, height: int) -> Image.Image:
  src_w, src_h = image.size
  src_ratio = src_w / src_h
  dst_ratio = width / height

  if src_ratio > dst_ratio:
    new_h = height
    new_w = round(height * src_ratio)
  else:
    new_w = width
    new_h = round(width / src_ratio)

  resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
  left = max(0, (new_w - width) // 2)
  top = max(0, (new_h - height) // 2)
  return resized.crop((left, top, left + width, top + height))


def build_three_panel(urls: list[str], out_path: Path) -> None:
  canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), BG)
  panel_w = (CANVAS_W - (GAP * 4)) // 3
  panel_h = CANVAS_H - (GAP * 2)

  for idx, url in enumerate(urls[:3]):
    image = fetch_image(url)
    panel = cover_crop(image, panel_w, panel_h)
    x = GAP + idx * (panel_w + GAP)
    y = GAP
    canvas.paste(panel, (x, y))

  canvas.save(out_path, format="PNG", optimize=True)


def main(argv: list[str]) -> int:
  if len(argv) < 5:
    print("usage: python scripts/build-photo-thumbnail.py <output.png> <img1> <img2> <img3>", file=sys.stderr)
    return 1

  out_path = Path(argv[1])
  urls = argv[2:5]
  build_three_panel(urls, out_path)
  return 0


if __name__ == "__main__":
  raise SystemExit(main(sys.argv))
