const fs = require('node:fs');
const path = require('node:path');

const { FacebookGraphClient } = require('./facebook-graph-api');

const DEFAULT_METRICS = [
  'post_impressions_unique',
  'post_engaged_users',
  'post_clicks',
];

async function collectInsights({
  queue,
  previous,
  client,
  metrics = DEFAULT_METRICS,
  now = new Date(),
}) {
  const next = structuredClone(previous);
  next.updatedAt = now.toISOString();
  next.posts ||= {};
  const published = queue.filter((item) => item.status === 'published' && item.facebookPostId);
  for (const item of published) {
    const record = {
      queueId: item.id,
      metrics: {},
      unsupportedMetrics: [],
    };
    for (const metric of metrics) {
      try {
        const response = await client.getInsight(item.facebookPostId, metric);
        record.metrics[metric] = response.data?.[0]?.values?.at(-1)?.value ?? null;
      } catch (error) {
        if (error?.code === 100) {
          record.unsupportedMetrics.push(metric);
        } else {
          throw error;
        }
      }
    }
    next.posts[item.facebookPostId] = record;
  }
  return next;
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

async function runCollector({
  queueFile,
  outputFile,
  client,
  metrics = DEFAULT_METRICS,
  now = new Date(),
}) {
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const previous = fs.existsSync(outputFile)
    ? JSON.parse(fs.readFileSync(outputFile, 'utf8'))
    : { updatedAt: null, posts: {} };
  const next = await collectInsights({ queue, previous, client, metrics, now });
  writeJsonAtomic(outputFile, next);
  return next;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const metrics = process.env.FACEBOOK_INSIGHT_METRICS
    ? process.env.FACEBOOK_INSIGHT_METRICS.split(',').map((metric) => metric.trim()).filter(Boolean)
    : DEFAULT_METRICS;
  const client = new FacebookGraphClient({
    pageId: process.env.META_PAGE_ID,
    token: process.env.META_PAGE_ACCESS_TOKEN,
    version: process.env.META_GRAPH_VERSION || 'v25.0',
  });
  const result = await runCollector({
    queueFile: path.join(root, 'data', 'facebook-post-queue.json'),
    outputFile: path.join(root, 'data', 'facebook-post-insights.json'),
    client,
    metrics,
  });
  process.stdout.write(`${JSON.stringify({
    updatedAt: result.updatedAt,
    posts: Object.keys(result.posts).length,
  })}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_METRICS,
  collectInsights,
  runCollector,
  writeJsonAtomic,
};
