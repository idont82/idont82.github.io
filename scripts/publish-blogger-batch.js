const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { publishExistingPage } = require('./publish-existing-page-to-blogger');

const DEFAULT_LIMIT = 3;
const PUBLIC_ROOT = 'https://idont82.github.io/blog/';
const EXCLUDED_WORDS = /(?:checklist|worldcup|claw-machine|adsense|approval|index|mbti|season-greeting|photocard|tinytan|slime|socks)/i;

function scoreHtml(file, html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1];
  const cards = (html.match(/class=["'][^"']*(?:product-detail-card|laptop-product-card|mobile-conversion-card)[^"']*["']/gi) || []).length;
  const images = (html.match(/<img\b/gi) || []).length;
  const links = (html.match(/link\.coupang\.com/gi) || []).length;
  let score = cards * 30 + Math.min(images, 5) * 4 + Math.min(links, 3) * 8;
  if (/(추천|비교|후기|가이드|홈쇼핑)/i.test(title)) score += 12;
  if (/(건강|노트북|공기청정|제습|침구|다이어트|콜라겐|유산균|시계|운동화)/i.test(`${title}${file}`)) score += 8;
  return { score, title: title.replace(/<[^>]+>/g, '').trim(), cards, images, links };
}

function selectCandidates({ files, htmlByFile, importedSources = new Set(), dirtyFiles = new Set(), limit = DEFAULT_LIMIT }) {
  const candidates = files
    .filter((file) => path.extname(file).toLowerCase() === '.html')
    .filter((file) => !EXCLUDED_WORDS.test(file))
    .filter((file) => !dirtyFiles.has(file))
    .map((file) => {
      const sourceUrl = `${PUBLIC_ROOT}${path.basename(file)}`;
      const html = htmlByFile[file] || '';
      return { file, sourceUrl, ...scoreHtml(file, html) };
    })
    .filter((item) => item.cards >= 3 && item.links >= 1 && !importedSources.has(item.sourceUrl));
  candidates.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
  return candidates.slice(0, limit);
}

async function readImportedSources(root) {
  const dir = path.join(root, '.blogger-artifacts', 'imports');
  let names;
  try { names = await fs.readdir(dir); } catch { return new Set(); }
  const sources = new Set();
  for (const name of names.filter((n) => n.endsWith('.json'))) {
    try {
      const record = JSON.parse(await fs.readFile(path.join(dir, name), 'utf8'));
      if (record.sourceUrl) sources.add(record.sourceUrl);
    } catch { /* ignore incomplete private records */ }
  }
  return sources;
}

function trackedDirtyFiles(root) {
  try {
    const output = execFileSync('git', ['status', '--short', '--', 'blog'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return new Set(output.split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).replaceAll('\\', '/')));
  } catch { return new Set(); }
}

async function runBatch({ root = path.resolve('.'), limit = DEFAULT_LIMIT, publisher = publishExistingPage, now = new Date(), writeRun } = {}) {
  const blogDir = path.join(root, 'blog');
  const names = (await fs.readdir(blogDir)).filter((name) => name.endsWith('.html')).sort();
  const files = names.map((name) => `blog/${name}`);
  const htmlByFile = {};
  for (const file of files) htmlByFile[file] = await fs.readFile(path.join(root, file), 'utf8');
  const selected = selectCandidates({ files, htmlByFile, importedSources: await readImportedSources(root), dirtyFiles: trackedDirtyFiles(root), limit });
  const results = [];
  for (const candidate of selected) {
    try {
      results.push({ ...candidate, result: await publisher({ file: candidate.file, sourceUrl: candidate.sourceUrl, dependencies: { root } }) });
    } catch (error) {
      results.push({ ...candidate, error: error.message });
    }
  }
  const run = { ranAt: now.toISOString(), limit, selected: selected.map(({ file, sourceUrl, score, title }) => ({ file, sourceUrl, score, title })), results };
  const writer = writeRun || (async (value) => {
    const file = path.join(root, '.blogger-artifacts', 'batch-runs', `${value.ranAt.replace(/[:.]/g, '-')}.json`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  });
  await writer(run);
  if (results.some((item) => item.error)) throw new Error(`Blogger batch completed with ${results.filter((item) => item.error).length} failure(s).`);
  return run;
}

function parseArguments(argv) {
  const index = argv.indexOf('--limit');
  const limit = index >= 0 ? Number(argv[index + 1]) : DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('Usage: ... --limit <1-10>');
  return { limit };
}

if (require.main === module) {
  runBatch({ limit: parseArguments(process.argv.slice(2)).limit })
    .then((run) => process.stdout.write(`${JSON.stringify(run, null, 2)}\n`))
    .catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}

module.exports = { parseArguments, scoreHtml, selectCandidates, runBatch };
