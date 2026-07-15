const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const articlePath = 'blog/mbti-16-vs-64-personality-types.html';
const articleUrl = 'https://idont82.github.io/blog/mbti-16-vs-64-personality-types.html';

test('MBTI 16 vs 64 article explains the test and links to the tool', () => {
  const html = fs.readFileSync(articlePath, 'utf8');

  assert.match(html, /MBTI 16유형과 64유형 차이/);
  assert.match(html, /E\/I/);
  assert.match(html, /S\/N/);
  assert.match(html, /T\/F/);
  assert.match(html, /J\/P/);
  assert.match(html, /A\/T/);
  assert.match(html, /C\/S/);
  assert.match(html, /HEXACO/);
  assert.match(html, /공식 MBTI 검사가 아닌/);
  assert.match(html, /href="\/tools\/64-personality-test.html"/);
  assert.match(html, /64유형 테스트 바로가기/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /<meta property="og:image" content="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.match(html, /<link rel="image_src" href="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.match(html, /"dateModified": "2026-07-15"/);
});

test('MBTI article uses the existing blog three-column layout', () => {
  const html = fs.readFileSync(articlePath, 'utf8');

  assert.match(html, /<main class="blog-layout">/);
  assert.match(html, /blog-sidebar blog-sidebar-left/);
  assert.match(html, /<section class="blog-main">/);
  assert.match(html, /blog-sidebar blog-sidebar-right/);
  assert.match(html, /article-summary-box/);
  assert.match(html, /blog-ad-frame/);
  assert.doesNotMatch(html, /<main class="blog-article-layout">/);
});

test('MBTI article is discoverable from root blog home and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  assert.match(index, /\/blog\/mbti-16-vs-64-personality-types\.html/);
  assert.match(index, /MBTI 16유형과 64유형 차이/);
  assert.ok(sitemap.includes(articleUrl), 'sitemap should include MBTI article');
});
