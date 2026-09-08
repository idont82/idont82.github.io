import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "render-blogger-health-images.py"


def load_renderer():
  spec = importlib.util.spec_from_file_location("blogger_renderer", SCRIPT)
  module = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(module)
  return module


class BloggerHealthImageRendererTest(unittest.TestCase):
  def test_renders_three_edge_safe_rgb_images(self):
    renderer = load_renderer()
    with tempfile.TemporaryDirectory() as temp_dir:
      temp = Path(temp_dir)
      product_path = temp / "product.png"
      Image.new("RGB", (512, 512), "#b7d9cc").save(product_path)
      campaign = {
        "product": {"name": "프리미엄 오메가3 90캡슐", "price": "39,900원"},
        "officialFacts": [
          "건강기능식품 표시 확인",
          "EPA 및 DHA 합계 함량 비교",
          "하루 섭취량과 총 캡슐 수 확인",
        ],
        "reviewPatterns": {
          "positive": ["개별 포장이라 보관이 편하다는 의견"],
          "caution": ["향과 캡슐 크기는 개인차가 큼"],
        },
        "cautions": ["의약품 복용 중이라면 전문가와 상의하세요."],
      }
      campaign_path = temp / "campaign.json"
      campaign_path.write_text(json.dumps(campaign, ensure_ascii=False), encoding="utf-8")
      output_dir = temp / "output"

      files = renderer.render_campaign(campaign_path, product_path, output_dir)

      self.assertEqual(
        [path.name for path in files],
        ["01-product.png", "02-facts.png", "03-checklist.png"],
      )
      for output in files:
        with Image.open(output) as image:
          self.assertEqual(image.size, (1200, 900))
          self.assertEqual(image.mode, "RGB")
          background = Image.new("RGB", image.size, image.getpixel((0, 0)))
          bounds = ImageChops.difference(image, background).getbbox()
          self.assertIsNotNone(bounds)
          self.assertGreaterEqual(bounds[0], 32)
          self.assertGreaterEqual(bounds[1], 32)
          self.assertLessEqual(bounds[2], 1168)
          self.assertLessEqual(bounds[3], 868)


if __name__ == "__main__":
  unittest.main()
