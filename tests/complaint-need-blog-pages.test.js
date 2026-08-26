const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    path: 'blog/quiet-dehumidifier-review-complaints-guide.html',
    keyword: '저소음 제습기 추천',
    productType: 'complaint_quiet_dehumidifier',
    complaints: ['소음', '물통', '발열'],
  },
  {
    path: 'blog/non-slip-cooling-pad-review-complaints-guide.html',
    keyword: '밀림 적은 냉감패드 추천',
    productType: 'complaint_non_slip_cooling_pad',
    complaints: ['밀림', '보풀', '시원하지'],
  },
  {
    path: 'blog/lightweight-power-bank-review-complaints-guide.html',
    keyword: '가벼운 보조배터리 추천',
    productType: 'complaint_lightweight_power_bank',
    complaints: ['무겁', '충전속도', '발열'],
  },
  {
    path: 'blog/leakproof-tumbler-review-complaints-guide.html',
    keyword: '누수 방지 텀블러 추천',
    productType: 'complaint_leakproof_tumbler',
    complaints: ['누수', '세척', '냄새'],
  },
  {
    path: 'blog/easy-clean-air-circulator-review-complaints-guide.html',
    keyword: '분리세척 서큘레이터 추천',
    productType: 'complaint_easy_clean_air_circulator',
    complaints: ['청소', '소음', '바람'],
  },
  {
    path: 'blog/windproof-uv-umbrella-review-complaints-guide.html',
    keyword: '튼튼한 양우산 추천',
    productType: 'complaint_windproof_uv_umbrella',
    complaints: ['뒤집힘', '무게', '차단'],
  },
  {
    path: 'blog/breathable-diaper-review-complaints-guide.html',
    keyword: '통기성 기저귀 추천',
    productType: 'complaint_breathable_diaper',
    complaints: ['발진', '샘', '통기'],
  },
  {
    path: 'blog/odorless-mosquito-repellent-review-complaints-guide.html',
    keyword: '무향 모기기피제 추천',
    productType: 'complaint_odorless_mosquito_repellent',
    complaints: ['냄새', '지속', '아이'],
  },
  {
    path: 'blog/quick-dry-aqua-shoes-review-complaints-guide.html',
    keyword: '미끄럼 방지 아쿠아슈즈 추천',
    productType: 'complaint_quick_dry_aqua_shoes',
    complaints: ['미끄럼', '건조', '쓸림'],
  },
  {
    path: 'blog/supportive-seat-cushion-review-complaints-guide.html',
    keyword: '허리 편한 방석 추천',
    productType: 'complaint_supportive_seat_cushion',
    complaints: ['꺼짐', '미끄러짐', '냄새'],
  },
];

test('complaint need blog pages expose SEO, ads, and tracked Coupang CTAs', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page.path} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} should have one h1`);
    assert.match(html, new RegExp(page.keyword), `${page.path} should contain its main keyword`);
    assert.match(html, /<meta name="description"/, `${page.path} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page.path} should have canonical`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/, `${page.path} should be indexable`);
    assert.match(html, /og:image/, `${page.path} should expose a social thumbnail`);
    assert.match(html, /BlogPosting/, `${page.path} should have BlogPosting JSON-LD`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${page.path} should have the mobile top ad`);
    assert.match(html, /article-ad article-ad-frame-block/, `${page.path} should have an in-article ad block`);
    assert.match(html, /blog-sidebar blog-sidebar-right/, `${page.path} should have a right sidebar`);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/, `${page.path} should track mobile CTA clicks`);
    assert.match(html, /data-coupang-placement="product_card"/, `${page.path} should track product card clicks`);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`), `${page.path} should tag product type`);
    assert.match(html, /rel="sponsored nofollow"/, `${page.path} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로/, `${page.path} should disclose affiliate relationship`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.path} should include JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${page.path} JSON-LD should parse`);
  }
});

test('complaint need blog pages connect customer complaints to buying criteria', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /후기에서 자주 보이는 불만/, `${page.path} should name review complaints`);
    assert.match(html, /고객 니즈/, `${page.path} should translate complaints into customer needs`);
    assert.match(html, /선택 기준 3가지/, `${page.path} should give three buying criteria`);
    assert.match(html, /쿠팡 상품 정보와 공개 웹 후기에서 반복되는 불만 유형/, `${page.path} should state its basis`);
    for (const complaint of page.complaints) {
      assert.match(html, new RegExp(complaint), `${page.path} should mention complaint ${complaint}`);
    }
    assert.doesNotMatch(html, /100% 해결|완벽 차단|무조건 만족|효과 보장|최저가 보장/, `${page.path} should avoid overclaiming`);
  }
});

test('complaint need blog pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.ok(index.includes(`/${page.path}`), `blog index should link ${page.path}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${page.path}`), `sitemap should include ${page.path}`);
  }
});
