const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const modelsRoot = path.join(root, 'assets', 'models');

const PER_MODEL = 300 * 1024;
const PER_THEME = 1.8 * 1024 * 1024;
const TOTAL = 4.8 * 1024 * 1024;

function themeDirs() {
  if (!fs.existsSync(modelsRoot)) return [];
  return fs.readdirSync(modelsRoot).filter((name) => fs.statSync(path.join(modelsRoot, name)).isDirectory());
}

test('at least the dino theme has been built', () => {
  assert.ok(themeDirs().includes('dino'), 'assets/models/dino 가 없습니다.');
});

test('every manifest is well formed and links carry subId=clawgame', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    assert.equal(manifest.theme, theme);
    assert.match(manifest.asOfDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(manifest.items.length > 0, `${theme} 매니페스트가 비었습니다.`);

    for (const item of manifest.items) {
      assert.match(item.link, /^https:\/\/link\.coupang\.com\/a\//);
      assert.match(item.link, /[?&]subId=clawgame(&|$)/);
      assert.ok(item.productName && item.priceLabel, `${theme}/${item.char} 상품 정보가 비었습니다.`);
      assert.ok(fs.existsSync(path.join(modelsRoot, theme, item.model)), `${theme}/${item.model} 이 없습니다.`);
      assert.ok(fs.existsSync(path.join(modelsRoot, theme, item.thumbnail)), `${theme}/${item.thumbnail} 이 없습니다.`);
    }
  }
});

test('every model file is a real GLB', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    for (const item of manifest.items) {
      const head = Buffer.alloc(4);
      const fd = fs.openSync(path.join(modelsRoot, theme, item.model), 'r');
      fs.readSync(fd, head, 0, 4, 0);
      fs.closeSync(fd);
      assert.equal(head.toString('ascii'), 'glTF', `${theme}/${item.model} 이 GLB 가 아닙니다.`);
    }
  }
});

test('asset sizes stay inside the budget', () => {
  let total = 0;

  for (const theme of themeDirs()) {
    let themeTotal = 0;
    const dir = path.join(modelsRoot, theme);
    for (const name of fs.readdirSync(dir)) {
      const bytes = fs.statSync(path.join(dir, name)).size;
      themeTotal += bytes;
      if (name.endsWith('.glb')) {
        assert.ok(bytes <= PER_MODEL, `${theme}/${name} ${Math.round(bytes / 1024)}KB > 300KB`);
      }
    }
    assert.ok(themeTotal <= PER_THEME, `${theme} 합계 ${Math.round(themeTotal / 1024)}KB > 1800KB`);
    total += themeTotal;
  }

  assert.ok(total <= TOTAL, `전체 ${Math.round(total / 1024)}KB > ${Math.round(TOTAL / 1024)}KB`);
});

test('no gpu3d credential file is tracked by git', () => {
  const { execFileSync } = require('node:child_process');
  const tracked = execFileSync('git', ['ls-files', 'gpu3d'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', `gpu3d 아래 파일이 추적되고 있습니다: ${tracked}`);
});
