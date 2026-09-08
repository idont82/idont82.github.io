import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


WIDTH = 1200
HEIGHT = 900
MARGIN = 72
BACKGROUND = "#f5f2eb"
INK = "#17202a"
MUTED = "#5f6b76"
ACCENT = "#c68b2c"
CARD = "#ffffff"


def font(size, bold=False):
  filename = "malgunbd.ttf" if bold else "malgun.ttf"
  path = Path("C:/Windows/Fonts") / filename
  if path.exists():
    return ImageFont.truetype(str(path), size)
  return ImageFont.load_default(size=size)


def text_width(draw, text, selected_font):
  box = draw.textbbox((0, 0), text, font=selected_font)
  return box[2] - box[0]


def wrap_text(draw, text, selected_font, max_width):
  words = str(text).split()
  if not words:
    return []
  lines = []
  current = words[0]
  for word in words[1:]:
    candidate = f"{current} {word}"
    if text_width(draw, candidate, selected_font) <= max_width:
      current = candidate
    else:
      lines.append(current)
      current = word
  lines.append(current)

  fitted = []
  for line in lines:
    if text_width(draw, line, selected_font) <= max_width:
      fitted.append(line)
      continue
    fragment = ""
    for character in line:
      candidate = fragment + character
      if fragment and text_width(draw, candidate, selected_font) > max_width:
        fitted.append(fragment)
        fragment = character
      else:
        fragment = candidate
    if fragment:
      fitted.append(fragment)
  return fitted


def draw_wrapped(draw, position, text, selected_font, fill, max_width, line_gap=12):
  x, y = position
  line_height = selected_font.size + line_gap
  for line in wrap_text(draw, text, selected_font, max_width):
    draw.text((x, y), line, font=selected_font, fill=fill)
    y += line_height
  return y


def draw_header(draw, eyebrow, title):
  draw.rounded_rectangle((MARGIN, MARGIN, 292, 124), radius=26, fill=ACCENT)
  draw.text((MARGIN + 28, MARGIN + 13), eyebrow, font=font(28, True), fill="white")
  return draw_wrapped(draw, (MARGIN, 156), title, font(54, True), INK, WIDTH - (MARGIN * 2), 16)


def draw_bullet_list(draw, items, x, y, max_width, selected_font=None, bullet_color=ACCENT):
  selected_font = selected_font or font(34)
  for item in items:
    draw.ellipse((x, y + 13, x + 14, y + 27), fill=bullet_color)
    y = draw_wrapped(draw, (x + 34, y), item, selected_font, INK, max_width - 34, 12) + 18
  return y


def base_canvas():
  return Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)


def render_product(campaign, product_path):
  image = base_canvas()
  draw = ImageDraw.Draw(image)
  draw_header(draw, "GOLD PICK", "제품과 구성을 한눈에")
  draw.rounded_rectangle((MARGIN, 300, 650, 828), radius=34, fill=CARD)

  with Image.open(product_path) as source:
    product = ImageOps.exif_transpose(source).convert("RGB")
    product.thumbnail((490, 430), Image.Resampling.LANCZOS)
    product_x = 361 - (product.width // 2)
    product_y = 324 + ((430 - product.height) // 2)
    image.paste(product, (product_x, product_y))

  product_data = campaign["product"]
  y = draw_wrapped(draw, (710, 350), product_data["name"], font(42, True), INK, 418, 14)
  draw.text((710, y + 34), "작성 시점 표시 가격", font=font(25), fill=MUTED)
  draw.text((710, y + 80), product_data["price"], font=font(48, True), fill=ACCENT)
  draw_wrapped(
    draw,
    (710, y + 170),
    "옵션과 할인은 바뀔 수 있어요. 결제 화면에서 최종 구성을 확인하세요.",
    font(27),
    MUTED,
    418,
    12,
  )
  return image


def render_facts(campaign):
  image = base_canvas()
  draw = ImageDraw.Draw(image)
  y = draw_header(draw, "LABEL CHECK", "광고 문구보다 먼저 볼 공식 정보")
  top = max(300, y + 24)
  draw.rounded_rectangle((MARGIN, top, WIDTH - MARGIN, HEIGHT - MARGIN), radius=34, fill=CARD)
  end = draw_bullet_list(draw, campaign["officialFacts"], 124, top + 64, 950, font(36))
  if end > HEIGHT - 100:
    raise ValueError("Official facts overflow the image canvas.")
  return image


def render_checklist(campaign):
  image = base_canvas()
  draw = ImageDraw.Draw(image)
  draw_header(draw, "REVIEW CHECK", "후기에서 볼 장점과 주의점")
  left = (MARGIN, 300, 574, 828)
  right = (626, 300, WIDTH - MARGIN, 828)
  draw.rounded_rectangle(left, radius=34, fill=CARD)
  draw.rounded_rectangle(right, radius=34, fill=CARD)
  draw.text((112, 344), "자주 언급된 장점", font=font(34, True), fill=INK)
  left_y = draw_bullet_list(
    draw,
    campaign["reviewPatterns"]["positive"],
    112,
    410,
    414,
    font(28),
  )
  draw.text((666, 344), "구매 전 확인", font=font(34, True), fill=INK)
  right_items = campaign["reviewPatterns"]["caution"] + campaign["cautions"]
  right_y = draw_bullet_list(draw, right_items, 666, 410, 414, font(28), "#d45656")
  if max(left_y, right_y) > HEIGHT - 100:
    raise ValueError("Review checklist overflows the image canvas.")
  return image


def render_campaign(campaign_path, product_path, output_dir):
  campaign_path = Path(campaign_path)
  product_path = Path(product_path)
  output_dir = Path(output_dir)
  campaign = json.loads(campaign_path.read_text(encoding="utf-8"))
  output_dir.mkdir(parents=True, exist_ok=True)

  rendered = [
    ("01-product.png", render_product(campaign, product_path)),
    ("02-facts.png", render_facts(campaign)),
    ("03-checklist.png", render_checklist(campaign)),
  ]
  files = []
  for filename, image in rendered:
    output = output_dir / filename
    image.convert("RGB").save(output, format="PNG", optimize=True)
    files.append(output)
  return files


def main():
  parser = argparse.ArgumentParser(description="Render three Blogger health-product images.")
  parser.add_argument("--campaign", required=True, type=Path)
  parser.add_argument("--product", required=True, type=Path)
  parser.add_argument("--output", required=True, type=Path)
  args = parser.parse_args()
  for output in render_campaign(args.campaign, args.product, args.output):
    print(output)


if __name__ == "__main__":
  main()
