const assert = require('node:assert/strict');
const test = require('node:test');

const {
  WINTER_POSTS,
  DISCLOSURE_TEXT,
  buildPost,
  markerFor,
  formatPrice,
} = require('../scripts/winter-warm-blogger-posts');

const sampleItems = Array.from({ length: 6 }, (unused, index) => ({
  productId: 1000 + index,
  productName: `테스트 겨울 상품 ${index + 1}`,
  productPrice: 19900 + index * 1000,
  productImage: `https://ads-partners.coupang.com/image1/sample-${index}.jpg`,
  deeplink: `https://link.coupang.com/a/sample${index}`,
  canonicalUrl: `https://www.coupang.com/vp/products/${1000 + index}`,
  isRocket: index % 2 === 0,
  categoryName: '패션의류',
}));

const options = { asOfDate: '2026-10-29' };

test('세 편의 글 설정이 모두 갖춰져 있다', () => {
  assert.equal(WINTER_POSTS.length, 3);
  for (const post of WINTER_POSTS) {
    assert.match(post.slug, /^winter-[a-z-]+$/);
    assert.match(post.subId, /^winter-[a-z-]+$/);
    assert.ok(post.title.length >= 15, `${post.slug} 제목이 너무 짧습니다.`);
    assert.ok(post.labels.length >= 3, `${post.slug} 라벨이 부족합니다.`);
    assert.equal(post.complaints.length, 3);
    assert.equal(post.needs.length, 3);
    assert.equal(post.criteria.length, 3);
    assert.ok(post.caution.length > 20);
    assert.ok(post.faq.length >= 3, `${post.slug} FAQ가 부족합니다.`);
    assert.ok(post.sources.length >= 1, `${post.slug} 참고 자료가 없습니다.`);
    for (const [, url] of post.sources) {
      assert.match(url, /^https:\/\//);
    }
  }
});

test('슬러그와 subId는 글마다 고유하다', () => {
  const slugs = new Set(WINTER_POSTS.map((post) => post.slug));
  const subIds = new Set(WINTER_POSTS.map((post) => post.subId));
  assert.equal(slugs.size, 3);
  assert.equal(subIds.size, 3);
});

test('본문은 마커로 시작하고 면책 문구로 끝난다', () => {
  const built = buildPost(WINTER_POSTS[0], sampleItems, options);
  assert.ok(built.content.startsWith(markerFor(WINTER_POSTS[0].slug)));
  assert.ok(built.content.trimEnd().endsWith('</div>'));
  assert.ok(built.content.includes(DISCLOSURE_TEXT));
});

test('모든 상품 링크는 파트너스 딥링크이고 rel 속성이 붙는다', () => {
  const built = buildPost(WINTER_POSTS[1], sampleItems, options);
  const hrefs = [...built.content.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  const coupangLinks = hrefs.filter((href) => href.includes('coupang.com'));
  assert.equal(coupangLinks.length, sampleItems.length);
  for (const href of coupangLinks) {
    assert.match(href, /^https:\/\/link\.coupang\.com\/a\//);
  }
  const relCount = (built.content.match(/rel="sponsored nofollow noopener"/g) || []).length;
  assert.equal(relCount, sampleItems.length);
});

test('상품마다 이미지와 조회 기준일이 표시된다', () => {
  const built = buildPost(WINTER_POSTS[2], sampleItems, options);
  const images = (built.content.match(/<img\b/g) || []).length;
  assert.equal(images, sampleItems.length);
  const asOf = (built.content.match(/2026-10-29 조회 가격/g) || []).length;
  assert.equal(asOf, sampleItems.length);
});

test('가격은 천 단위 구분 기호와 원으로 표기된다', () => {
  assert.equal(formatPrice(19900), '19,900원');
  assert.equal(formatPrice(99000), '99,000원');
  const built = buildPost(WINTER_POSTS[0], sampleItems, options);
  assert.ok(built.content.includes('19,900원'));
});

test('상품이 다섯 개 미만이면 거부한다', () => {
  assert.throws(
    () => buildPost(WINTER_POSTS[0], sampleItems.slice(0, 4), options),
    /상품이 5개 이상/,
  );
});

test('딥링크가 아닌 링크는 거부한다', () => {
  const bad = sampleItems.map((item, index) => (
    index === 2 ? { ...item, deeplink: 'https://www.coupang.com/vp/products/1002' } : item
  ));
  assert.throws(() => buildPost(WINTER_POSTS[0], bad, options), /딥링크/);
});

test('체험을 주장하는 표현은 본문에 쓰지 않는다', () => {
  for (const post of WINTER_POSTS) {
    const built = buildPost(post, sampleItems, options);
    const text = built.content.replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /직접\s*(?:입어|써|사용|체험)/, `${post.slug} 체험 주장 표현이 있습니다.`);
    assert.doesNotMatch(text, /효과를\s*보장|최저가 보장/, `${post.slug} 보장 표현이 있습니다.`);
  }
});

test('관련 글이 주어지면 내부 링크 블록을 넣는다', () => {
  const related = [
    { title: '다른 겨울 글', url: 'https://goldpick-choice.blogspot.com/2026/10/a.html' },
    { title: '또 다른 겨울 글', url: 'https://goldpick-choice.blogspot.com/2026/10/b.html' },
  ];
  const withLinks = buildPost(WINTER_POSTS[0], sampleItems, { ...options, related });
  assert.ok(withLinks.content.includes('함께 보면 좋은 글'));
  for (const item of related) {
    assert.ok(withLinks.content.includes(item.url), `${item.url} 링크가 없습니다.`);
  }

  const withoutLinks = buildPost(WINTER_POSTS[0], sampleItems, options);
  assert.ok(!withoutLinks.content.includes('함께 보면 좋은 글'));
});

test('불만·니즈·기준과 참고 자료가 본문에 모두 들어간다', () => {
  for (const post of WINTER_POSTS) {
    const built = buildPost(post, sampleItems, options);
    for (const line of [...post.complaints, ...post.needs, ...post.criteria]) {
      assert.ok(built.content.includes(line), `${post.slug}: "${line}" 누락`);
    }
    assert.ok(built.content.includes(post.caution));
    for (const [label, url] of post.sources) {
      assert.ok(built.content.includes(url), `${post.slug}: ${label} 링크 누락`);
    }
  }
});

test('라벨은 Blogger에 그대로 전달된다', () => {
  const built = buildPost(WINTER_POSTS[0], sampleItems, options);
  assert.deepEqual(built.labels, WINTER_POSTS[0].labels);
  assert.equal(built.title, WINTER_POSTS[0].title);
});

test('--only 슬러그 선택이 동작한다', () => {
  const { selectPosts, parseSlugs } = require('../scripts/publish-winter-warm-blogger-posts');
  assert.deepEqual(parseSlugs(['--publish', '--only', 'winter-electric-blanket']), ['winter-electric-blanket']);
  assert.deepEqual(parseSlugs(['--publish']), []);
  assert.equal(selectPosts([]).length, 3);
  assert.equal(selectPosts(['winter-electric-blanket']).length, 1);
  assert.equal(selectPosts(['winter-electric-blanket'])[0].slug, 'winter-electric-blanket');
  assert.throws(() => selectPosts(['nope']), /알 수 없는 슬러그/);
});
