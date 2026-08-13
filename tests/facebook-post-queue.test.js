const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  selectDuePost,
  transitionPost,
  validateInitialExperiment,
  validateQueue,
  writeQueueAtomic,
} = require('../scripts/facebook-post-queue');

const queue = JSON.parse(fs.readFileSync('data/facebook-post-queue.json', 'utf8'));

test('initial Facebook experiment has 14 unique posts split 11 blog and 3 direct', () => {
  assert.doesNotThrow(() => validateQueue(queue));
  assert.doesNotThrow(() => validateInitialExperiment(queue));
  assert.equal(queue.length, 14);
  assert.equal(queue.filter((item) => item.linkMode === 'blog').length, 11);
  assert.equal(queue.filter((item) => item.linkMode === 'direct').length, 3);
  assert.equal(new Set(queue.map((item) => item.article)).size, 14);
  assert.deepEqual(
    new Set(queue.map((item) => item.category)),
    new Set(['celebrity', 'idol', 'seasonal', 'problem', 'claw'])
  );
});

test('due selection blocks behind failed work and otherwise selects one oldest queued item', () => {
  const sample = queue.slice(0, 2).map((item) => ({ ...item }));
  sample[0].status = 'failed';
  assert.throws(() => selectDuePost(sample, new Date('2026-08-30T00:00:00Z')), /blocked/i);
  sample[0].status = 'queued';
  assert.equal(selectDuePost(sample, new Date('2026-08-30T00:00:00Z')).id, sample[0].id);
});

test('due selection resumes rendered and publishing work before queued work', () => {
  const sample = queue.slice(0, 3).map((item) => ({ ...item }));
  sample[1].status = 'rendered';
  sample[2].status = 'publishing';
  assert.equal(selectDuePost(sample, new Date('2026-08-30T00:00:00Z')).id, sample[1].id);
});

test('queue transitions reject illegal state changes and write atomically', () => {
  const sample = [{ ...queue[0], status: 'queued' }];
  transitionPost(sample, sample[0].id, 'rendered');
  assert.equal(sample[0].status, 'rendered');
  assert.throws(() => transitionPost(sample, sample[0].id, 'published'), /rendered.*publishing/i);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-queue-'));
  const file = path.join(dir, 'queue.json');
  writeQueueAtomic(file, sample);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), sample);
  assert.equal(fs.existsSync(`${file}.tmp`), false);
});

test('queue rejects the same article scheduled less than 60 days apart', () => {
  const duplicate = [
    { ...queue[0], id: 'repeat-a', scheduledAt: '2026-08-10T20:30:00+09:00' },
    {
      ...queue[0],
      id: 'repeat-b',
      shortLinkId: 99,
      scheduledAt: '2026-09-01T20:30:00+09:00',
    },
  ];
  assert.throws(() => validateQueue(duplicate), /60 days/i);
});

test('queue has immutable unique short links and three reviewed card phrases', () => {
  assert.deepEqual(
    queue.map((item) => item.shortLinkId),
    Array.from({ length: 14 }, (_, index) => index + 1)
  );
  for (const item of queue) {
    assert.equal(item.cardCopy.length, 3, `${item.id} must have three card phrases`);
    for (const copy of item.cardCopy) {
      assert.ok(copy.length <= 28, `${item.id} copy must be at most 28 characters`);
      assert.ok((copy.match(/\n/g) || []).length <= 1, `${item.id} copy must be at most two lines`);
    }
  }
});

test('queue rejects duplicate short ids and invalid reviewed copy', () => {
  const duplicate = structuredClone(queue.slice(0, 2));
  duplicate[1].shortLinkId = duplicate[0].shortLinkId;
  assert.throws(() => validateQueue(duplicate), /Duplicate Facebook short link id/);

  const tooLong = structuredClone(queue.slice(0, 1));
  tooLong[0].cardCopy = ['가'.repeat(29), '기준', '비교'];
  assert.throws(() => validateQueue(tooLong), /cardCopy/);
});
