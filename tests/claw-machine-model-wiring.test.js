const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = () => fs.readFileSync(path.join(root, 'claw-machine.html'), 'utf8');
const js = () => fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');

test('importmap pins three and its addons to 0.162.0', () => {
  const source = html();
  assert.match(source, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.162\.0\/build\/three\.module\.js"/);
  assert.match(source, /"three\/addons\/":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.162\.0\/examples\/jsm\/"/);
});

test('the game imports the theme loader and the three glue', () => {
  const source = js();
  assert.match(source, /import\s*\{[^}]*createThemeLoader[^}]*\}\s*from\s*'\.\/assets\/plushie-loader\.js'/);
  assert.match(source, /from\s*'\.\/assets\/plushie-three\.js'/);
});

test('procedural createPlushie is kept as the fallback', () => {
  assert.match(js(), /function createPlushie\(/);
});

test('model swapping preserves userData used by the physics code', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'plushie-three.js'), 'utf8');
  // userData 를 다시 대입하거나 지우면 radius/char/theme 이 사라져 물리와 수집함이 깨진다.
  assert.doesNotMatch(source, /\.userData\s*=\s*\{/);
  assert.match(source, /normalizeTransform/);
});

test('the page still carries its SEO head and the partners disclosure', () => {
  const source = html();
  assert.match(source, /<title>[^<]*인형뽑기[^<]*<\/title>/);
  assert.match(source, /쿠팡 파트너스 활동의 일환으로 수수료를 제공받습니다/);
});

test('requestThemeModels drops the previous theme before asking the loader', () => {
  // 매니페스트가 없는 테마는 null 을 돌려받아 applyLoadedTheme 에서 일찍 끝난다.
  // 그때 이전 테마의 상품·모델이 남지 않으려면 로더 호출보다 먼저 비워야 한다.
  const match = js().match(/function requestThemeModels\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(match, 'requestThemeModels not found');
  const body = match[1];
  const loadAt = body.indexOf('themeLoader.load(');
  const manifestAt = body.search(/^\s*themeManifest\s*=\s*null;/m);
  const modelsAt = body.search(/^\s*themeModels\.clear\(\);/m);
  assert.ok(loadAt >= 0, 'loader call missing');
  assert.ok(manifestAt >= 0 && manifestAt < loadAt, 'themeManifest must be reset before the load');
  assert.ok(modelsAt >= 0 && modelsAt < loadAt, 'themeModels must be cleared before the load');
});

test('applyLoadedTheme keeps its stale-response guard', () => {
  assert.match(js(), /result\.theme\s*!==\s*currentTheme/);
});

test('no banner image markup is left behind once cards replace it', () => {
  // Task 9 에서 카드로 바뀐 뒤에도 이 테스트가 지켜 준다.
  assert.doesNotMatch(html(), /image\d*\.coupangcdn\.com\/image\/affiliate\/banner/);
});
