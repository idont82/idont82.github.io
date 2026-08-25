const fs = require('node:fs');
const path = require('node:path');

const queues = [
  require('../data/facebook-post-queue.json'),
  require('../data/facebook-laptop-post-queue.json'),
  require('../data/facebook-laptop-shopping-post-queue.json'),
];
const queue = queues.flat();
const { buildPostContent } = require('./facebook-card-content');
const { validateQueue } = require('./facebook-post-queue');

const projectRoot = path.resolve(__dirname, '..');

function buildMappings(items) {
  validateQueue(items);
  return Object.fromEntries(items.map((item) => {
    const articlePath = path.join(projectRoot, item.article.replace(/^\//, ''));
    const html = fs.readFileSync(articlePath, 'utf8');
    const content = buildPostContent(item, html);
    return [String(item.shortLinkId), content.destinationLink];
  }));
}

function renderRedirectScript(mappings) {
  return `'use strict';

const SHORT_LINKS = Object.freeze(${JSON.stringify(mappings, null, 2)});

function resolveShortLink(value) {
  const number = value === undefined || value === null ? '' : String(value);
  if (!/^[1-9]\\d*$/.test(number)) {
    return '/';
  }
  return SHORT_LINKS[number] || '/';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHORT_LINKS, resolveShortLink };
}
`;
}

function renderIndex() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Gold Pick 링크 이동</title>
</head>
<body>
  <p>Gold Pick 추천 페이지로 이동하고 있습니다.</p>
  <script src="redirect.js"></script>
  <script>
    const number = new URLSearchParams(location.search).get('n');
    location.replace(resolveShortLink(number));
  </script>
</body>
</html>
`;
}

function writeGeneratedFiles() {
  const outputDir = path.join(projectRoot, 'g');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'redirect.js'), renderRedirectScript(buildMappings(queue)));
  fs.writeFileSync(path.join(outputDir, 'index.html'), renderIndex());
}

if (require.main === module) {
  writeGeneratedFiles();
}

module.exports = {
  buildMappings,
  renderIndex,
  renderRedirectScript,
  writeGeneratedFiles,
};
