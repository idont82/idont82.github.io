const fs = require('node:fs');
const path = require('node:path');

const { buildShortUrl } = require('./facebook-card-content');
const { FacebookGraphClient } = require('./facebook-graph-api');
const { validateQueue } = require('./facebook-post-queue');

const EXPECTED_OLD_IDS = Object.freeze([
  '1243431898854300_122110686801428837',
  '1243431898854300_122110687095428837',
  '1243431898854300_122110687353428837',
]);

function parseArgs(argv) {
  const options = {
    queue: 'data/facebook-laptop-shopping-post-queue.json',
    dryRun: false,
    confirm: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--queue') {
      options.queue = argv[++index];
      if (!options.queue) throw new Error('--queue requires a value');
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--confirm') {
      options.confirm = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (options.dryRun === options.confirm) {
    throw new Error('Choose exactly one of --dry-run or --confirm');
  }
  return options;
}

function countCards(post) {
  const attachments = Array.isArray(post.attachments?.data) ? post.attachments.data : [];
  const subattachments = attachments.flatMap((attachment) => (
    Array.isArray(attachment.subattachments?.data) ? attachment.subattachments.data : []
  ));
  return subattachments.length || attachments.length;
}

function assertReplacementQueue(queue) {
  validateQueue(queue);
  if (queue.length !== 3 || queue.some((item) => item.status !== 'published')) {
    throw new Error('all replacement posts must be published');
  }
  const oldIds = queue.map((item) => item.replacesFacebookPostId);
  if (JSON.stringify(oldIds) !== JSON.stringify(EXPECTED_OLD_IDS)) {
    throw new Error('replacement allowlist mismatch');
  }
  if (queue.some((item) => !item.facebookPostId || !item.facebookPermalink || !item.publishedAt)) {
    throw new Error('replacement posts are missing publication receipts');
  }
}

async function verifyNewPost(item, graphClient) {
  const post = await graphClient.getPost(item.facebookPostId);
  if (post.id !== item.facebookPostId) {
    throw new Error(`${item.id} returned an unexpected post id`);
  }
  if (post.permalink_url !== item.facebookPermalink) {
    throw new Error(`${item.id} permalink mismatch`);
  }
  const firstLine = typeof post.message === 'string' ? post.message.split(/\r?\n/)[0] : '';
  if (firstLine !== buildShortUrl(item.shortLinkId)) {
    throw new Error(`${item.id} first-line link mismatch`);
  }
  if (countCards(post) !== 3) {
    throw new Error(`${item.id} must have exactly three cards`);
  }
  return {
    id: post.id,
    permalink: post.permalink_url,
    firstLine,
    cards: 3,
  };
}

async function cleanupReplacedPosts({ queue, graphClient, dryRun }) {
  assertReplacementQueue(queue);
  const verifiedPosts = [];
  for (const item of queue) {
    verifiedPosts.push(await verifyNewPost(item, graphClient));
  }
  const deleteIds = [...EXPECTED_OLD_IDS];
  if (dryRun) {
    return { status: 'dry-run', verifiedPosts, deleteIds };
  }
  const deletedIds = [];
  for (const id of deleteIds) {
    await graphClient.deletePost(id);
    deletedIds.push(id);
  }
  return { status: 'deleted', verifiedPosts, deletedIds };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(__dirname, '..');
  const queueFile = path.resolve(root, options.queue);
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const graphClient = new FacebookGraphClient({
    pageId: process.env.META_PAGE_ID,
    token: process.env.META_PAGE_ACCESS_TOKEN,
    version: process.env.META_GRAPH_VERSION || 'v25.0',
  });
  const result = await cleanupReplacedPosts({
    queue,
    graphClient,
    dryRun: options.dryRun,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    const token = process.env.META_PAGE_ACCESS_TOKEN || '';
    const safe = token ? String(error.message).split(token).join('[redacted]') : String(error.message);
    process.stderr.write(`${safe}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  EXPECTED_OLD_IDS,
  assertReplacementQueue,
  cleanupReplacedPosts,
  countCards,
  parseArgs,
  verifyNewPost,
};
