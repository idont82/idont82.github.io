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

test('MBTI article exposes all 64 extended types exactly once', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const baseTypes = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ];
  const variants = ['A-C', 'A-S', 'T-C', 'T-S'];
  const expected = baseTypes.flatMap((base) => variants.map((variant) => `${base}-${variant}`));
  const codes = [...html.matchAll(/data-type-code="([A-Z]{4}-[AT]-[CS])"/g)].map((match) => match[1]);

  assert.equal(codes.length, 64);
  assert.equal(new Set(codes).size, 64);
  assert.deepEqual([...codes].sort(), [...expected].sort());

  expected.forEach((code) => {
    assert.match(
      html,
      new RegExp(`href="/tools/64-personality-test\\.html\\?result=${code}"[^>]*data-type-code="${code}"`)
    );
  });

  variants.forEach((variant) => {
    assert.equal(codes.filter((code) => code.endsWith(variant)).length, 16);
  });
});

test('MBTI 64 matrix is semantic, descriptive, and mobile-scrollable', () => {
  const html = fs.readFileSync(articlePath, 'utf8');

  assert.match(html, /id="type-matrix"/);
  assert.match(html, /class="mbti64-matrix-scroll"[^>]*tabindex="0"/);
  assert.match(html, /aria-describedby="mbti64-scroll-hint"/);
  assert.match(html, /<table class="mbti64-matrix">/);
  assert.match(html, /<caption>MBTI 기본 16유형과 A-C, A-S, T-C, T-S 확장형 비교표<\/caption>/);
  assert.equal((html.match(/<th scope="row"/g) || []).length, 16);
  assert.equal((html.match(/class="mbti64-type-name"/g) || []).length, 64);
  assert.equal((html.match(/class="mbti64-type-copy"/g) || []).length, 64);
  assert.match(html, /좌우로 밀어 4가지 변형 비교/);
  assert.match(html, /공식 MBTI 검사가 아닌 자체 확장 해석/);
});

test('MBTI article includes the 64-type axis infographic and updated navigation', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const svg = fs.readFileSync('blog/images/mbti-64-axis-map.svg', 'utf8');

  assert.match(html, /href="#type-matrix"/);
  assert.match(html, /src="\/blog\/images\/mbti-64-axis-map\.svg"/);
  assert.match(html, /alt="MBTI 16유형에 A\/T와 C\/S 보조축을 더해 64유형으로 확장하는 구조"/);
  assert.match(html, /<figcaption>16개 기본유형 각각이 네 가지 행동 결로 나뉘어 총 64유형이 됩니다\.<\/figcaption>/);
  assert.match(html, /<h2 id="type-matrix">4\. MBTI 64유형 한눈에 보기<\/h2>/);
  assert.match(html, /<h2>5\. INTJ와 INTJ-A-C는 어떻게 다를까\?<\/h2>/);
  assert.match(html, /<h2 id="hexaco">6\. HEXACO 64유형과 MBTI 확장형 64유형은 다르다<\/h2>/);
  assert.match(html, /<h2>7\. 결과는 어떻게 읽으면 좋을까\?<\/h2>/);
  assert.match(html, /<h2 id="test">8\. 직접 64유형 테스트 해보기<\/h2>/);

  assert.match(svg, /<svg/);
  assert.match(svg, /16 기본유형/);
  assert.match(svg, /A-C/);
  assert.match(svg, /A-S/);
  assert.match(svg, /T-C/);
  assert.match(svg, /T-S/);
});
