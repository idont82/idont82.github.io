const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function getLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

test('sitemap is clean XML with key blog URLs', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const locs = getLocs(sitemap);

  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.doesNotMatch(sitemap, /<!--/);
  assert.doesNotMatch(sitemap, /\.worktrees\//);
  assert.ok(locs.length > 100);
  assert.ok(locs.includes('https://idont82.github.io/blog/seoul-claw-machine-guide.html'));
  assert.ok(locs.includes('https://idont82.github.io/blog/hongdae-claw-tour.html'));
  assert.ok(locs.includes('https://idont82.github.io/blog/jongro-claw-tour.html'));
  assert.ok(locs.includes('https://idont82.github.io/blog/yeonsinnae-claw-tour.html'));
});
