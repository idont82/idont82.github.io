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
  const tableMatch = html.match(/<table\b(?=[^>]*\bclass="[^"]*\bmbti64-matrix\b[^"]*")[^>]*>([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'the matrix table should exist');

  const tbodyMatch = tableMatch[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/);
  assert.ok(tbodyMatch, 'the matrix table should contain a tbody');

  const rows = [...tbodyMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  assert.equal(rows.length, 16);

  const codes = rows.flatMap((row, index) => {
    const base = baseTypes[index];
    const anchors = [...row.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);

    assert.match(
      row,
      new RegExp(`<th\\b(?=[^>]*\\bscope="row")[^>]*>[\\s\\S]*?<strong>${base}<\\/strong>`)
    );
    assert.equal(anchors.length, 4);

    const rowCodes = anchors.map((anchor) => {
      const href = anchor.match(/\bhref="([^"]+)"/);
      const code = anchor.match(/\bdata-type-code="([A-Z]{4}-[AT]-[CS])"/);

      assert.ok(href, 'each matrix cell should link to its result');
      assert.ok(code, 'each matrix cell should expose its type code');
      assert.equal(href[1], `/tools/64-personality-test.html?result=${code[1]}`);
      return code[1];
    });

    assert.deepEqual(rowCodes, variants.map((variant) => `${base}-${variant}`));
    return rowCodes;
  });

  assert.equal(codes.length, 64);
  assert.equal(new Set(codes).size, 64);
  assert.deepEqual([...codes].sort(), [...expected].sort());

  variants.forEach((variant) => {
    assert.equal(codes.filter((code) => code.endsWith(variant)).length, 16);
  });
});

test('MBTI 64 matrix is semantic, descriptive, and mobile-scrollable', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const scrollRegion = html.match(/<div\b(?=[^>]*\bclass="[^"]*\bmbti64-matrix-scroll\b[^"]*")(?=[^>]*\btabindex="0")(?=[^>]*\brole="region")(?=[^>]*\baria-label="MBTI 64유형 비교표")(?=[^>]*\baria-describedby="mbti64-scroll-hint")[^>]*>/);
  const tableMatch = html.match(/<table\b(?=[^>]*\bclass="[^"]*\bmbti64-matrix\b[^"]*")[^>]*>([\s\S]*?)<\/table>/);

  assert.match(html, /id="type-matrix"/);
  assert.ok(scrollRegion, 'the matrix scroll region should include all accessibility attributes');
  assert.ok(tableMatch, 'the semantic matrix table should exist');
  assert.match(tableMatch[1], /<caption>MBTI 기본 16유형과 A-C, A-S, T-C, T-S 확장형 비교표<\/caption>/);
  assert.equal((tableMatch[1].match(/<th\b(?=[^>]*\bscope="col")[^>]*>/g) || []).length, 5);
  assert.equal((tableMatch[1].match(/<th\b(?=[^>]*\bscope="row")[^>]*>/g) || []).length, 16);
  assert.equal((tableMatch[1].match(/class="mbti64-type-name"/g) || []).length, 64);
  assert.equal((tableMatch[1].match(/class="mbti64-type-copy"/g) || []).length, 64);
  assert.match(html, /좌우로 밀어 4가지 변형 비교/);
  assert.match(html, /공식 MBTI 검사가 아닌 자체 확장 해석/);
});

test('MBTI article includes the 64-type axis infographic and updated navigation', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const svg = fs.readFileSync('blog/images/mbti-64-axis-map.svg', 'utf8');
  const tocMatch = html.match(/<div\b(?=[^>]*\bclass="[^"]*\bblog-toc-list\b[^"]*")[^>]*>([\s\S]*?)<\/div>/);
  const numberedHeadings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((match) => match[1])
    .filter((heading) => /^[4-8]\. /.test(heading));

  assert.ok(tocMatch, 'the article table of contents should exist');
  assert.match(tocMatch[1], /<a\b(?=[^>]*\bhref="#type-matrix")[^>]*>/);
  assert.match(html, /src="\/blog\/images\/mbti-64-axis-map\.svg"/);
  assert.match(html, /alt="MBTI 16유형에 A\/T와 C\/S 보조축을 더해 64유형으로 확장하는 구조"/);
  assert.match(html, /<figcaption>16개 기본유형 각각이 네 가지 행동 결로 나뉘어 총 64유형이 됩니다\.<\/figcaption>/);
  assert.match(html, /<h2\b(?=[^>]*\bid="type-matrix")[^>]*>4\. MBTI 64유형 한눈에 보기<\/h2>/);
  assert.deepEqual(numberedHeadings, [
    '4. MBTI 64유형 한눈에 보기',
    '5. INTJ와 INTJ-A-C는 어떻게 다를까?',
    '6. HEXACO 64유형과 MBTI 확장형 64유형은 다르다',
    '7. 결과는 어떻게 읽으면 좋을까?',
    '8. 직접 64유형 테스트 해보기'
  ]);

  assert.match(svg, /<svg/);
  assert.match(svg, /16 기본유형/);
  assert.match(svg, /A-C/);
  assert.match(svg, /A-S/);
  assert.match(svg, /T-C/);
  assert.match(svg, /T-S/);
});
