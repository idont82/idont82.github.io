const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { parseArguments, selectCandidates, runBatch } = require('../scripts/publish-blogger-batch');

const cardHtml = (title = '추천 상품') => `<html><head><title>${title}</title></head><body>${'<article class="product-detail-card"><img src="x"><a href="https://link.coupang.com/a">구매</a></article>'.repeat(3)}</body></html>`;

test('selectCandidates ranks eligible, clean and unimported pages', () => {
  const files = ['blog/a.html', 'blog/b.html', 'blog/c.html', 'blog/checklist.html'];
  const htmlByFile = { 'blog/a.html': cardHtml('건강식품 추천'), 'blog/b.html': cardHtml('노트북 비교'), 'blog/c.html': cardHtml('일반 상품'), 'blog/checklist.html': cardHtml('체크리스트') };
  const result = selectCandidates({ files, htmlByFile, importedSources: new Set(['https://idont82.github.io/blog/b.html']), dirtyFiles: new Set(['blog/c.html']), limit: 3 });
  assert.deepEqual(result.map((item) => item.file), ['blog/a.html']);
});

test('runBatch publishes selected pages sequentially and records run', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blogger-batch-'));
  await fs.mkdir(path.join(root, 'blog'), { recursive: true });
  await fs.writeFile(path.join(root, 'blog', 'one.html'), cardHtml('첫 상품'));
  await fs.writeFile(path.join(root, 'blog', 'two.html'), cardHtml('둘째 상품'));
  const calls = [];
  let written;
  const run = await runBatch({ root, limit: 2, publisher: async (args) => { calls.push(args.file); return { status: 'published' }; }, now: new Date('2026-09-10T00:00:00Z'), writeRun: async (value) => { written = value; } });
  assert.deepEqual(calls, ['blog/one.html', 'blog/two.html']);
  assert.equal(run.results.length, 2);
  assert.equal(written.ranAt, '2026-09-10T00:00:00.000Z');
});

test('parseArguments validates batch limit', () => {
  assert.deepEqual(parseArguments([]), { limit: 3 });
  assert.deepEqual(parseArguments(['--limit', '2']), { limit: 2 });
  assert.throws(() => parseArguments(['--limit', '0']), /Usage/);
});
