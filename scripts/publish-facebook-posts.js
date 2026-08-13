const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { buildPostContent } = require('./facebook-card-content');
const { FacebookGraphClient } = require('./facebook-graph-api');
const {
  readQueue,
  selectDuePost,
  transitionPost,
  writeQueueAtomic,
} = require('./facebook-post-queue');

const DEFAULT_QUEUE = 'data/facebook-post-queue.json';
const DEFAULT_OUTPUT = '.facebook-artifacts';

function parseArgs(argv) {
  const options = {
    queue: DEFAULT_QUEUE,
    outputDir: DEFAULT_OUTPUT,
    now: null,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--queue') {
      options.queue = argv[++index];
    } else if (argument === '--output-dir') {
      options.outputDir = argv[++index];
    } else if (argument === '--now') {
      options.now = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
    if (argument !== '--dry-run' && !argv[index]) {
      throw new Error(`${argument} requires a value`);
    }
  }
  if (options.now && Number.isNaN(Date.parse(options.now))) {
    throw new Error('--now must be a valid ISO-8601 date');
  }
  return options;
}

function renderWithPython(content, directory, root = path.resolve(__dirname, '..')) {
  fs.mkdirSync(directory, { recursive: true });
  const input = path.join(directory, 'content.json');
  fs.writeFileSync(input, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  const result = spawnSync('python', [
    path.join(root, 'scripts', 'generate-facebook-cards.py'),
    '--input', input,
    '--output-dir', directory,
  ], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || 'Facebook card renderer failed').trim());
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  return manifest.cards;
}

function sanitizeError(error, token = '') {
  let message = error instanceof Error ? error.message : String(error);
  const secrets = [token, process.env.META_PAGE_ACCESS_TOKEN]
    .filter((secret) => typeof secret === 'string' && secret);
  for (const secret of secrets) {
    message = message.split(secret).join('[redacted]');
    message = message.split(encodeURIComponent(secret)).join('[redacted]');
  }
  return message.slice(0, 500);
}

async function runPublisher({
  queueFile,
  root,
  outputRoot,
  now = new Date(),
  dryRun = false,
  graphClient = null,
  renderCards = null,
}) {
  const queue = readQueue(queueFile);
  const item = selectDuePost(queue, now);
  if (!item) return { status: 'idle' };
  const renderer = renderCards || ((content, directory) => renderWithPython(content, directory, root));

  try {
    const articleFile = path.join(root, item.article.replace(/^\//, ''));
    const html = fs.readFileSync(articleFile, 'utf8');
    const content = buildPostContent(item, html);
    const directory = path.join(outputRoot, item.id);
    const files = await renderer(content, directory);

    if (dryRun) return { status: 'dry-run', id: item.id, files, content };
    if (!graphClient) throw new Error('Facebook Graph client is required outside dry-run');

    if (item.status === 'queued') {
      transitionPost(queue, item.id, 'rendered', {
        trackingId: content.trackingId,
        lastError: null,
      });
      writeQueueAtomic(queueFile, queue);
    }
    if (item.status === 'rendered') {
      transitionPost(queue, item.id, 'publishing');
      writeQueueAtomic(queueFile, queue);
    }

    const duplicate = await graphClient.findDuplicate(content.duplicateMarker);
    if (duplicate) {
      transitionPost(queue, item.id, 'published', {
        trackingId: content.trackingId,
        facebookPostId: duplicate.id,
        facebookPermalink: duplicate.permalink_url,
        publishedAt: duplicate.created_time || now.toISOString(),
        lastError: null,
      });
      writeQueueAtomic(queueFile, queue);
      return { status: 'recovered', id: item.id };
    }

    const post = await graphClient.publishCarousel({ files, message: content.caption });
    if (!post?.id) throw new Error('Facebook did not confirm the published post ID');
    transitionPost(queue, item.id, 'published', {
      trackingId: content.trackingId,
      facebookPostId: post.id,
      facebookPermalink: post.permalink_url || null,
      publishedAt: post.created_time || now.toISOString(),
      lastError: null,
    });
    writeQueueAtomic(queueFile, queue);
    return { status: 'published', id: item.id, post };
  } catch (error) {
    if (!dryRun && ['queued', 'rendered', 'publishing'].includes(item.status)) {
      transitionPost(queue, item.id, 'failed', {
        attempts: (item.attempts || 0) + 1,
        lastError: sanitizeError(error, graphClient?.token),
        facebookPostId: null,
        facebookPermalink: null,
      });
      writeQueueAtomic(queueFile, queue);
    }
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(__dirname, '..');
  const now = options.now ? new Date(options.now) : new Date();
  const graphClient = options.dryRun ? null : new FacebookGraphClient({
    pageId: process.env.META_PAGE_ID,
    token: process.env.META_PAGE_ACCESS_TOKEN,
    version: process.env.META_GRAPH_VERSION || 'v25.0',
  });
  const result = await runPublisher({
    queueFile: path.resolve(root, options.queue),
    root,
    outputRoot: path.resolve(root, options.outputDir),
    now,
    dryRun: options.dryRun,
    graphClient,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${sanitizeError(error, process.env.META_PAGE_ACCESS_TOKEN)}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_OUTPUT,
  DEFAULT_QUEUE,
  parseArgs,
  renderWithPython,
  runPublisher,
  sanitizeError,
};
