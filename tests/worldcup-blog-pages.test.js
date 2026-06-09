const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    file: 'blog/worldcup-korea-czech-2026.html',
    title: '한국 vs 체코',
    date: '2026.06.12',
    keyword: '월드컵 한국 체코',
    facts: ['3전 1승 1무 1패']
  },
  {
    file: 'blog/worldcup-korea-mexico-2026.html',
    title: '한국 vs 멕시코',
    date: '2026.06.19',
    keyword: '월드컵 한국 멕시코',
    facts: ['1998년 멕시코 3-1 승', '2018년 멕시코 2-1 승']
  },
  {
    file: 'blog/worldcup-korea-south-africa-2026.html',
    title: '한국 vs 남아공',
    date: '2026.06.25',
    keyword: '월드컵 한국 남아공',
    facts: ['월드컵 본선에서 직접 만난 기록이 없습니다']
  }
];

test('world cup match blog pages expose schedule, SEO metadata, and ads', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.file, 'utf8');

    assert.match(html, /<html lang="ko">/);
    assert.match(html, new RegExp(page.title));
    assert.match(html, new RegExp(page.date.replaceAll('.', '\\.')));
    assert.match(html, new RegExp(page.keyword));
    assert.match(html, /한국시간 기준/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.match(html, /"@type"\s*:\s*"BlogPosting"/);
    assert.match(html, /article-ad article-ad-frame-block/);
    assert.match(html, /쿠팡 파트너스 활동/);
    assert.match(html, /fifa\.com/);
    assert.match(html, /FIFA 랭킹/);
    assert.match(html, /월드컵 본선/);
    assert.match(html, /article-source-note/);
    for (const fact of page.facts) {
      assert.match(html, new RegExp(fact));
    }

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.file} should expose JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]));
  }
});

test('world cup match blog pages are discoverable from root home and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.match(index, new RegExp(`/${page.file}`));
    assert.match(sitemap, new RegExp(`https://idont82\\.github\\.io/${page.file}`));
  }
});

test('world cup pages use the standard article header and right rail', () => {
  const css = fs.readFileSync('blog/assets/style.css', 'utf8');

  assert.doesNotMatch(css, /\.blog-article-page\s+\.blog-mobile-bar\s*\{[\s\S]*?display\s*:\s*flex/);
  assert.match(css, /\.blog-layout,\s*\.blog-article-layout\s*\{[\s\S]*?grid-template-columns\s*:\s*260px minmax\(0, 1fr\) 320px/);

  for (const page of pages) {
    const html = fs.readFileSync(page.file, 'utf8');

    assert.match(html, /<div class="blog-brand">/);
    assert.match(html, /<nav class="blog-top-nav"/);
    assert.match(html, /<aside class="blog-sidebar blog-sidebar-right">/);
    assert.match(html, /추천 배너/);
  }
});
