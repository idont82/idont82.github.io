const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    path: 'blog/bts-tinytan-goods-guide.html',
    keyword: 'BTS 타이니탄 굿즈',
    productType: 'idol_bts_tinytan',
    intent: ['라이선스', '문구', '생활 굿즈'],
  },
  {
    path: 'blog/seventeen-photocard-binder-guide.html',
    keyword: '세븐틴 포토카드 바인더',
    productType: 'idol_seventeen_photocard',
    intent: ['포토카드', '바인더', '슬리브'],
  },
  {
    path: 'blog/ive-album-photocard-guide.html',
    keyword: '아이브 앨범 포토카드',
    productType: 'idol_ive_album',
    intent: ['앨범', '포토카드', '특전'],
  },
  {
    path: 'blog/aespa-season-greeting-album-guide.html',
    keyword: '에스파 시즌그리팅 앨범',
    productType: 'idol_aespa_album',
    intent: ['시즌그리팅', '앨범', '구성품'],
  },
  {
    path: 'blog/blackpink-album-photocard-storage-guide.html',
    keyword: '블랙핑크 앨범 포토카드',
    productType: 'idol_blackpink_album',
    intent: ['앨범', '포토카드', '보관'],
  },
];

test('idol shopping pages expose complete SEO and article structure', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page.path} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} should have one h1`);
    assert.match(html, new RegExp(page.keyword), `${page.path} should contain its target keyword`);
    assert.match(html, /<meta name="description"/, `${page.path} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page.path} should have canonical`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/, `${page.path} should be indexable`);
    assert.match(html, /og:image/, `${page.path} should expose a social image`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${page.path} should have a mobile ad`);
    assert.match(html, /article-ad article-ad-frame-block/, `${page.path} should have an article ad`);
    assert.match(html, /blog-sidebar blog-sidebar-right/, `${page.path} should have a right sidebar`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.path} should include JSON-LD`);
    const parsed = JSON.parse(jsonLd[1]);
    assert.equal(parsed['@type'], 'BlogPosting', `${page.path} should use BlogPosting`);
    assert.equal(parsed.inLanguage, 'ko-KR', `${page.path} should identify Korean`);
  }
});

test('idol shopping pages distinguish product status and avoid unsupported ranking claims', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /공식·라이선스·범용/, `${page.path} should explain product status`);
    assert.match(html, /2026년 7월 31일/, `${page.path} should disclose the product check date`);
    assert.match(html, /검색 결과 순서/, `${page.path} should qualify Coupang ranking`);
    assert.match(html, /가격과 재고, 구성은 달라질 수/, `${page.path} should disclose volatility`);
    assert.match(html, /data-coupang-placement="product_card"/, `${page.path} should track product cards`);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`), `${page.path} should tag its product type`);
    assert.match(html, /rel="sponsored nofollow"/, `${page.path} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로/, `${page.path} should disclose affiliate relationship`);
    assert.doesNotMatch(html, /네이버 검색 1위|판매량 1위|무조건 정품|최저가 보장/, `${page.path} should avoid unsupported claims`);

    for (const marker of page.intent) {
      assert.match(html, new RegExp(marker), `${page.path} should cover ${marker}`);
    }
  }
});

test('idol shopping pages speak as sincere fans without inventing personal use', () => {
  const fabricatedExperience = /직접 구매했다|직접 샀|써보니|사용해보니|배송받았다/;

  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /팬인 저는/, `${page.path} should identify the writer as a fan`);
    assert.match(html, /좋아해서|설레|마음에 들/, `${page.path} should express sincere enthusiasm`);
    assert.match(html, /팬 추천 포인트/, `${page.path} should label fan recommendations`);
    assert.doesNotMatch(html, fabricatedExperience, `${page.path} should not invent purchases or use`);
  }
});

test('idol product tables fit the article width without horizontal scrolling', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /\.idol-product-table\s*\{[^}]*table-layout:\s*fixed/s, `${page.path} should use fixed table layout`);
    assert.match(html, /\.idol-product-table\s*\{[^}]*max-width:\s*100%/s, `${page.path} should stay within article width`);
    assert.match(html, /\.idol-product-table th,\s*\.idol-product-table td\s*\{[^}]*overflow-wrap:\s*anywhere/s, `${page.path} should wrap long cell content`);
    assert.doesNotMatch(html, /min-width:\s*680px/, `${page.path} should not force desktop table width`);
    assert.doesNotMatch(html, /\.idol-product-table-wrap\s*\{\s*overflow-x:\s*auto/, `${page.path} should not create a horizontal scroller`);
  }
});

test('idol shopping pages show a sticky Coupang recommendation banner in the right rail', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');
    const sidebar = html.match(/<aside class="blog-sidebar blog-sidebar-right">([\s\S]*?)<\/aside>/);

    assert.ok(sidebar, `${page.path} should have a right sidebar`);
    assert.match(sidebar[1], /blog-stack blog-stack-sticky/, `${page.path} should keep the recommendation rail sticky`);
    assert.match(sidebar[1], /<h2>추천 배너<\/h2>/, `${page.path} should label the recommendation banner`);
    assert.match(sidebar[1], /<iframe class="blog-ad-frame"/, `${page.path} should use the shared ad frame style`);
    assert.match(sidebar[1], /widgets\.html\?id=989908(?:&|&amp;)template=carousel/, `${page.path} should use the established Coupang widget`);
    assert.match(sidebar[1], /width="300" height="250"/, `${page.path} should use a 300 by 250 banner`);
    assert.match(sidebar[1], /쿠팡 파트너스 활동으로/, `${page.path} should disclose the right-rail affiliate banner`);
  }
});

test('idol shopping pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.ok(index.includes(`/${page.path}`), `index should link ${page.path}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${page.path}`), `sitemap should include ${page.path}`);
  }
});
