const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const POSTS_FILE = path.join(__dirname, '..', 'data', 'facebook-hana-autumn-posts.json');
const EXPECTED = new Map([
  [
    '20260826-hana-autumn-windbreaker',
    {
      article: '/blog/lightweight-windbreaker-autumn-guide.html',
      scene: '/images/facebook-fictional-model/hana-autumn-windbreaker-scene.png',
      productId: '9042341379',
    },
  ],
  [
    '20260826-hana-autumn-trekking',
    {
      article: '/blog/autumn-lightweight-trekking-shoes-guide.html',
      scene: '/images/facebook-fictional-model/hana-autumn-trekking-scene.png',
      productId: '9452445890',
    },
  ],
]);

function loadPosts() {
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
}

test('HANA 가을 게시물은 서로 다른 제품 두 개와 링크 첫 줄을 고정한다', () => {
  const posts = loadPosts();

  assert.equal(posts.length, 2);
  assert.deepEqual(new Set(posts.map((post) => post.id)), new Set(EXPECTED.keys()));
  assert.equal(new Set(posts.map((post) => post.productId)).size, 2);

  for (const post of posts) {
    const expected = EXPECTED.get(post.id);
    const firstLine = post.caption.split('\n')[0];
    const url = new URL(firstLine);

    assert.equal(post.article, expected.article);
    assert.equal(post.productId, expected.productId);
    assert.equal(url.origin, 'https://idont82.github.io');
    assert.equal(url.pathname, expected.article);
    assert.equal(url.searchParams.get('utm_source'), 'facebook');
    assert.equal(url.searchParams.get('utm_medium'), 'social');
    assert.equal(url.searchParams.get('utm_campaign'), 'card_news');
    assert.equal(url.searchParams.get('utm_content'), post.id);
    assert.match(post.caption, /쿠팡 파트너스 활동의 일환/);
    assert.doesNotMatch(post.caption, /제가|내가|사용해봤|후기/);
  }
});

test('각 게시물은 HANA 생활 장면부터 행동 카드까지 세 역할을 지킨다', () => {
  for (const post of loadPosts()) {
    const expected = EXPECTED.get(post.id);

    assert.equal(post.slides.length, 3);
    assert.deepEqual(post.slides.map((slide) => slide.role), [
      'lifestyle-hook', 'product-proof', 'fit-action',
    ]);
    assert.ok(post.slides.every((slide) => slide.template === 'lifestyle-hybrid'));
    assert.equal(post.slides[0].disclosure, 'AI 연출 이미지');
    assert.deepEqual(post.slides[0].lifestyleImageUrls, [expected.scene]);
    assert.ok(post.slides.every((slide) => (
      slide.productImageUrls.length === 1
      && /^https:\/\/ads-partners\.coupang\.com\/image1\//.test(slide.productImageUrls[0])
    )));
    assert.ok(post.slides.every((slide) => slide.productName === post.productName));
  }
});

test('게시 상태에는 토큰 없이 검증 가능한 Facebook 결과만 저장한다', () => {
  for (const post of loadPosts()) {
    assert.ok(['draft', 'published'].includes(post.status));
    assert.equal(JSON.stringify(post).includes('access_token'), false);
    if (post.status === 'published') {
      assert.match(post.facebookPostId, /^\d+_\d+$/);
      assert.match(post.facebookPermalink, /^https:\/\/www\.facebook\.com\//);
      assert.ok(!Number.isNaN(Date.parse(post.publishedAt)));
      assert.equal(post.verifiedAttachmentCount, 3);
    } else {
      assert.equal(post.facebookPostId, undefined);
      assert.equal(post.facebookPermalink, undefined);
      assert.equal(post.publishedAt, undefined);
    }
  }
});
