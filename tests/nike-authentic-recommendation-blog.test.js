const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pagePath = 'blog/nike-authentic-sneakers-recommendation-guide.html';
const authenticPattern = /국내\s*매장\s*정품|국내정품|백화점\s*정품|\[정품\]|나이키코리아/;

test('Nike authentic recommendation blog has SEO and affiliate disclosure', () => {
  const html = fs.readFileSync(pagePath, 'utf8');

  assert.match(html, /<html lang="ko">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /나이키 정품 운동화 추천/);
  assert.match(html, /<meta name="description" content="[^"]{50,160}">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/blog\/nike-authentic-sneakers-recommendation-guide\.html">/);
  assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.match(html, /og:image/);
  assert.match(html, /twitter:card" content="summary_large_image"/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /쿠팡 상품명에 정품 표기가 있는 후보만 골랐습니다/);
  assert.match(html, /정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요/);
  assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다\./);
  assert.match(html, /id=989908&amp;template=carousel&amp;trackingCode=AF7523287/);
  assert.match(html, /data-coupang-product-type="nike_authentic_recommendation"/);

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLd);
  assert.doesNotThrow(() => JSON.parse(jsonLd[1]));
});

test('Nike authentic recommendation blog exposes only explicitly authentic Nike product names', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const productNames = [...html.matchAll(/<h3>([^<]+)<\/h3>/g)]
    .map((match) => match[1])
    .filter((name) => /나이키|NIKE/.test(name));

  assert.ok(productNames.length >= 5, 'should list at least five Nike candidates');
  for (const name of productNames) {
    assert.match(name, authenticPattern, `missing authentic wording: ${name}`);
  }

  assert.match(html, /1순위[\s\S]*코트 비전/);
  assert.match(html, /2순위[\s\S]*레볼루션/);
  assert.match(html, /3순위[\s\S]*에어포스/);
});

test('Nike authentic recommendation blog is discoverable', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  assert.ok(index.includes('/blog/nike-authentic-sneakers-recommendation-guide.html'));
  assert.ok(sitemap.includes('https://idont82.github.io/blog/nike-authentic-sneakers-recommendation-guide.html'));
});
