const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const pages = [
  'blog/lutein-omega3-home-shopping-guide.html',
  'blog/probiotics-home-shopping-guide.html',
  'blog/omega3-home-shopping-guide.html',
  'blog/dehumidifier-home-shopping-guide.html',
  'blog/cooling-pad-home-shopping-guide.html'
];

test('home-shopping blog pages expose SEO metadata and Coupang CTAs', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page} should have one h1`);
    assert.match(html, /<meta name="description"/, `${page} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page} should have canonical`);
    assert.match(html, /BlogPosting/, `${page} should have BlogPosting JSON-LD`);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/, `${page} should track mobile CTA clicks`);
    assert.match(html, /data-coupang-placement="product_card"/, `${page} should track product card clicks`);
    assert.match(html, /rel="sponsored nofollow"/, `${page} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동/, `${page} should disclose affiliate relationship`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page} should include JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${page} JSON-LD should parse`);
  }
});

test('home-shopping blog pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('blog/index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.ok(index.includes(`/${page}`), `blog index should link ${page}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${page}`), `sitemap should include ${page}`);
  }
});
