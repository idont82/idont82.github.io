const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const ignoredDirs = new Set(['.git', '.worktrees', '.antigravitycli', 'node_modules']);
const coupangPattern = /(?:link|www|ads-partners)\.coupang\.com/;
const trackingScriptPattern = /\/assets\/coupang-tracking\.js|blog\/assets\/blog\.js|assets\/blog\.js/;

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...collectHtmlFiles(path.join(dir, entry.name)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

test('sitewide Coupang links include a click tracking script', () => {
  const missing = collectHtmlFiles(root)
    .filter((file) => coupangPattern.test(fs.readFileSync(file, 'utf8')))
    .filter((file) => !trackingScriptPattern.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(root, file).replace(/\\/g, '/'));

  assert.deepStrictEqual(missing, []);
});

test('shared Coupang tracking script emits placement-aware GA4 events', () => {
  const script = fs.readFileSync(path.join(root, 'assets/coupang-tracking.js'), 'utf8');

  assert.match(script, /coupang_click/);
  assert.match(script, /coupang_placement/);
  assert.match(script, /coupang_product_type/);
  assert.match(script, /dataLayer\.push/);
  assert.match(script, /gtag\('event'/);
});

test('search pages get a mobile-first Coupang CTA enhancer', () => {
  const script = fs.readFileSync(path.join(root, 'assets/coupang-tracking.js'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'search/assets/style.css'), 'utf8');

  assert.match(script, /function enhanceSearchMobileCta/);
  assert.match(script, /search-mobile-coupang-card/);
  assert.match(script, /coupangPlacement = 'search_mobile_top'/);
  assert.match(style, /\.search-mobile-coupang-card/);
});

test('claw game and guide Coupang links expose useful placement metadata', () => {
  const gameHtml = fs.readFileSync(path.join(root, 'claw-machine.html'), 'utf8');
  const gameJs = fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');
  const guideHtml = fs.readFileSync(path.join(root, 'claw-machine-guide.html'), 'utf8');

  assert.match(gameHtml, /id="coinStatus"/);
  assert.match(gameHtml, /data-coupang-placement="game_coin"/);
  assert.match(gameJs, /coinStatus/);
  assert.match(gameJs, /data-coupang-placement="game_coin"/);
  assert.match(guideHtml, /data-coupang-placement="\$\{item\.placement \|\| 'guide_area_middle'\}"/);
});
