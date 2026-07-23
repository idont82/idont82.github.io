const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  ['blog/waterproof-phone-pouch-late-july-guide.html', '방수팩 추천', 'late_july_waterproof_pouch'],
  ['blog/cooler-bag-ice-box-late-july-guide.html', '보냉백 아이스박스 추천', 'late_july_cooler_bag'],
  ['blog/car-sunshade-late-july-guide.html', '차량용 햇빛가리개 추천', 'late_july_car_sunshade'],
  ['blog/food-waste-odor-control-late-july-guide.html', '음식물쓰레기 냄새 차단', 'late_july_food_waste_odor'],
  ['blog/mold-remover-moisture-absorber-late-july-guide.html', '장마철 제습제 곰팡이 제거제', 'late_july_mold_dehumidifier'],
  ['blog/nike-air-force-1-review-popular-guide.html', '나이키 에어포스 1 후기', 'nike_air_force_1_review'],
  ['blog/nike-air-max-review-popular-guide.html', '나이키 에어맥스 후기', 'nike_air_max_review'],
  ['blog/nike-court-vision-review-popular-guide.html', '나이키 코트 비전 후기', 'nike_court_vision_review'],
  ['blog/nike-revolution-review-popular-guide.html', '나이키 레볼루션 후기', 'nike_revolution_review'],
  ['blog/nike-dunk-low-review-popular-guide.html', '나이키 덩크 로우 후기', 'nike_dunk_low_review'],
];

test('late July product blog pages expose SEO and Coupang conversion surfaces', () => {
  for (const [pagePath, keyword, productType] of pages) {
    const html = fs.readFileSync(pagePath, 'utf8');

    assert.match(html, /<html lang="ko">/, `${pagePath} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${pagePath} should have one h1`);
    assert.match(html, new RegExp(keyword), `${pagePath} should contain its target keyword`);
    assert.match(html, /<meta name="description" content="[^"]{50,160}">/, `${pagePath} should have a useful description`);
    assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/blog\//, `${pagePath} should have canonical`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/, `${pagePath} should be indexable`);
    assert.match(html, /og:image/, `${pagePath} should expose social image`);
    assert.match(html, /twitter:card" content="summary_large_image"/, `${pagePath} should expose large twitter card`);
    assert.match(html, /BlogPosting/, `${pagePath} should have BlogPosting JSON-LD`);
    assert.match(html, /2026-07-23/, `${pagePath} should use current publish date`);
    assert.match(html, /blog-sidebar blog-sidebar-right/, `${pagePath} should have right rail ad`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${pagePath} should have mobile ad`);
    assert.match(html, /id=989908&amp;template=carousel&amp;trackingCode=AF7523287/, `${pagePath} should embed Coupang carousel`);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/, `${pagePath} should track mobile summary CTA`);
    assert.match(html, /data-coupang-placement="product_card"/, `${pagePath} should track product cards`);
    assert.match(html, new RegExp(`data-coupang-product-type="${productType}"`), `${pagePath} should tag product type`);
    assert.match(html, /rel="sponsored nofollow"/, `${pagePath} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다\./, `${pagePath} should disclose affiliate relationship`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${pagePath} should include JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${pagePath} JSON-LD should parse`);
  }
});

test('late July product pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const [pagePath] of pages) {
    assert.ok(index.includes(`/${pagePath}`), `index should link ${pagePath}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${pagePath}`), `sitemap should include ${pagePath}`);
  }
});

test('Nike review pages avoid pretending to own verified review counts', () => {
  for (const [pagePath] of pages.filter(([pagePath]) => pagePath.includes('/nike-'))) {
    const html = fs.readFileSync(pagePath, 'utf8');

    assert.match(html, /후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요/);
    assert.doesNotMatch(html, /리뷰\s*\d+만|후기\s*\d+개|판매량\s*1위|공식 인증 최저가/);
  }
});

test('Nike review pages only expose Coupang candidates with explicit authentic wording', () => {
  const authenticPattern = /국내\s*매장\s*정품|국내정품|백화점\s*정품|\[정품\]|나이키코리아/;

  for (const [pagePath] of pages.filter(([pagePath]) => pagePath.includes('/nike-'))) {
    const html = fs.readFileSync(pagePath, 'utf8');
    const names = [...html.matchAll(/<h3>([^<]+)<\/h3>/g)]
      .map((match) => match[1])
      .filter((name) => /나이키|NIKE/.test(name));

    assert.ok(names.length > 0, `${pagePath} should render Nike product names`);
    assert.match(html, /쿠팡 상품명에 정품 표기가 있는 후보만 골랐습니다/);
    assert.match(html, /정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요/);

    for (const name of names) {
      assert.match(name, authenticPattern, `${pagePath} product should have explicit authentic wording: ${name}`);
      assert.doesNotMatch(name.replace(/증정품/g, ''), /가품|레플리카|스타일|st\b/i);
    }
  }
});
