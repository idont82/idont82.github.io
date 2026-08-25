const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const PILOT_ID = '20260824-hana-laptop-document-pilot';
const PILOT_FILE = path.join(__dirname, '..', 'data', 'facebook-hana-laptop-pilot.json');
const DATA_DIR = path.join(__dirname, '..', 'data');
const PILOT_URL = 'https://idont82.github.io/blog/document-work-laptop-top3-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260824-hana-laptop-document-pilot';
const PRODUCT_IMAGE_URL = 'https://ads-partners.coupang.com/image1/hrjd6Dv9jmolyoZlhl-Qw_xsxOVfE4MtCvbKYho9yozlaLE6-NpWXECpLKQMqYSYzfyqNvE4iFevcKRCqZ3skDyuyOXNPZgRO3So4a2ZgF0PFPfHkl0cxNSi-tQqYn4F2oOu5l7HzEq5NORBiv7x85ymt-FN4Z6uZuFeKc67Z1VJxBQLDzlgUzevCc_wjfcqSpc2o8rP8_LgUKltYFiItqb2gKeaMD4u8AkXNgpyE-yZp6maduN6bFvXo-OO40Khjlw-Ws85sYSzGc6uOQAugjbVanQtxbByMOdQDy3e6ag0FNIOsG4PGnNS616Tr1Lh4bUIiUpB2sh0GBg8jmg=';

function loadPilot() {
  return JSON.parse(fs.readFileSync(PILOT_FILE, 'utf8'));
}

function findFacebookPostQueues(dataDir) {
  return fs.readdirSync(dataDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^facebook(?:-[a-z0-9-]+)?-post-queue\.json$/.test(entry.name))
    .map((entry) => ({
      file: path.join(dataDir, entry.name),
      items: JSON.parse(fs.readFileSync(path.join(dataDir, entry.name), 'utf8')),
    }));
}

test('HANA laptop pilot remains a disclosure-safe draft with its tracked blog URL', () => {
  const pilot = loadPilot();
  const captionUrl = new URL(pilot.caption.split('\n')[0]);

  assert.equal(pilot.id, PILOT_ID);
  assert.equal(pilot.status, 'draft');
  assert.equal(pilot.publish, false);
  assert.equal(pilot.caption.split('\n')[0], PILOT_URL);
  assert.equal(captionUrl.pathname, '/blog/document-work-laptop-top3-guide.html');
  assert.equal(captionUrl.searchParams.get('utm_source'), 'facebook');
  assert.equal(captionUrl.searchParams.get('utm_medium'), 'social');
  assert.equal(captionUrl.searchParams.get('utm_campaign'), 'card_news');
  assert.equal(captionUrl.searchParams.get('utm_content'), PILOT_ID);
  assert.match(pilot.caption, /매일 쓰는 장면부터 생각해보세요/);
  assert.doesNotMatch(pilot.caption, /제가|내가|사용해|후기|리뷰/);
  assert.match(pilot.caption, /쿠팡 파트너스 활동의 일환/);
  assert.equal(pilot.facebookPostId, undefined);
  assert.equal(pilot.facebookPermalink, undefined);
  assert.equal(pilot.publishedAt, undefined);
});

test('HANA laptop pilot keeps the reviewed lifestyle and product contract', () => {
  const pilot = loadPilot();

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
  assert.equal(pilot.slides[0].priceBand, '2026.08.21 기준 100만원대');
  assert.deepEqual(pilot.slides[1].specs, ['Ryzen 5', '16GB · 512GB', 'Windows 11']);
  assert.equal(pilot.slides[1].priceBand, '2026.08.21 기준 100만원대');
  assert.equal(pilot.slides[1].disclaimer, '가격 변동 가능');
  assert.deepEqual(pilot.slides[2].fits, ['문서 작성', '메일 · 웹', '화상 회의']);
  assert.equal(pilot.slides[2].sectionTitle, '이런 용도에 잘 맞아요');
  assert.equal(pilot.slides[2].caution, '16인치 크기와 휴대 무게는 확인하세요');
  assert.equal(pilot.slides[2].cta, '자세한 비교는 본문에서');
});

test('HANA laptop pilot is absent from every Facebook post queue and the default publisher', () => {
  for (const queue of findFacebookPostQueues(DATA_DIR)) {
    assert.equal(queue.items.some((item) => item.id === PILOT_ID), false, queue.file);
  }
  const publisher = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'publish-facebook-posts.js'), 'utf8');
  assert.doesNotMatch(publisher, new RegExp(PILOT_ID));
});

test('Facebook post queue scan detects the pilot ID in a matching queue fixture', () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-pilot-queue-'));
  fs.writeFileSync(
    path.join(fixtureDir, 'facebook-review-post-queue.json'),
    JSON.stringify([{ id: PILOT_ID }]),
    'utf8',
  );

  const fixtureQueue = findFacebookPostQueues(fixtureDir);
  assert.equal(fixtureQueue.length, 1);
  assert.equal(fixtureQueue[0].items.some((item) => item.id === PILOT_ID), true);
});
