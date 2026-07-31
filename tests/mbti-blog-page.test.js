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
  assert.match(html, /"dateModified": "2026-07-30"/);
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

test('MBTI article shell can shrink to the standard blog content column', () => {
  const css = fs.readFileSync('blog/assets/style.css', 'utf8');

  assert.match(css, /\.blog-article-shell\s*\{[^}]*min-width:\s*0\s*;/s);
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
  const tableMatches = [...html.matchAll(/<table\b(?=[^>]*\bclass="[^"]*\bmbti64-matrix\b[^"]*")[^>]*>([\s\S]*?)<\/table>/g)];

  assert.equal(tableMatches.length, 2, 'A and T matrix tables should both exist');

  const tableVariants = [['A-C', 'A-S'], ['T-C', 'T-S']];
  const codes = tableMatches.flatMap((tableMatch, tableIndex) => {
    const tbodyMatch = tableMatch[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/);
    assert.ok(tbodyMatch, 'each matrix table should contain a tbody');

    const rows = [...tbodyMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
    assert.equal(rows.length, 16);

    return rows.flatMap((row, index) => {
      const base = baseTypes[index];
      const rowHeaders = [...row.matchAll(/<th\b(?=[^>]*\bscope="row")[^>]*>([\s\S]*?)<\/th>/g)];
      const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1]);

      assert.equal(rowHeaders.length, 1);
      assert.match(rowHeaders[0][1], new RegExp(`<strong>${base}<\\/strong>`));
      assert.equal(cells.length, 2);

      const rowCodes = cells.map((cell) => {
        const anchors = [...cell.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)];

        assert.equal(anchors.length, 1);

        const href = anchors[0][0].match(/\bhref="([^"]+)"/);
        const code = anchors[0][0].match(/\bdata-type-code="([A-Z]{4}-[AT]-[CS])"/);
        const anchorContent = anchors[0][1];

        assert.ok(href, 'each matrix cell should link to its result');
        assert.ok(code, 'each matrix cell should expose its type code');
        assert.equal(href[1], `/tools/64-personality-test.html?result=${code[1]}`);

        ['name', 'copy'].forEach((part) => {
          const elements = [...anchorContent.matchAll(new RegExp(
            `<span\\b(?=[^>]*\\bclass="[^"]*\\bmbti64-type-${part}\\b[^"]*")[^>]*>([\\s\\S]*?)<\\/span>`,
            'g'
          ))];

          assert.equal(elements.length, 1, `${code[1]} should contain one type ${part}`);
          assert.notEqual(
            elements[0][1].replace(/<[^>]+>/g, '').trim(),
            '',
            `${code[1]} type ${part} should not be empty`
          );
        });

        return code[1];
      });

      assert.deepEqual(rowCodes, tableVariants[tableIndex].map((variant) => `${base}-${variant}`));
      return rowCodes;
    });
  });

  assert.equal(codes.length, 64);
  assert.equal(new Set(codes).size, 64);
  assert.deepEqual([...codes].sort(), [...expected].sort());

  variants.forEach((variant) => {
    assert.equal(codes.filter((code) => code.endsWith(variant)).length, 16);
  });
});

test('MBTI 64 matrix is split into semantic A and T tables without scroll instructions', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const panels = [...html.matchAll(/<div\b(?=[^>]*\bclass="[^"]*\bmbti64-matrix-panel\b[^"]*")(?=[^>]*\brole="region")(?=[^>]*\baria-label="([^"]+)")[^>]*>([\s\S]*?)<\/div>/g)];

  assert.match(html, /id="type-matrix"/);
  assert.equal(panels.length, 2);
  assert.deepEqual(panels.map((panel) => panel[1]), [
    'A-C와 A-S 유형 비교표',
    'T-C와 T-S 유형 비교표'
  ]);
  assert.match(panels[0][2], /<caption>MBTI 기본 16유형과 A-C, A-S 확장형 비교표<\/caption>/);
  assert.match(panels[1][2], /<caption>MBTI 기본 16유형과 T-C, T-S 확장형 비교표<\/caption>/);

  panels.forEach((panel) => {
    assert.equal((panel[2].match(/<th\b(?=[^>]*\bscope="col")[^>]*>/g) || []).length, 3);
    assert.equal((panel[2].match(/<th\b(?=[^>]*\bscope="row")[^>]*>/g) || []).length, 16);
    assert.equal((panel[2].match(/class="mbti64-type-name"/g) || []).length, 32);
    assert.equal((panel[2].match(/class="mbti64-type-copy"/g) || []).length, 32);
  });

  assert.doesNotMatch(html, /mbti64-scroll-hint|좌우로 밀어/);
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

test('MBTI 64 matrix styles keep the table and infographic usable across widths', () => {
  const css = fs.readFileSync('blog/assets/style.css', 'utf8');
  const mobileStart = css.indexOf('@media (max-width:760px)');
  const mobileEnd = css.indexOf('@media', mobileStart + 1);
  const mobileCss = css.slice(mobileStart, mobileEnd === -1 ? undefined : mobileEnd);

  assert.match(css, /\.mbti64-matrix-panel\s*\{[^}]*overflow:\s*visible\s*;/s);
  assert.match(css, /\.mbti64-matrix\s*\{[^}]*min-width:\s*0\s*;/s);
  assert.doesNotMatch(css, /\.mbti64-matrix-scroll\s*\{/);
  assert.doesNotMatch(css, /\.mbti64-matrix thead th\s*\{[^}]*position:\s*sticky\s*;/s);
  assert.doesNotMatch(css, /\.mbti64-matrix th:first-child\s*\{[^}]*position:\s*sticky\s*;/s);
  assert.match(css, /\.mbti64-matrix a:focus-visible\s*\{/);
  assert.match(css, /\.mbti64-matrix td\s*\{[^}]*height:\s*1px\s*;/s);
  assert.match(css, /\.mbti64-matrix td a\s*\{[^}]*display:\s*flex\s*;[^}]*flex-direction:\s*column\s*;[^}]*height:\s*100%\s*;/s);
  assert.match(css, /\.mbti64-group-analyst th:first-child::after\s*\{[^}]*content:\s*"분석가"\s*;/s);
  assert.match(css, /\.mbti64-group-diplomat th:first-child::after\s*\{[^}]*content:\s*"외교관"\s*;/s);
  assert.match(css, /\.mbti64-group-sentinel th:first-child::after\s*\{[^}]*content:\s*"관리자"\s*;/s);
  assert.match(css, /\.mbti64-group-explorer th:first-child::after\s*\{[^}]*content:\s*"탐험가"\s*;/s);
  assert.match(css, /\.mbti64-variant-ac\s*\{[^}]*--mbti64-code:\s*#3451a3\s*;/s);
  assert.match(css, /\.mbti64-variant-as\s*\{[^}]*--mbti64-code:\s*#1f6b44\s*;/s);
  assert.match(css, /\.mbti64-variant-tc\s*\{[^}]*--mbti64-code:\s*#9a4d0e\s*;/s);
  assert.match(css, /\.mbti64-variant-ts\s*\{[^}]*--mbti64-code:\s*#7442a3\s*;/s);
  assert.match(css, /\.mbti64-matrix td a > strong\s*\{[^}]*color:\s*var\(--mbti64-code,\s*var\(--mbti64-accent\)\)\s*;/s);

  assert.notEqual(mobileStart, -1, 'the 760px mobile breakpoint should exist');
  assert.match(mobileCss, /\.mbti64-axis-figure\s*\{[^}]*overflow-x:\s*auto\s*;/s);
  assert.match(mobileCss, /\.mbti64-axis-figure img\s*\{[^}]*min-width:\s*(?:7[2-9]\d|[89]\d{2,})px\s*;/s);
});
