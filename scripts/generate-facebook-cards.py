#!/usr/bin/env python3
"""Render five Facebook card-news slides from generated JSON content."""

import argparse
import json
import os
import sys
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps


WIDTH = 1080
HEIGHT = 1350
MARGIN = 84
PALETTE = ("#17152f", "#38265f", "#194f5f", "#664021", "#5d2447")
FONT_CANDIDATES = (
    r"C:\Windows\Fonts\malgun.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
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
  if not text:
    return 0
  return draw.textbbox((0, 0), text, font=font)[2]


def wrap_text(draw, text, font, max_width):
  lines = []
  for paragraph in str(text).splitlines() or [""]:
    if not paragraph:
      lines.append("")
      continue
    current = ""
    for character in paragraph:
      candidate = current + character
      if current and text_width(draw, candidate, font) > max_width:
        lines.append(current.rstrip())
        current = character.lstrip() if character.isspace() else character
      else:
        current = candidate
    lines.append(current.rstrip())
  return "\n".join(lines)


def fit_text(draw, text, font_path, max_width, max_height, start_size, min_size,
             spacing_ratio=0.28):
  for size in range(start_size, min_size - 1, -2):
    font = ImageFont.truetype(font_path, size)
    spacing = max(8, round(size * spacing_ratio))
    wrapped = wrap_text(draw, text, font, max_width)
    box = draw.multiline_textbbox((0, 0), wrapped, font=font, spacing=spacing)
    if box[2] - box[0] <= max_width and box[3] - box[1] <= max_height:
      return font, wrapped, spacing
  preview = str(text).replace("\n", " ")[:80]
  raise ValueError(f"Text does not fit card: {preview}")


def cover_image(url):
  if not isinstance(url, str) or not url.startswith(("http://", "https://")):
    return None
  try:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 CardRenderer/1.0"})
    with urlopen(request, timeout=10) as response:
      source = Image.open(BytesIO(response.read())).convert("RGB")
    return ImageOps.fit(source, (WIDTH, 500), method=Image.Resampling.LANCZOS)
  except Exception:
    return None


def render_slide(slide, index, font_path, output_file):
  image = Image.new("RGB", (WIDTH, HEIGHT), PALETTE[index % len(PALETTE)])
  draw = ImageDraw.Draw(image)
  cover = cover_image(slide.get("imageUrl")) if index == 0 else None
  if cover:
    image.paste(cover, (0, 0))
    draw.rectangle((0, 360, WIDTH, 520), fill=PALETTE[0])

  label_font = ImageFont.truetype(font_path, 30)
  footer_font = ImageFont.truetype(font_path, 27)
  label_y = 72 if not cover else 408
  draw.rounded_rectangle(
      (MARGIN, label_y, MARGIN + 250, label_y + 54),
      radius=27,
      fill="#f6c85f",
  )
  draw.text(
      (MARGIN + 24, label_y + 9),
      str(slide.get("label", f"CARD {index + 1}"))[:18],
      font=label_font,
      fill="#17152f",
  )

  title_y = 560 if cover else 230
  title_height = 310 if cover else 350
  title_font, title, title_spacing = fit_text(
      draw,
      slide.get("title", ""),
      font_path,
      WIDTH - MARGIN * 2,
      title_height,
      72,
      38,
  )
  draw.multiline_text(
      (MARGIN, title_y), title, font=title_font, fill="#ffffff",
      spacing=title_spacing,
  )
  title_box = draw.multiline_textbbox(
      (MARGIN, title_y), title, font=title_font, spacing=title_spacing,
  )
  body_y = max(title_y + 230, title_box[3] + 54)
  body_bottom = HEIGHT - 150
  body_font, body, body_spacing = fit_text(
      draw,
      slide.get("body", ""),
      font_path,
      WIDTH - MARGIN * 2,
      body_bottom - body_y,
      42,
      27,
      spacing_ratio=0.38,
  )
  draw.multiline_text(
      (MARGIN, body_y), body, font=body_font, fill="#f4f0ff",
      spacing=body_spacing,
  )
  draw.text(
      (MARGIN, HEIGHT - 92),
      f"GOLD PICK · {index + 1}/5",
      font=footer_font,
      fill="#d9d2eb",
  )
  image.save(output_file, format="PNG", optimize=True)


def load_content(input_path):
  with input_path.open(encoding="utf-8") as source:
    content = json.load(source)
  slides = content.get("slides")
  if not isinstance(slides, list) or len(slides) != 5:
    raise ValueError("Card content must contain exactly five slides")
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

  manifest = {
      "id": content.get("id"),
      "cards": cards,
  }
  with (args.output_dir / "manifest.json").open("w", encoding="utf-8") as target:
    json.dump(manifest, target, ensure_ascii=False, indent=2)
    target.write("\n")


if __name__ == "__main__":
  try:
    main()
  except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
