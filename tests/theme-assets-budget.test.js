const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const modelsRoot = path.join(root, 'assets', 'models');

// 게임은 매니페스트와 썸네일만 읽는다. 생성된 GLB 모델은 손으로 만든 절차적 인형보다
// 못생겨서 런타임에서 걷어냈고, 저장소에도 커밋하지 않는다. 그래서 한도가 예전
// 4.8MB(모델 기준)에서 썸네일 기준으로 내려왔다 — 지금 전체가 35KB 남짓이다.
const PER_THUMBNAIL = 64 * 1024;
const PER_THEME = 256 * 1024;
const TOTAL = 512 * 1024;

function themeDirs() {
  if (!fs.existsSync(modelsRoot)) return [];
  return fs.readdirSync(modelsRoot).filter((name) => fs.statSync(path.join(modelsRoot, name)).isDirectory());
}

function budgetedFiles(theme) {
  const dir = path.join(modelsRoot, theme);
  return fs.readdirSync(dir).filter((file) => /\.(glb|webp)$/i.test(file));
}

test('the themes with products still ship their manifests', () => {
  // 매니페스트는 상품명·가격·쿠팡 링크가 사는 곳이다. 하나도 없으면 수익 경로가 죽은 것이다.
  // (maenggu·hangyodon·doraemon 은 애초에 통과한 상품이 없어 매니페스트가 없다.)
  const dirs = themeDirs();
  assert.deepEqual(dirs.sort(), ['cinnamoroll', 'dino', 'loopy', 'shinchan']);
});

test('every manifest is well formed, and every link carries subId=clawgame', () => {
  // 이 프로젝트가 고치려고 시작한 결함이 바로 빈 subId 다. 이게 가장 중요한 불변식이다.
  let entries = 0;

  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    assert.equal(manifest.theme, theme);
    assert.match(manifest.asOfDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(manifest.items.length > 0, `${theme} 매니페스트가 비었습니다.`);

    for (const item of manifest.items) {
      assert.match(item.link, /^https:\/\/link\.coupang\.com\/a\//);
      assert.match(item.link, /[?&]subId=clawgame(&|$)/, `${theme}/${item.char} 링크에 subId=clawgame 이 없습니다.`);
      assert.match(item.priceAsOf, /^\d{4}-\d{2}-\d{2}$/, `${theme}/${item.char} 에 가격 기준일이 없습니다.`);
      assert.ok(item.productName, `${theme}/${item.char} 상품명이 비었습니다.`);
      assert.ok(item.priceLabel, `${theme}/${item.char} 가격 표시가 비었습니다.`);
      assert.ok(Number.isFinite(item.price) && item.price > 0, `${theme}/${item.char} 가격이 숫자가 아닙니다.`);
      assert.ok(item.char && item.name, `${theme} 항목에 char/name 이 없습니다.`);
      // 카드가 썸네일 경로를 테마 + 파일 이름으로 푼다. 파일이 없으면 깨진 그림이 뜬다.
      assert.ok(
        fs.existsSync(path.join(modelsRoot, theme, item.thumbnail)),
        `${theme}/${item.thumbnail} 이 없습니다.`,
      );
      // 모델은 아무도 읽지 않는다. 필드가 돌아오면 없는 파일을 가리키는 죽은 참조가 된다.
      assert.equal(item.model, undefined, `${theme}/${item.char} 에 model 필드가 남아 있습니다.`);
      entries += 1;
    }
  }

  assert.equal(entries, 9, `상품 항목이 9개가 아니라 ${entries}개입니다.`);
});

test('no GLB model is committed anywhere in the repo', () => {
  const { execFileSync } = require('node:child_process');
  const tracked = execFileSync('git', ['ls-files', '*.glb'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', `.glb 가 추적되고 있습니다: ${tracked}`);
});

test('every thumbnail the manifests point at is a real webp', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    for (const item of manifest.items) {
      const head = fs.readFileSync(path.join(modelsRoot, theme, item.thumbnail)).subarray(0, 12);
      assert.equal(head.subarray(0, 4).toString('ascii'), 'RIFF', `${theme}/${item.thumbnail} 이 RIFF 가 아닙니다.`);
      assert.equal(head.subarray(8, 12).toString('ascii'), 'WEBP', `${theme}/${item.thumbnail} 이 WEBP 가 아닙니다.`);
    }
  }
});

test('no orphan asset is left behind by a manifest entry that went away', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    const used = new Set(manifest.items.map((item) => item.thumbnail));
    for (const name of budgetedFiles(theme)) {
      assert.ok(used.has(name), `${theme}/${name} 을 가리키는 매니페스트 항목이 없습니다.`);
    }
  }
});

test('asset sizes stay inside the budget', () => {
  let total = 0;

  for (const theme of themeDirs()) {
    let themeTotal = 0;
    for (const name of budgetedFiles(theme)) {
      const bytes = fs.statSync(path.join(modelsRoot, theme, name)).size;
      themeTotal += bytes;
      assert.ok(bytes <= PER_THUMBNAIL, `${theme}/${name} ${Math.round(bytes / 1024)}KB > ${PER_THUMBNAIL / 1024}KB`);
    }
    assert.ok(themeTotal <= PER_THEME, `${theme} 합계 ${Math.round(themeTotal / 1024)}KB > ${PER_THEME / 1024}KB`);
    total += themeTotal;
  }

  assert.ok(total <= TOTAL, `전체 ${Math.round(total / 1024)}KB > ${Math.round(TOTAL / 1024)}KB`);
});

test('the CLI budget check and this suite measure the same bytes', () => {
  // CLI 가 "예산 이내" 라고 찍은 뒤 스위트가 터지면 안 된다. 파이프라인은 여전히
  // .glb 를 구울 수 있고 CLI 는 그것까지 세므로, 집계 대상 집합을 맞춰 둔다.
  const { checkBudget, totalAssetBytes } = require('../scripts/assets/build-theme-assets');

  let suiteTotal = 0;
  for (const theme of themeDirs()) {
    for (const name of budgetedFiles(theme)) {
      suiteTotal += fs.statSync(path.join(modelsRoot, theme, name)).size;
    }
  }
  assert.equal(totalAssetBytes(modelsRoot), suiteTotal);

  const budget = checkBudget([], {
    perModel: PER_THUMBNAIL,
    perTheme: PER_THEME,
    total: TOTAL,
    overallBytes: suiteTotal,
  });
  assert.deepEqual(budget, { ok: true, violations: [] });
});

test('no gpu3d credential file is tracked by git', () => {
  const { execFileSync } = require('node:child_process');
  const tracked = execFileSync('git', ['ls-files', 'gpu3d'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', `gpu3d 아래 파일이 추적되고 있습니다: ${tracked}`);
});
