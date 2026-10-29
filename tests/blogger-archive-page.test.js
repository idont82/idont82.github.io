const assert = require('node:assert/strict');
const test = require('node:test');

const { buildArchivePage, ARCHIVE_MARKER, groupByLabel } = require('../scripts/blogger-archive-page');

const posts = [
  { title: '경량패딩 고르는 법', url: 'https://goldpick-choice.blogspot.com/2026/10/blog-post.html', published: '2026-10-29T01:39:00Z', labels: ['구매 가이드', '패딩'] },
  { title: '롱패딩 고르는 법', url: 'https://goldpick-choice.blogspot.com/2026/10/long.html', published: '2026-10-05T00:00:00Z', labels: ['구매 가이드', '패딩'] },
  { title: '가성비 노트북 추천', url: 'https://goldpick-choice.blogspot.com/2026/09/laptop.html', published: '2026-09-10T00:00:00Z', labels: ['구매 가이드', '노트북'] },
  { title: '제습기 vs 에어컨 제습', url: 'https://goldpick-choice.blogspot.com/2026/08/dehumidifier.html', published: '2026-08-01T00:00:00Z', labels: ['구매 가이드'] },
  { title: '라벨 없는 글 <b>주의</b>', url: 'https://goldpick-choice.blogspot.com/2026/07/none.html', published: '2026-07-05T00:00:00Z', labels: [] },
];

test('마커로 시작한다', () => {
  const page = buildArchivePage(posts);
  assert.ok(page.content.startsWith(ARCHIVE_MARKER));
  assert.equal(page.title, '전체 글 목록');
});

test('모든 글의 URL이 한 번씩 들어간다', () => {
  const content = buildArchivePage(posts).content;
  for (const post of posts) {
    const hits = content.split(post.url).length - 1;
    assert.equal(hits, 1, `${post.url} 가 ${hits}번 나옵니다.`);
  }
});

// 모든 글에 붙은 넓은 라벨('구매 가이드')로 묶으면 묶음 하나에 전부 들어가 목록이
// 쓸모없어진다. 그래서 블로그 전체에서 가장 드물게 쓰인 라벨을 그 글의 주제로 본다.
test('가장 좁은 라벨로 묶고 라벨이 없으면 기타로 보낸다', () => {
  const groups = groupByLabel(posts);
  const names = groups.map((group) => group.label);
  assert.deepEqual(names, ['패딩', '구매 가이드', '노트북', '기타']);
  assert.equal(groups[0].posts.length, 2);
  assert.equal(groups.at(-1).posts[0].title, '라벨 없는 글 <b>주의</b>');
});

test('묶음 안에서 최신 글이 먼저 온다', () => {
  const padding = groupByLabel(posts)[0];
  assert.deepEqual(padding.posts.map((post) => post.title), ['경량패딩 고르는 법', '롱패딩 고르는 법']);
});

test('제목의 HTML은 이스케이프한다', () => {
  const content = buildArchivePage(posts).content;
  assert.ok(content.includes('라벨 없는 글 &lt;b&gt;주의&lt;/b&gt;'));
  assert.ok(!content.includes('<b>주의</b>'));
});

test('글 링크에는 nofollow를 붙이지 않는다', () => {
  const content = buildArchivePage(posts).content;
  const postAnchors = content.match(/<a href="https:\/\/goldpick-choice\.blogspot\.com\/20[^"]*"[^>]*>/g) || [];
  assert.equal(postAnchors.length, posts.length);
  for (const anchor of postAnchors) {
    assert.ok(!anchor.includes('nofollow'), `크롤링을 막는 rel이 붙었습니다: ${anchor}`);
  }
});

test('발행일을 함께 보여준다', () => {
  const content = buildArchivePage(posts).content;
  assert.ok(content.includes('2026-10-29'));
  assert.ok(content.includes('2026-07-05'));
});

test('글 수를 안내한다', () => {
  const content = buildArchivePage(posts).content;
  assert.ok(content.includes('5개'), '글 개수 안내가 없습니다.');
});

test('글이 없으면 거부한다', () => {
  assert.throws(() => buildArchivePage([]), /글이 없습니다/);
});
