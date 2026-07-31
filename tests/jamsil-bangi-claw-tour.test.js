const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pagePath = 'blog/jamsil-bangi-claw-tour.html';
const pageUrl = 'https://idont82.github.io/blog/jamsil-bangi-claw-tour.html';
const storeNames = [
  '캐치팡 프리미엄',
  '미션클리어 방이점',
  '캑티 가챠샵 방이점',
  '대빵오락실 방이점',
  '사격팡 방이점',
  'Koala'
];
const imageNames = [
  'catchpang-exterior.jpg',
  'catchpang-machines.jpg',
  'mission-clear-exterior.jpg',
  'mission-clear-machines.jpg',
  'cacti-exterior.jpg',
  'cacti-ichiban-kuji.jpg',
  'daepang-exterior.jpg',
  'daepang-interior.jpg',
  'shooting-pang-exterior.jpg',
  'shooting-pang-machines.jpg',
  'koala-exterior.jpg',
  'koala-machines.jpg',
  'jamsil-bangi-claw-tour-map-hero.jpg',
  'jamsil-bangi-claw-tour-hero.jpg',
  'jamsil-bangi-claw-tour-og.jpg',
  'jamsil-bangi-claw-tour-thumb.jpg'
];

function readJpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff);
  assert.equal(buffer[1], 0xd8);

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + segmentLength;
  }

  throw new Error('JPEG dimensions were not found');
}

test('Jamsil Bangi claw tour is search-ready and covers six visited stores', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const styles = fs.readFileSync('blog/assets/style.css', 'utf8');

  assert.match(html, /<title>[^<]*잠실역 인형뽑기/);
  assert.match(html, new RegExp(`rel="canonical" href="${pageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, /<meta name="description" content="[^"]*방이먹자골목[^"]*">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/idont82\.github\.io\/blog\/images\/jamsil\/jamsil-bangi-claw-tour-og\.jpg">/);
  assert.match(html, /<figure class="article-hero-photo">\s*<img src="\/blog\/images\/jamsil\/jamsil-bangi-claw-tour-map-hero\.jpg"/);
  assert.match(styles, /\.article-hero-photo img\s*\{[^}]*width:100%;[^}]*height:auto;[^}]*object-fit:contain;/s);
  assert.match(html, /"@type": "BlogPosting"/);
  assert.match(html, /data-area-map="jamsil"/);
  assert.match(html, /정보 확인 기준일 · 2026\.07\.31/);
  storeNames.forEach((store) => assert.match(html, new RegExp(store)));
});

test('Jamsil data exposes the six GPS-backed stores in walking order', () => {
  const area = JSON.parse(fs.readFileSync('data/jamsil.json', 'utf8'));

  assert.equal(area.id, 'jamsil');
  assert.equal(area.station, '잠실역');
  assert.equal(area.spots.length, 6);
  assert.deepEqual(area.spots.map((spot) => spot.name), storeNames);

  area.spots.forEach((spot) => {
    assert.equal(typeof spot.lat, 'number');
    assert.equal(typeof spot.lng, 'number');
    assert.ok(spot.lat > 37.51 && spot.lat < 37.52);
    assert.ok(spot.lng > 127.10 && spot.lng < 127.12);
    assert.ok(spot.address);
    assert.ok(spot.comment);
  });
});

test('Jamsil is promoted from planned area to a six-store tour', () => {
  const areas = JSON.parse(fs.readFileSync('data/areas.json', 'utf8'));
  const jamsil = areas.areas.find((area) => area.id === 'jamsil');
  const blogScript = fs.readFileSync('blog/assets/blog.js', 'utf8');

  assert.ok(jamsil);
  assert.equal(jamsil.spotCount, 6);
  assert.doesNotMatch(JSON.stringify(jamsil), /Coming Soon|투어예정/);
  assert.match(jamsil.summary, /방이먹자골목/);
  assert.match(blogScript, /매장 지도를 불러오는 중입니다/);
  assert.match(blogScript, /jamsil:\s*\[\s*\{\s*name:\s*'잠실역 10번 출구',\s*lat:\s*37\.5145,\s*lng:\s*127\.1048/);
  assert.doesNotMatch(blogScript, /홍대 17곳 지도를 불러오는 중입니다/);
});

test('Jamsil published photos are web-sized JPEGs without EXIF blocks', () => {
  imageNames.forEach((imageName) => {
    const imagePath = `blog/images/jamsil/${imageName}`;
    const image = fs.readFileSync(imagePath);
    const dimensions = readJpegDimensions(image);

    assert.ok(dimensions.width <= 1600, `${imageName} width should be at most 1600px`);
    assert.ok(dimensions.height <= 1600, `${imageName} height should be at most 1600px`);
    assert.ok(image.length < 900 * 1024, `${imageName} should be smaller than 900KB`);
    assert.equal(image.includes(Buffer.from('Exif\0\0', 'binary')), false, `${imageName} should not retain EXIF metadata`);
  });
});

test('Jamsil tour is discoverable from the blog home and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  assert.match(index, /\/blog\/jamsil-bangi-claw-tour\.html/);
  assert.ok(sitemap.includes(pageUrl));
});
