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
  if url.startswith("/images/"):
    project_root = Path(__file__).resolve().parent.parent
    local_path = (project_root / url.lstrip("/")).resolve()
    images_root = (project_root / "images").resolve()
    if images_root not in local_path.parents:
      raise ValueError("Card image path leaves the images directory")
    return Image.open(local_path).convert("RGB")
  parsed = urlparse(url)
  if parsed.scheme == "file":
    local_path = Path(url2pathname(unquote(parsed.path)))
    return Image.open(local_path).convert("RGB")
  if parsed.scheme in ("http", "https"):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 CardRenderer/2.0"})
    with urlopen(request, timeout=15) as response:
      return Image.open(BytesIO(response.read())).convert("RGB")
  raise ValueError("Unsupported card image URL")


def load_source_image(urls):
  errors = []
  for url in urls:
    if not isinstance(url, str) or not url:
      continue
    try:
      return open_source_image(url)
    except Exception as error:
      errors.append(str(error))
  raise ValueError(f"No card image could be loaded: {'; '.join(errors)}")


def load_background(urls):
  source = load_source_image(urls)
  return ImageOps.fit(source, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)


def draw_centered_text(draw, text, box, font_path, fill, start_size,
                       min_size, max_lines, spacing_ratio=0.22):
  left, top, right, bottom = box
  font, wrapped, spacing = fit_text(
      draw, text, font_path, right - left, bottom - top,
      start_size=start_size, min_size=min_size, max_lines=max_lines,
  )
  spacing = max(8, round(font.size * spacing_ratio))
  bounds = draw.multiline_textbbox(
      (0, 0), wrapped, font=font, spacing=spacing, align="center"
  )
  width = bounds[2] - bounds[0]
  height = bounds[3] - bounds[1]
  x = left + (right - left - width) / 2 - bounds[0]
  y = top + (bottom - top - height) / 2 - bounds[1]
  draw.multiline_text(
      (x, y), wrapped, font=font, fill=fill, spacing=spacing, align="center"
  )


def validate_shopping_slide(slide):
  for field in ("hook", "productName", "imageUrls", "specs", "uses", "disclaimer"):
    value = slide.get(field)
    if value is None or value == "" or value == []:
      raise ValueError(f"shopping card missing {field}")
  if not isinstance(slide["specs"], list) or not 1 <= len(slide["specs"]) <= 3:
    raise ValueError("shopping card specs must contain 1 to 3 items")
  if not isinstance(slide["uses"], list) or not 1 <= len(slide["uses"]) <= 4:
    raise ValueError("shopping card uses must contain 1 to 4 items")


def render_shopping_slide(slide, index, font_path, output_file):
  validate_shopping_slide(slide)
  left_width = 720
  image = Image.new("RGB", (WIDTH, HEIGHT), "#faf9f6")
  draw = ImageDraw.Draw(image)

  draw.rectangle((left_width, 0, WIDTH, 675), fill="#191b2c")
  draw.rectangle((left_width, 675, WIDTH, HEIGHT), fill="#f1eee7")
  draw.line((left_width, 0, left_width, HEIGHT), fill="#ddd7cc", width=3)
  draw.line((left_width, 675, WIDTH, 675), fill="#d8d1c4", width=3)

  label_font = ImageFont.truetype(font_path, 26)
  small_font = ImageFont.truetype(font_path, 22)
  section_font = ImageFont.truetype(font_path, 35)
  draw.rounded_rectangle((44, 38, 258, 92), radius=27, fill="#f6c342")
  draw.text((67, 49), "GOLD PICK", font=label_font, fill="#17130a")
  draw.rounded_rectangle((WIDTH - 132, 34, WIDTH - 30, 82), radius=24, fill="#a7f3d0")
  draw.text((WIDTH - 104, 45), f"{index + 1}/3", font=small_font, fill="#064e3b")

  draw_centered_text(
      draw, slide["hook"], (40, 112, left_width - 40, 265), font_path,
      "#e56f00", 96, 54, 2,
  )
  draw_centered_text(
      draw, slide["productName"], (58, 270, left_width - 58, 365), font_path,
      "#34312d", 38, 24, 2,
  )

  source = load_source_image(slide.get("imageUrls") or [slide.get("imageUrl")])
  product = ImageOps.contain(source, (650, 760), method=Image.Resampling.LANCZOS)
  product_x = (left_width - product.width) // 2
  product_y = 390 + (760 - product.height) // 2
  image.paste(product, (product_x, product_y))

  draw_centered_text(
      draw, slide["disclaimer"], (48, 1235, left_width - 48, 1305), font_path,
      "#6f6a63", 25, 18, 2,
  )

  draw.text((754, 112), "핵심 스펙", font=section_font, fill="#ffffff")
  spec_top = 190
  for position, spec in enumerate(slide["specs"]):
    top = spec_top + position * 128
    draw.rounded_rectangle((752, top, 1048, top + 96), radius=20, fill="#2d3047")
    draw.ellipse((772, top + 29, 810, top + 67), fill="#a7f3d0")
    draw.text((781, top + 29), "✓", font=small_font, fill="#064e3b")
    draw_centered_text(
        draw, spec, (822, top + 12, 1032, top + 84), font_path,
        "#ffffff", 31, 22, 2,
    )

  draw.text((754, 734), "추천 용도", font=section_font, fill="#24211c")
  use_boxes = [
    (752, 810, 894, 995), (906, 810, 1048, 995),
    (752, 1008, 894, 1193), (906, 1008, 1048, 1193),
  ]
  for position, use in enumerate(slide["uses"]):
    box = use_boxes[position]
    draw.rounded_rectangle(box, radius=20, fill="#ffffff", outline="#ded7ca", width=2)
    icon = ("₩", "▣", "✓", "⚡")[position]
    icon_font = ImageFont.truetype(font_path, 42)
    icon_width = text_width(draw, icon, icon_font)
    draw.text(((box[0] + box[2] - icon_width) / 2, box[1] + 24), icon,
              font=icon_font, fill="#dc7a00")
    draw_centered_text(
        draw, use, (box[0] + 10, box[1] + 86, box[2] - 10, box[3] - 14),
        font_path, "#28241e", 25, 18, 2,
    )

  footer = ImageFont.truetype(font_path, 20)
  draw.text((754, 1283), "제품 옵션과 최신 가격은 본문에서 확인", font=footer, fill="#746d62")
  image.save(output_file, format="PNG", optimize=True)


def render_classic_slide(slide, index, font_path, output_file):
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


def render_slide(slide, index, font_path, output_file):
  if slide.get("template") == "shopping-grid":
    return render_shopping_slide(slide, index, font_path, output_file)
  return render_classic_slide(slide, index, font_path, output_file)


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
