const fs = require('fs');
const https = require('https');
const path = require('path');

const root = path.resolve(__dirname, '..');
const imageDir = path.join(root, 'blog', 'images', 'home-shopping');
const dataFiles = [
  ['coupang-lutein-omega3.json', 'lutein-omega3'],
  ['coupang-probiotics.json', 'probiotics'],
  ['coupang-omega3.json', 'omega3'],
  ['coupang-dehumidifier-current.json', 'dehumidifier'],
  ['coupang-cooling-pad-current.json', 'cooling-pad']
];

fs.mkdirSync(imageDir, { recursive: true });

function extensionFromType(contentType) {
  if (/png/i.test(contentType || '')) {
    return '.png';
  }
  if (/webp/i.test(contentType || '')) {
    return '.webp';
  }
  return '.jpg';
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      rejectUnauthorized: false,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; idont82-image-fetch/1.0)'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: response.headers['content-type'] || ''
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const [file, slug] of dataFiles) {
    const dataPath = path.join(root, 'data', file);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    for (const item of data.items || []) {
      const rank = item.rank || data.items.indexOf(item) + 1;
      const basename = `${slug}-${rank}-${item.productId}`;
      const existing = fs.readdirSync(imageDir).find((name) => name.startsWith(`${basename}.`));
      if (existing) {
        item.localImage = `/blog/images/home-shopping/${existing}`;
        continue;
      }
      const result = await download(item.productImage);
      const ext = extensionFromType(result.contentType);
      const filename = `${basename}${ext}`;
      fs.writeFileSync(path.join(imageDir, filename), result.buffer);
      item.localImage = `/blog/images/home-shopping/${filename}`;
      console.log(item.localImage);
    }
    fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
