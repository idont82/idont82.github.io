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
SAFE_EDGE = 44
HYBRID_ROLES = ("lifestyle-hook", "product-proof", "fit-action")
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
  line_label = "line" if max_lines == 1 else "lines"
  raise ValueError(f"Text does not fit card in {max_lines} {line_label}: {preview}")


def open_source_image(url):
  if url.startswith("/images/"):
    project_root = Path(__file__).resolve().parent.parent
    local_path = (project_root / url.lstrip("/")).resolve()
    images_root = (project_root / "images").resolve()
    if images_root not in local_path.parents:
      raise ValueError("Card image path leaves the images directory")
    return Image.open(local_path).convert("RGBA")
  parsed = urlparse(url)
  if parsed.scheme == "file":
    local_path = Path(url2pathname(unquote(parsed.path)))
    return Image.open(local_path).convert("RGBA")
  if parsed.scheme in ("http", "https"):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 CardRenderer/2.0"})
    with urlopen(request, timeout=15) as response:
      return Image.open(BytesIO(response.read())).convert("RGBA")
  raise ValueError("Unsupported card image URL")


def load_source_image(urls, description):
  errors = []
  for url in urls:
    if not isinstance(url, str) or not url:
      continue
    try:
      return open_source_image(url)
    except Exception as error:
      errors.append(str(error))
  raise ValueError(f"No {description} could be loaded: {'; '.join(errors)}")


def load_background(urls):
  source = load_source_image(urls, "card image")
  return ImageOps.fit(
      source, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS
  ).convert("RGB")


def require_text(slide, field, role):
  value = slide.get(field)
  if not isinstance(value, str) or not value.strip():
    raise ValueError(f"{role} missing {field}")
  return value.strip()


def require_image_urls(slide, field, role):
  value = slide.get(field)
  if not isinstance(value, list) or not any(
      isinstance(url, str) and url for url in value
  ):
    raise ValueError(f"{role} missing {field}")
  return value


def validate_lifestyle_slide(slide):
  role = slide.get("role")
  if role not in HYBRID_ROLES:
    raise ValueError(f"Invalid lifestyle-hybrid role: {role}")
  require_text(slide, "productName", role)
  require_image_urls(slide, "productImageUrls", role)
  if role == "lifestyle-hook":
    require_text(slide, "headline", role)
    require_image_urls(slide, "lifestyleImageUrls", role)
    require_text(slide, "priceBand", role)
    disclosure = slide.get("disclosure")
    if not isinstance(disclosure, str) or not disclosure.strip():
      raise ValueError("lifestyle hook missing disclosure")
    if disclosure != "AI 연출 이미지":
      raise ValueError("lifestyle hook disclosure must equal AI 연출 이미지")
  elif role == "product-proof":
    require_text(slide, "priceBand", role)
    specs = slide.get("specs")
    if not isinstance(specs, list) or len(specs) != 3 or any(
        not isinstance(spec, str) or not spec.strip() for spec in specs
    ):
      raise ValueError("product-proof requires exactly 3 specs")
    require_text(slide, "disclaimer", role)
  else:
    require_text(slide, "sectionTitle", "fit action")
    fits = slide.get("fits")
    if not isinstance(fits, list) or not 1 <= len(fits) <= 3 or any(
        not isinstance(fit, str) or not fit.strip() for fit in fits
    ):
      raise ValueError("fit-action requires 1-3 fits")
    require_text(slide, "caution", role)
    require_text(slide, "cta", role)


def validate_content(content):
  slides = content["slides"]
  hybrid_slides = [slide for slide in slides if slide.get("template") == "lifestyle-hybrid"]
  if not hybrid_slides:
    return
  if len(hybrid_slides) != 3:
    raise ValueError("lifestyle-hybrid content must contain exactly three role slides")
  for slide in hybrid_slides:
    validate_lifestyle_slide(slide)
  roles = [slide.get("role") for slide in hybrid_slides]
  if set(roles) != set(HYBRID_ROLES) or len(set(roles)) != 3:
    raise ValueError("lifestyle-hybrid slides must use each required role exactly once")
  if tuple(roles) != HYBRID_ROLES:
    raise ValueError(
        "lifestyle cards must be ordered lifestyle-hook, product-proof, fit-action"
    )


def draw_centered_fitted_text(draw, text, font_path, box, fill, start_size=58,
                              min_size=24, max_lines=2, stroke_width=0,
                              stroke_fill=None):
  left, top, right, bottom = box
  font, wrapped, spacing = fit_text(
      draw, text, font_path, right - left, bottom - top, start_size,
      min_size, max_lines,
  )
  text_box = draw.multiline_textbbox(
      (0, 0), wrapped, font=font, spacing=spacing, align="center"
  )
  text_width_value = text_box[2] - text_box[0]
  text_height = text_box[3] - text_box[1]
  draw.multiline_text(
      (left + (right - left - text_width_value) / 2,
       top + (bottom - top - text_height) / 2 - text_box[1]),
      wrapped, font=font, fill=fill, spacing=spacing, align="center",
      stroke_width=stroke_width, stroke_fill=stroke_fill,
  )


def draw_gold_pick_badge(draw, font_path, x=MARGIN, y=70):
  font = ImageFont.truetype(font_path, 30)
  draw.rounded_rectangle((x, y, x + 230, y + 56), radius=28, fill="#f6c85f")
  draw.text((x + 24, y + 10), "GOLD PICK", font=font, fill="#17152f")


def draw_counter(draw, font_path, index, fill="#ffffff", y=1272):
  font = ImageFont.truetype(font_path, 26)
  counter = f"{index + 1}/3"
  draw.text(
      (WIDTH - MARGIN - text_width(draw, counter, font), y), counter,
      font=font, fill=fill,
  )


def paste_contained_product(image, urls, box):
  left, top, right, bottom = box
  if left < SAFE_EDGE or top < SAFE_EDGE or right > WIDTH - SAFE_EDGE or bottom > HEIGHT - SAFE_EDGE:
    raise ValueError("Product placement must keep at least 44px edge safety")
  source = load_source_image(urls, "product image")
  contained = ImageOps.contain(
      source, (right - left, bottom - top), method=Image.Resampling.LANCZOS
  ).convert("RGBA")
  x = left + (right - left - contained.width) // 2
  y = top + (bottom - top - contained.height) // 2
  image.alpha_composite(contained, (x, y))


def render_lifestyle_hook(slide, index, font_path, output_file):
  image = load_background(slide["lifestyleImageUrls"]).convert("RGBA")
  overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
  overlay_draw = ImageDraw.Draw(overlay)
  overlay_draw.rectangle((0, 920, WIDTH, HEIGHT), fill=(18, 24, 38, 255))
  image = Image.alpha_composite(image, overlay)
  draw = ImageDraw.Draw(image)
  draw_gold_pick_badge(draw, font_path)
  disclosure_font = ImageFont.truetype(font_path, 24)
  disclosure = slide["disclosure"]
  disclosure_width = text_width(draw, disclosure, disclosure_font)
  disclosure_x = WIDTH - SAFE_EDGE - disclosure_width - 24
  draw.rounded_rectangle(
      (disclosure_x, SAFE_EDGE, WIDTH - SAFE_EDGE, SAFE_EDGE + 44),
      radius=22, fill=(0, 0, 0, 150)
  )
  draw.text(
      (disclosure_x + 12, SAFE_EDGE + 7), disclosure,
      font=disclosure_font, fill="#ffffff"
  )
  draw_centered_fitted_text(
      draw, slide["headline"], font_path, (MARGIN, 932, WIDTH - MARGIN, 1018),
      "#ffffff", start_size=48, min_size=28, max_lines=2,
  )
  panel = (60, 1040, WIDTH - 60, 1282)
  draw.rounded_rectangle(panel, radius=28, fill="#ffffff")
  paste_contained_product(image, slide["productImageUrls"], (86, 1064, 328, 1258))
  draw_centered_fitted_text(
      draw, slide["productName"], font_path, (370, 1070, WIDTH - 88, 1140),
      "#17152f", start_size=38, min_size=22, max_lines=2,
  )
  draw_centered_fitted_text(
      draw, slide["priceBand"], font_path, (370, 1150, WIDTH - 88, 1220),
      "#5d6471", start_size=34, min_size=20, max_lines=2,
  )
  draw_counter(draw, font_path, index, y=1272)
  image.convert("RGB").save(output_file, format="PNG", optimize=True)


def render_product_proof(slide, index, font_path, output_file):
  image = Image.new("RGBA", (WIDTH, HEIGHT), "#f3f0ea")
  draw = ImageDraw.Draw(image)
  draw_gold_pick_badge(draw, font_path)
  paste_contained_product(image, slide["productImageUrls"], (150, 140, 930, 620))
  draw_centered_fitted_text(
      draw, slide["productName"], font_path, (MARGIN, 654, WIDTH - MARGIN, 718),
      "#17152f", start_size=46, min_size=28, max_lines=1,
  )
  draw_centered_fitted_text(
      draw, slide["priceBand"], font_path, (MARGIN, 730, WIDTH - MARGIN, 786),
      "#66616b", start_size=32, min_size=22, max_lines=1,
  )
  specs = slide["specs"]
  gap = 18
  box_width = (WIDTH - MARGIN * 2 - gap * 2) // 3
  for spec_index, spec in enumerate(specs):
    left = MARGIN + spec_index * (box_width + gap)
    right = left + box_width
    draw.rounded_rectangle((left, 844, right, 1018), radius=22, fill="#ffffff")
    draw_centered_fitted_text(
        draw, spec, font_path, (left + 16, 878, right - 16, 984), "#242434",
        start_size=34, min_size=20, max_lines=2,
    )
  draw_centered_fitted_text(
      draw, slide["disclaimer"], font_path, (MARGIN, 1200, WIDTH - MARGIN, 1250),
      "#716d74", start_size=28, min_size=20, max_lines=1,
  )
  draw_counter(draw, font_path, index, fill="#5d5962", y=1272)
  image.convert("RGB").save(output_file, format="PNG", optimize=True)


def render_fit_action(slide, index, font_path, output_file):
  image = Image.new("RGBA", (WIDTH, HEIGHT), "#121820")
  draw = ImageDraw.Draw(image)
  draw_gold_pick_badge(draw, font_path)
  paste_contained_product(image, slide["productImageUrls"], (500, 116, 1000, 574))
  draw_centered_fitted_text(
      draw, slide["productName"], font_path, (MARGIN, 188, 510, 300), "#ffffff",
      start_size=42, min_size=26, max_lines=1,
  )
  draw_centered_fitted_text(
      draw, slide["sectionTitle"], font_path, (MARGIN, 616, WIDTH - MARGIN, 690),
      "#f6c85f", start_size=34, min_size=22, max_lines=2,
  )
  for fit_index, fit in enumerate(slide["fits"]):
    top = 710 + fit_index * 104
    draw.rounded_rectangle((MARGIN, top, WIDTH - MARGIN, top + 74), radius=37,
                           fill="#263343")
    draw_centered_fitted_text(
        draw, fit, font_path, (MARGIN + 24, top + 10, WIDTH - MARGIN - 24, top + 64),
        "#ffffff", start_size=30, min_size=20, max_lines=1,
    )
  draw.rounded_rectangle((MARGIN, 1030, WIDTH - MARGIN, 1122), radius=20,
                         fill="#463a28")
  draw_centered_fitted_text(
      draw, slide["caution"], font_path, (MARGIN + 22, 1046, WIDTH - MARGIN - 22, 1106),
      "#ffe0a0", start_size=28, min_size=19, max_lines=2,
  )
  draw.rounded_rectangle((MARGIN, 1160, WIDTH - MARGIN, 1264), radius=24,
                         fill="#f6c85f")
  draw_centered_fitted_text(
      draw, slide["cta"], font_path, (MARGIN + 24, 1178, WIDTH - MARGIN - 24, 1248),
      "#17152f", start_size=38, min_size=24, max_lines=1,
  )
  draw_counter(draw, font_path, index, y=1272)
  image.convert("RGB").save(output_file, format="PNG", optimize=True)


def render_slide(slide, index, font_path, output_file):
  if slide.get("template") == "lifestyle-hybrid":
    role = slide["role"]
    if role == "lifestyle-hook":
      return render_lifestyle_hook(slide, index, font_path, output_file)
    if role == "product-proof":
      return render_product_proof(slide, index, font_path, output_file)
    if role == "fit-action":
      return render_fit_action(slide, index, font_path, output_file)
    raise ValueError(f"Invalid lifestyle-hybrid role: {role}")
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
  validate_content(content)
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
