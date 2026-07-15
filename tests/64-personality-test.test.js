const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'tools', '64-personality-test.html');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('64 personality test page exposes the expected test contract', () => {
  const html = read(pagePath);
  const questionMatches = html.match(/axis:\s*'[^']+'/g) || [];

  assert.equal(questionMatches.length, 36, 'test should contain 36 scored questions');
  for (const axis of ['EI', 'SN', 'TF', 'JP', 'AT', 'CS']) {
    assert.match(html, new RegExp(`axis:\\s*'${axis}'`), `${axis} axis should be scored`);
  }

  assert.match(html, /64유형 성격 테스트/);
  assert.match(html, /기본 16유형/);
  assert.match(html, /확장 64유형/);
  assert.match(html, /공식 MBTI 검사가 아닌/);
  assert.match(html, /data-result-code/);
  assert.match(html, /data-extended-code/);
  assert.match(html, /data-character-name/);
  assert.match(html, /data-type-directory/);
  assert.match(html, /const typeCharacters/);
  assert.match(html, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(html, /function parseResultParam/);
  assert.match(html, /function showDirectResult/);
});

test('64 personality test page has social image metadata for search previews', () => {
  const html = read(pagePath);

  assert.match(html, /<meta property="og:image" content="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.match(html, /<link rel="image_src" href="https:\/\/idont82\.github\.io\/blog\/images\/mbti-64-personality-thumbnail\.png">/);
  assert.ok(fs.existsSync(path.join(root, 'blog', 'images', 'mbti-64-personality-thumbnail.png')));
});

test('64 personality test result includes user-based Coupang recommendation banners', () => {
  const html = read(pagePath);

  assert.match(html, /class="result-layout"/);
  assert.match(html, /class="result-sidebar"/);
  assert.match(html, /data-recommendation-slot="summary"/);
  assert.match(html, /data-recommendation-slot="strength"/);
  assert.match(html, /data-recommendation-slot="balance"/);
  assert.match(html, /data-recommendation-slot="sidebar"/);
  assert.match(html, /data-mobile-result-ad/);
  assert.match(html, /data-inline-result-ad/);
  assert.match(html, /ads-partners\.coupang\.com\/widgets\.html\?id=989908/);
  assert.match(html, /class="blog-ad-frame"/);
  assert.match(html, /title="쿠팡 파트너스 관심 배너"/);
  assert.match(html, /data-coupang-link/);
  assert.match(html, /data-coupang-placement="personality_result_banner"/);
  assert.match(html, /data-coupang-placement="personality_result_sidebar"/);
  assert.match(html, /data-coupang-product-type="personality_recommendation"/);
  assert.match(html, /쿠팡 파트너스 활동의 일환으로/);
  assert.match(html, /rel="sponsored nofollow"/);
});

test('64 personality test uses a polished app-style quiz layout', () => {
  const html = read(pagePath);

  assert.match(html, /--surface-glass:/);
  assert.match(html, /class="hero-metrics"/);
  assert.match(html, /class="metric-card"/);
  assert.match(html, /class="question-shell"/);
  assert.match(html, /class="question-index"/);
  assert.match(html, /class="choice-dot"/);
  assert.match(html, /data-choice-value="\$\{value\}"/);
  assert.match(html, /class="result-hero"/);
  assert.match(html, /class="result-code-grid"/);
  assert.match(html, /class="type-link-code"/);
  assert.doesNotMatch(html, /class="choice-value"/);
});

test('64 personality test keeps browser back navigation inside the quiz flow', () => {
  const html = read(pagePath);

  assert.match(html, /function setViewState/);
  assert.match(html, /history\.pushState/);
  assert.match(html, /window\.addEventListener\('popstate'/);
  assert.match(html, /view:\s*'start'/);
  assert.match(html, /view:\s*'test'/);
  assert.match(html, /view:\s*'result'/);
});

test('64 personality test page is discoverable from sitemap', () => {
  const sitemap = read(path.join(root, 'sitemap.xml'));

  assert.ok(
    sitemap.includes('https://idont82.github.io/tools/64-personality-test.html'),
    'sitemap should include tools/64-personality-test.html'
  );
});

test('local static server strips query strings before resolving files', () => {
  const server = read(path.join(root, 'server.js'));

  assert.match(server, /new URL\(req\.url,/);
  assert.match(server, /decodeURIComponent\(requestUrl\.pathname\)/);
});
