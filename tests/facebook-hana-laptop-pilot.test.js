const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const PILOT_FILE = path.join('data', 'facebook-hana-laptop-pilot.json');
const PRODUCT_IMAGE_URL = 'https://ads-partners.coupang.com/image1/hrjd6Dv9jmolyoZlhl-Qw_xsxOVfE4MtCvbKYho9yozlaLE6-NpWXECpLKQMqYSYzfyqNvE4iFevcKRCqZ3skDyuyOXNPZgRO3So4a2ZgF0PFPfHkl0cxNSi-tQqYn4F2oOu5l7HzEq5NORBiv7x85ymt-FN4Z6uZuFeKc67Z1VJxBQLDzlgUzevCc_wjfcqSpc2o8rP8_LgUKltYFiItqb2gKeaMD4u8AkXNgpyE-yZp6maduN6bFvXo-OO40Khjlw-Ws85sYSzGc6uOQAugjbVanQtxbByMOdQDy3e6ag0FNIOsG4PGnNS616Tr1Lh4bUIiUpB2sh0GBg8jmg=';

test('HANA laptop pilot remains an unpublished, disclosure-safe lifestyle hybrid draft', () => {
  const pilot = JSON.parse(fs.readFileSync(PILOT_FILE, 'utf8'));

  assert.equal(pilot.id, '20260824-hana-laptop-document-pilot');
  assert.equal(pilot.status, 'draft');
  assert.equal(pilot.publish, false);
  assert.equal(pilot.caption.split('\n')[0], 'https://idont82.github.io/g/?n=20');
  assert.match(pilot.caption, /매일 쓰는 장면부터 생각해보세요/);
  assert.doesNotMatch(pilot.caption, /제가|내가|사용해|후기|리뷰/);
  assert.match(pilot.caption, /쿠팡 파트너스 활동의 일환/);
  assert.equal(pilot.facebookPostId, undefined);
  assert.equal(pilot.facebookPermalink, undefined);
  assert.equal(pilot.publishedAt, undefined);

  assert.equal(pilot.slides.length, 3);
  assert.deepEqual(pilot.slides.map((slide) => slide.role), [
    'lifestyle-hook', 'product-proof', 'fit-action',
  ]);
  assert.ok(pilot.slides.every((slide) => slide.template === 'lifestyle-hybrid'));
  assert.equal(pilot.slides[0].disclosure, 'AI 연출 이미지');
  assert.equal(
    pilot.slides[0].lifestyleImageUrls[0],
    '/images/facebook-fictional-model/hana-laptop-document-scene.png',
  );
  for (const slide of pilot.slides) {
    assert.ok(slide.productImageUrls.length > 0);
    assert.deepEqual(slide.productImageUrls, [PRODUCT_IMAGE_URL]);
    assert.equal(slide.productName, 'Basics BasicBook 16 Pro');
    assert.equal(slide.label, 'GOLD PICK');
  }
  for (const slide of pilot.slides.slice(1)) {
    assert.match(slide.productImageUrls[0], /^https:\/\/ads-partners\.coupang\.com\/image1\//);
  }

  assert.equal(pilot.slides[0].headline, '매일 쓰기 편한 문서용 노트북');
  assert.equal(pilot.slides[0].priceBand, '작성일 기준 100만원대');
  assert.deepEqual(pilot.slides[1].specs, ['Ryzen 5', '16GB · 512GB', 'Windows 11']);
  assert.equal(pilot.slides[1].priceBand, '작성일 기준 100만원대');
  assert.equal(pilot.slides[1].disclaimer, '가격 변동 가능');
  assert.deepEqual(pilot.slides[2].fits, ['문서 작성', '메일 · 웹', '화상 회의']);
  assert.equal(pilot.slides[2].caution, '16인치 크기와 휴대 무게는 확인하세요');
  assert.equal(pilot.slides[2].cta, '자세한 비교는 본문에서');

  const liveFiles = [
    'data/facebook-post-queue.json',
    'scripts/publish-facebook-posts.js',
    'scripts/build-facebook-short-links.js',
    'scripts/collect-facebook-insights.js',
  ];
  for (const file of liveFiles) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /facebook-hana-laptop-pilot/);
  }
});
