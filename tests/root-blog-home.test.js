const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('root index is the canonical blog home', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/idont82\.github\.io\/">/);
  assert.match(html, /<link rel="stylesheet" href="\/blog\/assets\/style\.css">/);
  assert.match(html, /<script defer src="\/blog\/assets\/blog\.js"><\/script>/);
  assert.match(html, /"@type": "Blog"/);
  assert.match(html, /"url": "https:\/\/idont82\.github\.io\/"/);
  assert.match(html, /\/blog\/hongdae-claw-tour\.html/);
  assert.doesNotMatch(html, /\/search\/assets\/style\.css/);

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLd, 'root blog home should expose JSON-LD');
  assert.doesNotThrow(() => JSON.parse(jsonLd[1]));
});

test('legacy blog index redirects to root blog home', () => {
  const html = fs.readFileSync('blog/index.html', 'utf8');

  assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/">/);
  assert.match(html, /<meta http-equiv="refresh" content="0; url=\/">/);
  assert.match(html, /location\.replace\('\/'\)/);
  assert.doesNotMatch(html, /"@type": "Blog"/);
});

test('root blog home prioritizes claw tour articles', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const cardLinks = [...html.matchAll(/<article class="blog-card"[\s\S]*?<a href="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(cardLinks.slice(0, 4), [
    '/blog/jongro-claw-tour.html',
    '/blog/yeonsinnae-claw-tour.html',
    '/blog/seoul-claw-machine-guide.html',
    '/blog/hongdae-claw-tour.html'
  ]);
});

test('root blog home keeps recent posts compact with an expand control', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const recentMatch = html.match(/<div class="blog-mini-list"[\s\S]*?<\/div>/);

  assert.ok(recentMatch, 'recent post list should exist');
  assert.match(recentMatch[0], /data-recent-post-list/);
  assert.match(recentMatch[0], /id="blogRecentPostList"/);
  assert.doesNotMatch(recentMatch[0], /<a\b/);
  assert.match(html, /data-toggle-recent-posts/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="blogRecentPostList"/);
  assert.match(html, />최근 글 더 보기<\/button>/);
});

test('blog script builds recent posts from visible blog cards', () => {
  const js = fs.readFileSync('blog/assets/blog.js', 'utf8');

  assert.match(js, /querySelectorAll\('\.blog-card-link'\)/);
  assert.match(js, /recentPostLimit/);
  assert.match(js, /function renderRecentPosts/);
  assert.match(js, /recentLinks\.slice\(0, count\)/);
  assert.match(js, /recentList\.recentPostExpanded/);
  assert.doesNotMatch(js, /jquery|jQuery/);
});

test('root blog home promotes the full Seoul claw machine guide in the right sidebar', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  assert.match(html, /class="blog-guide-card"/);
  assert.match(html, /href="\/claw-machine-guide\.html"/);
  assert.match(html, /서울 인형뽑기 성지 가이드/);
});
