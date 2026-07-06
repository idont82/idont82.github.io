const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    path: 'blog/neck-fan-summer-social-guide.html',
    keyword: '넥밴드 선풍기 추천',
    productType: 'social_neck_fan',
  },
  {
    path: 'blog/cooling-tshirt-summer-social-guide.html',
    keyword: '냉감 티셔츠 추천',
    productType: 'social_cooling_tshirt',
  },
  {
    path: 'blog/uv-umbrella-summer-social-guide.html',
    keyword: '양산 추천',
    productType: 'social_uv_umbrella',
  },
  {
    path: 'blog/mosquito-repellent-summer-social-guide.html',
    keyword: '모기 기피제 추천',
    productType: 'social_mosquito_repellent',
  },
  {
    path: 'blog/waterpark-waterproof-kit-social-guide.html',
    keyword: '워터파크 준비물 추천',
    productType: 'social_waterpark_kit',
  },
];

test('social season blog pages expose search-ready SEO metadata and affiliate placements', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page.path} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} should have one h1`);
    assert.match(html, new RegExp(page.keyword), `${page.path} should contain its main keyword`);
    assert.match(html, /<meta name="description"/, `${page.path} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page.path} should have canonical`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/, `${page.path} should be indexable`);
    assert.match(html, /og:image/, `${page.path} should expose a social thumbnail`);
    assert.match(html, /BlogPosting/, `${page.path} should have BlogPosting JSON-LD`);
    assert.match(html, /YouTube|Instagram|인스타|유튜브/, `${page.path} should preserve the social trend angle`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${page.path} should have the mobile top ad`);
    assert.match(html, /article-ad article-ad-frame-block/, `${page.path} should have an in-article ad block`);
    assert.match(html, /blog-sidebar blog-sidebar-right/, `${page.path} should have a right sidebar`);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/, `${page.path} should track mobile CTA clicks`);
    assert.match(html, /data-coupang-placement="product_card"/, `${page.path} should track product card clicks`);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`), `${page.path} should tag product type`);
    assert.match(html, /rel="sponsored nofollow"/, `${page.path} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료/, `${page.path} should disclose affiliate relationship`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.path} should include JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${page.path} JSON-LD should parse`);
  }
});

test('social season blog pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.ok(index.includes(`/${page.path}`), `blog index should link ${page.path}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${page.path}`), `sitemap should include ${page.path}`);
  }
});

test('mosquito repellent guide avoids medical overclaiming', () => {
  const html = fs.readFileSync('blog/mosquito-repellent-summer-social-guide.html', 'utf8');

  assert.match(html, /피부 자극|어린이|사용 시간/);
  assert.doesNotMatch(html, /완벽 차단|감염 예방 보장|100%/);
});
