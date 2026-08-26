const test = require('node:test');
const assert = require('node:assert/strict');

const queue = require('../data/facebook-laptop-post-queue.json');
const {
  selectDuePost,
  transitionPost,
  validateQueue,
} = require('../scripts/facebook-post-queue');

test('노트북 전용 큐는 서로 다른 블로그 글 세 건을 담는다', () => {
  assert.doesNotThrow(() => validateQueue(queue));
  assert.equal(queue.length, 3);
  assert.deepEqual(queue.map((item) => item.shortLinkId), [15, 16, 17]);
  assert.equal(new Set(queue.map((item) => item.article)).size, 3);
  assert.ok(queue.every((item) => item.category === 'laptop'));
  assert.ok(queue.every((item) => item.linkMode === 'blog'));
  assert.ok(queue.every((item) => item.status === 'published'));
  assert.ok(queue.every((item) => item.facebookPostId));
  assert.ok(queue.every((item) => item.facebookPermalink));
  assert.ok(queue.every((item) => item.publishedAt));
});

test('가성비·최고성능·문서용 게시물을 예약 순서대로 선택한다', () => {
  const sample = structuredClone(queue).map((item) => ({
    ...item,
    status: 'queued',
  }));
  const expected = [
    '20260821-laptop-value-top3',
    '20260821-laptop-performance-top3',
    '20260821-laptop-document-top3',
  ];

  for (const id of expected) {
    const selected = selectDuePost(sample, new Date('2026-08-21T01:00:00Z'));
    assert.equal(selected.id, id);
    transitionPost(sample, id, 'rendered');
    transitionPost(sample, id, 'publishing');
    transitionPost(sample, id, 'published');
  }
  assert.equal(selectDuePost(sample, new Date('2026-08-21T01:00:00Z')), null);
});
