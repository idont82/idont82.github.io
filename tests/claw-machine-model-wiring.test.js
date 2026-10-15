const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = () => fs.readFileSync(path.join(root, 'claw-machine.html'), 'utf8');
const js = () => fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');

test('importmap pins three to 0.162.0 and no longer maps the addons path', () => {
  const source = html();
  assert.match(source, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.162\.0\/build\/three\.module\.js"/);
  // 애드온은 GLTFLoader 를 위해서만 있었다. 모델을 안 읽으니 매핑도 남길 이유가 없다.
  assert.doesNotMatch(source, /three\/addons\//);
});

test('the game imports the theme loader for product data only', () => {
  const source = js();
  assert.match(source, /import\s*\{[^}]*createThemeLoader[^}]*\}\s*from\s*'\.\/assets\/plushie-loader\.js'/);
  // 모델 교체용 three 글루는 삭제됐다. 되살아나면 모델 경로가 함께 돌아온 것이다.
  assert.doesNotMatch(source, /plushie-three/);
  assert.ok(!fs.existsSync(path.join(root, 'assets', 'plushie-three.js')), 'plushie-three.js 가 돌아왔습니다.');
});

test('no client code loads or places a GLB model any more', () => {
  // 생성된 모델은 손으로 만든 절차적 인형보다 못생겼다는 판단으로 걷어냈다.
  // 상품 카드·수집함은 매니페스트만 읽으므로 수익 경로는 모델과 무관하다.
  const clientFiles = ['claw-machine.js', 'claw-machine.html']
    .concat(fs.readdirSync(path.join(root, 'assets')).filter((f) => f.endsWith('.js')).map((f) => `assets/${f}`));

  for (const file of clientFiles) {
    // 주석은 이 경로가 왜 사라졌는지 설명하느라 옛 이름을 그대로 적는다. 코드만 본다.
    const code = fs.readFileSync(path.join(root, file), 'utf8')
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .join('\n');

    assert.doesNotMatch(code, /GLTFLoader/, `${file} 이 GLTFLoader 를 참조합니다.`);
    assert.doesNotMatch(code, /three\/addons\//, `${file} 이 애드온 CDN 을 참조합니다.`);
    assert.doesNotMatch(code, /swapPlushieMesh|modelPlacement|fitTransform|themeModels|modelUrl/, `${file} 에 모델 교체 배선이 남아 있습니다.`);
    assert.doesNotMatch(code, /\.glb/i, `${file} 이 .glb 를 요청합니다.`);
  }
});

test('createPlushie builds every plushie procedurally, with nothing swapped in', () => {
  const source = js();
  const body = source.match(/function createPlushie\(type, position, rotation, customScale\)\{([\s\S]*?)\n  return g;\n\}/);
  assert.ok(body, 'createPlushie not found');

  const text = body[1];
  const procedural = [...text.matchAll(/new THREE\.(Sphere|Capsule|Cone|Torus|Box|Cylinder)Geometry\(/g)];
  assert.ok(procedural.length > 20, `절차적 지오메트리가 ${procedural.length}개뿐이다`);
  // 물리와 수집함이 읽는 userData 는 그대로 달려 나간다.
  assert.match(text, /g\.userData = \{type: t\.name, char: t\.char, theme: currentTheme, grabbed: false, radius: s\*1\.2\};/);
  // 교체 분기가 돌아오면 절차적 인형이 다시 가려진다.
  assert.doesNotMatch(text, /loadedModel|swapPlushieMesh/);
});

test('the procedural measuring probe is gone with the model path', () => {
  // 절차적 인형 상자를 재는 코드는 모델을 그 상자에 끼우기 위해서만 있었다.
  const source = js();
  assert.doesNotMatch(source, /proceduralPlushieBox|proceduralBoxCache|PROBE_CHAR|measureBox/);
});

test('the dev server still serves webp thumbnails with a real MIME type', () => {
  // 상품 카드의 썸네일이 .webp 다. 잘못된 MIME 으로 나가면 카드가 깨진 그림을 그린다.
  const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.match(source, /'\.webp':\s*'image\/webp'/);
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

test('the coin footer and the win card both render product cards', () => {
  const source = js();
  assert.match(source, /cardsHtml\(themeManifest\.items, \{ placement: 'game_coin', theme: currentTheme, limit: 3 \}\)/);
  assert.match(source, /cardHtml\(entry, \{ placement: 'game_success', theme: currentTheme \}\)/);
  // 위젯만은 따로 집계한다.
  assert.match(html() + source, /subId=clawwidget/);
});

test('the page still carries its SEO head and the partners disclosure', () => {
  const source = html();
  assert.match(source, /<title>[^<]*인형뽑기[^<]*<\/title>/);
  assert.match(source, /쿠팡 파트너스 활동의 일환으로 수수료를 제공받습니다/);
});

test('requestThemeManifest drops the previous theme before asking the loader', () => {
  // 매니페스트가 없는 테마는 null 을 돌려받아 applyLoadedTheme 에서 일찍 끝난다.
  // 그때 이전 테마의 상품이 남지 않으려면 로더 호출보다 먼저 비워야 한다.
  const match = js().match(/function requestThemeManifest\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(match, 'requestThemeManifest not found');
  const body = match[1];
  const loadAt = body.indexOf('themeLoader.load(');
  const manifestAt = body.search(/^\s*themeManifest\s*=\s*null;/m);
  assert.ok(loadAt >= 0, 'loader call missing');
  assert.ok(manifestAt >= 0 && manifestAt < loadAt, 'themeManifest must be reset before the load');
});

test('the theme switch asks for the new manifest and respawns procedurally', () => {
  const handler = js().match(/#charSelector button'\)\.forEach\(btn=>\{([\s\S]*?)\n\}\);/);
  assert.ok(handler, 'theme selector handler not found');
  assert.match(handler[1], /requestThemeManifest\(\)/);
  assert.match(handler[1], /spawnPlushies\(\)/);
  // 이전 테마의 가격 줄을 바로 지운다.
  assert.match(handler[1], /renderCollection\(\)/);
});

test('applyLoadedTheme keeps its stale-response guard', () => {
  assert.match(js(), /result\.theme\s*!==\s*currentTheme/);
});

test('no banner image markup is left behind once cards replace it', () => {
  // Task 9 에서 카드로 바뀐 뒤에도 이 테스트가 지켜 준다.
  assert.doesNotMatch(html(), /image\d*\.coupangcdn\.com\/image\/affiliate\/banner/);
});
