#!/usr/bin/env python3
"""Render three full-photo Facebook card-news slides."""

import argparse
import json
import os
import sys
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urlparse
from urllib.request import Request, url2pathname, urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps


WIDTH = 1080
HEIGHT = 1350
MARGIN = 76
BAND_TOP = 470
BAND_BOTTOM = 880
FONT_CANDIDATES = (
    r"C:\Windows\Fonts\malgunbd.ttf",
    r"C:\Windows\Fonts\malgun.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
)


def resolve_font():
  override = os.environ.get("FACEBOOK_CARD_FONT")
  candidates = (override,) + FONT_CANDIDATES if override else FONT_CANDIDATES
  for candidate in candidates:
    if candidate and Path(candidate).is_file():
      return candidate
  raise FileNotFoundError(
      "No Korean card font found. Set FACEBOOK_CARD_FONT to a TTF or TTC file."
  )


def text_width(draw, text, font):
  return draw.textbbox((0, 0), text, font=font)[2] if text else 0


def wrap_text(draw, text, font, max_width):
  lines = []
  for paragraph in str(text).splitlines() or [""]:
    current = ""
    for character in paragraph:
      candidate = current + character
      if current and text_width(draw, candidate, font) > max_width:
        lines.append(current.rstrip())
        current = character.lstrip() if character.isspace() else character
      else:
        current = candidate
    lines.append(current.rstrip())
  return lines


def fit_text(draw, text, font_path, max_width, max_height, start_size=86,
             min_size=58, max_lines=2):
  for size in range(start_size, min_size - 1, -2):
    font = ImageFont.truetype(font_path, size)
    spacing = max(12, round(size * 0.28))
    lines = wrap_text(draw, text, font, max_width)
    wrapped = "\n".join(lines)
    box = draw.multiline_textbbox(
        (0, 0), wrapped, font=font, spacing=spacing, align="center"
    )
    if len(lines) <= max_lines and box[3] - box[1] <= max_height:
      return font, wrapped, spacing
  preview = str(text).replace("\n", " ")[:80]
  raise ValueError(f"Text does not fit card in two lines: {preview}")


def open_source_image(url):
  parsed = urlparse(url)
  if parsed.scheme == "file":
    local_path = Path(url2pathname(unquote(parsed.path)))
    return Image.open(local_path).convert("RGB")
  if parsed.scheme in ("http", "https"):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 CardRenderer/2.0"})
    with urlopen(request, timeout=15) as response:
      return Image.open(BytesIO(response.read())).convert("RGB")
  raise ValueError("Unsupported card image URL")


def load_background(urls):
  errors = []
  for url in urls:
    if not isinstance(url, str) or not url:
      continue
    try:
      source = open_source_image(url)
      return ImageOps.fit(source, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)
    except Exception as error:
      errors.append(str(error))
  raise ValueError(f"No card image could be loaded: {'; '.join(errors)}")


def render_slide(slide, index, font_path, output_file):
  candidates = slide.get("imageUrls") or [slide.get("imageUrl")]
  image = load_background(candidates).convert("RGBA")
  overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
  overlay_draw = ImageDraw.Draw(overlay)
  overlay_draw.rectangle((0, BAND_TOP, WIDTH, BAND_BOTTOM), fill=(0, 0, 0, 168))
  image = Image.alpha_composite(image, overlay)
  draw = ImageDraw.Draw(image)

  label_font = ImageFont.truetype(font_path, 30)
  footer_font = ImageFont.truetype(font_path, 26)
  draw.rounded_rectangle((MARGIN, 70, MARGIN + 230, 126), radius=28, fill="#f6c85f")
  draw.text((MARGIN + 24, 80), "GOLD PICK", font=label_font, fill="#17152f")

  title_font, title, spacing = fit_text(
      draw, slide.get("title", ""), font_path, WIDTH - MARGIN * 2, 240
  )
  box = draw.multiline_textbbox(
      (0, 0), title, font=title_font, spacing=spacing, align="center"
  )
  title_width = box[2] - box[0]
  title_height = box[3] - box[1]
  title_x = (WIDTH - title_width) / 2
  title_y = BAND_TOP + (BAND_BOTTOM - BAND_TOP - title_height) / 2 - box[1]
  draw.multiline_text(
      (title_x, title_y), title, font=title_font, fill="#ffffff",
      spacing=spacing, align="center", stroke_width=1, stroke_fill="#000000",
  )
  footer = f"GOLD PICK · {index + 1}/3"
  footer_width = text_width(draw, footer, footer_font)
  draw.text(
      ((WIDTH - footer_width) / 2, HEIGHT - 72), footer,
      font=footer_font, fill="#ffffff", stroke_width=1, stroke_fill="#000000",
  )
  image.convert("RGB").save(output_file, format="PNG", optimize=True)


def load_content(input_path):
  with input_path.open(encoding="utf-8") as source:
    content = json.load(source)
  slides = content.get("slides")
  if not isinstance(slides, list) or len(slides) != 3:
    raise ValueError("Card content must contain exactly three slides")
  return content


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--input", required=True, type=Path)
  parser.add_argument("--output-dir", required=True, type=Path)
  args = parser.parse_args()

  content = load_content(args.input)
  font_path = resolve_font()
  args.output_dir.mkdir(parents=True, exist_ok=True)
  cards = []
  for index, slide in enumerate(content["slides"]):
    output_file = (args.output_dir / f"{index + 1:02d}.png").resolve()
    render_slide(slide, index, font_path, output_file)
    cards.append(str(output_file))

  manifest = {"id": content.get("id"), "cards": cards}
  with (args.output_dir / "manifest.json").open("w", encoding="utf-8") as target:
    json.dump(manifest, target, ensure_ascii=False, indent=2)
    target.write("\n")


if __name__ == "__main__":
  try:
    main()
  except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
