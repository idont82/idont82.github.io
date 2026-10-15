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
  // 예전 단정은 `function createPlushie(` 하나뿐이어서 교체 전에도 통과했다 —
  // 즉 절대 빨개질 수 없었다. 이제 절차적 경로가 진짜로 남아 있는지를 본다.
  const source = js();
  const body = source.match(/function createPlushie\(type, position, rotation, customScale\)\{([\s\S]*?)\n  return g;\n\}/);
  assert.ok(body, 'createPlushie not found');

  const text = body[1];
  const swapAt = text.search(/if \(loadedModel\) swapPlushieMesh\(/);
  assert.ok(swapAt > 0, '모델 교체가 createPlushie 안에 있어야 한다');

  // 절차적 지오메트리는 모델 교체와 무관하게 언제나 만들어진다. 교체는 그 뒤에 온다.
  const procedural = [...text.matchAll(/new THREE\.(Sphere|Capsule|Cone|Torus|Box|Cylinder)Geometry\(/g)];
  assert.ok(procedural.length > 20, `절차적 지오메트리가 ${procedural.length}개뿐이다`);
  assert.ok(procedural.every((m) => m.index < swapAt), '모델 교체가 절차적 생성보다 앞에 올 수 없다');

  // 모델이 있을 때만 바꾼다. 조건이 사라지면 모델 없는 7개 캐릭터가 사라진다.
  assert.match(text, /const loadedModel = themeModels\.get\(t\.char\);/);
});

test('the theme switch clears the old models before building the new plushies', () => {
  // createPlushie 는 themeModels 를 읽는다. spawnPlushies 가 먼저 돌면
  // 새 테마의 인형에 이전 테마의 모델이 끼워진다.
  const handler = js().match(/#charSelector button'\)\.forEach\(btn=>\{([\s\S]*?)\n\}\);/);
  assert.ok(handler, 'theme selector handler not found');

  const requestAt = handler[1].indexOf('requestThemeModels()');
  const spawnAt = handler[1].indexOf('spawnPlushies()');
  assert.ok(requestAt >= 0 && spawnAt >= 0, '두 호출이 모두 있어야 한다');
  assert.ok(requestAt < spawnAt, 'requestThemeModels 가 spawnPlushies 보다 먼저여야 한다');
});

test('the dev server serves the new asset types with real MIME types', () => {
  // 브라우저 확인에서 썸네일이 멀쩡한지 보려면 .webp 가 image/webp 로 나가야 한다.
  const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.match(source, /'\.glb':\s*'model\/gltf-binary'/);
  assert.match(source, /'\.webp':\s*'image\/webp'/);
});

test('model swapping preserves userData used by the physics code', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'plushie-three.js'), 'utf8');
  // userData 를 다시 대입하거나 지우면 radius/char/theme 이 사라져 물리와 수집함이 깨진다.
  assert.doesNotMatch(source, /\.userData\s*=\s*\{/);
  assert.match(source, /normalizeTransform/);
});

test('the game never statically imports the addons CDN path', () => {
  // ES 모듈 그래프는 어떤 모듈 본문보다 먼저 해석된다. three 는 받아지는데
  // three/addons/ 하나만 실패하면 정적 import 는 이 파일을 아예 실행하지 못하게 만들고,
  // 그 결과는 절차적 인형이 아니라 빈 캔버스다. 그래서 동적 import 로만 닿는다.
  const source = js();
  assert.doesNotMatch(source, /^\s*import\s[^;]*?from\s*['"]three\/addons\//m);
  assert.match(source, /import\(\s*['"]three\/addons\/loaders\/GLTFLoader\.js['"]\s*\)/);

  const glue = fs.readFileSync(path.join(root, 'assets', 'plushie-three.js'), 'utf8');
  assert.doesNotMatch(glue, /from\s*['"]three/);
});

test('models are seated with the procedural plushie placement, not the longest axis', () => {
  const source = js();
  // 가장 긴 축을 목표 크기에 맞추면 z 로 퍼진 모델이 납작해지고 바닥도 절차적 인형과 어긋난다.
  assert.doesNotMatch(source, /swapPlushieMesh\([^;]*\*\s*2\.4\s*\)/);
  const calls = [...source.matchAll(/swapPlushieMesh\(THREE,[^;]*?\)\)/g)].map(([call]) => call);
  assert.equal(calls.length, 2, `swapPlushieMesh 호출이 2개가 아니다: ${calls.length}`);
  for (const call of calls) assert.match(call, /modelPlacement\(/);

  const glue = fs.readFileSync(path.join(root, 'assets', 'plushie-three.js'), 'utf8');
  assert.match(glue, /axis:\s*'height'/);
  assert.match(glue, /bottomY:\s*placement\.bottomY/);
});

test('the collection shows a price and a link under each plushie that has one', () => {
  const source = js();
  const match = source.match(/function renderCollection\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(match, 'renderCollection not found');
  const body = match[1];

  // 가격 줄은 매니페스트 항목이 있을 때만 그려진다. 없으면 priceLinkHtml 이 빈 문자열이다.
  assert.match(body, /priceLinkHtml\(entryForCard\(c\.char\), \{ placement: 'game_collection' \}\)/);
  assert.match(body, /\$\{buy\}/);
  // 수집함 배치는 코인 푸터·성공 카드와 따로 집계돼야 한다.
  assert.doesNotMatch(body, /game_coin|game_success/);

  // 매니페스트가 늦게 와도 가격 줄이 붙도록 다시 그린다.
  const applied = source.match(/function applyLoadedTheme\(result\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(applied, 'applyLoadedTheme not found');
  assert.match(applied[1], /renderCollection\(\)/);

  const css = fs.readFileSync(path.join(root, 'claw-machine.css'), 'utf8');
  assert.match(css, /\.coll-buy\{/);
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
