const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const queue = require('../data/facebook-laptop-post-queue.json');
const { buildPostContent } = require('../scripts/facebook-card-content');
const { renderWithPython } = require('../scripts/publish-facebook-posts');

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('노트북 게시물 세 건을 링크 첫 줄로 모두 렌더링한다', () => {
  const root = path.join(__dirname, '..');
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'laptop-facebook-dry-run-'));

  for (const item of queue) {
    const html = fs.readFileSync(path.join(root, item.article.replace(/^\//, '')), 'utf8');
    const content = buildPostContent(item, html);
    const files = renderWithPython(content, path.join(outputRoot, item.id), root);

    assert.equal(content.caption.split('\n')[0], `https://idont82.github.io/g/?n=${item.shortLinkId}`);
    assert.equal(files.length, 3);
    for (const file of files) {
      assert.deepEqual(pngSize(file), { width: 1080, height: 1350 });
    }
  }
});
