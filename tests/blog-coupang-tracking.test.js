const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');

test('blog.js tracks Coupang affiliate clicks with placement metadata', () => {
  const script = read('blog/assets/blog.js');

  assert.match(script, /function trackCoupangClick/);
  assert.match(script, /\[data-coupang-link\]/);
  assert.match(script, /coupang_click/);
  assert.match(script, /coupang_placement/);
  assert.match(script, /coupang_product_type/);
});

test('chondroitin article has a mobile-first Coupang CTA after the summary', () => {
  const html = read('blog/yevester-porcine-chondroitin-1200.html');
  const summaryIndex = html.indexOf('article-summary-box');
  const mobileCtaIndex = html.indexOf('mobile-conversion-card');

  assert.ok(summaryIndex > -1, 'summary box should exist');
  assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
  assert.match(html, /data-coupang-link/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-product-type="chondroitin"/);
  assert.match(html, /현재 가격 확인하기/);
});

for (const file of [
  'blog/seoul-claw-machine-guide.html',
  'blog/hongdae-claw-tour.html'
]) {
  test(`${file} has mobile mini-claw Coupang CTA tracking`, () => {
    const html = read(file);
    const summaryIndex = html.indexOf('article-summary-box');
    const mobileCtaIndex = html.indexOf('mobile-conversion-card');

    assert.ok(summaryIndex > -1, 'summary box should exist');
    assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
    assert.match(html, /data-coupang-link/);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/);
    assert.match(html, /data-coupang-product-type="mini_claw"/);
    assert.match(html, /미니 인형뽑기 가격 보기/);
  });
}
