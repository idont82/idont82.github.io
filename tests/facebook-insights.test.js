const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { GraphApiError } = require('../scripts/facebook-graph-api');
const { collectInsights, runCollector } = require('../scripts/collect-facebook-insights');

const NOW = new Date('2026-08-30T00:00:00Z');

test('collector queries published posts one metric at a time and tolerates unsupported metrics', async () => {
  const calls = [];
  const queue = [
    { id: 'published', status: 'published', facebookPostId: 'page_123' },
    { id: 'queued', status: 'queued', facebookPostId: null },
    { id: 'incomplete', status: 'published', facebookPostId: null },
  ];
  const client = {
    getInsight: async (postId, metric) => {
      calls.push([postId, metric]);
      if (metric === 'post_clicks') {
        throw new GraphApiError('Unsupported metric', { status: 400, code: 100 });
      }
      return { data: [{ values: [{ value: 1200 }] }] };
    },
  };
  const result = await collectInsights({
    queue,
    previous: { updatedAt: null, posts: {} },
    client,
    metrics: ['post_impressions_unique', 'post_clicks'],
    now: NOW,
  });
  assert.deepEqual(calls, [
    ['page_123', 'post_impressions_unique'],
    ['page_123', 'post_clicks'],
  ]);
  assert.deepEqual(result, {
    updatedAt: NOW.toISOString(),
    posts: {
      page_123: {
        queueId: 'published',
        metrics: { post_impressions_unique: 1200 },
        unsupportedMetrics: ['post_clicks'],
      },
    },
  });
});

test('network or auth failure leaves the previous result file untouched', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-insights-'));
  const queueFile = path.join(dir, 'queue.json');
  const outputFile = path.join(dir, 'insights.json');
  fs.writeFileSync(queueFile, JSON.stringify([{
    id: 'published',
    status: 'published',
    facebookPostId: 'page_123',
  }]), 'utf8');
  const previous = '{"updatedAt":"old","posts":{"saved":true}}\n';
  fs.writeFileSync(outputFile, previous, 'utf8');
  const client = {
    getInsight: async () => {
      throw new GraphApiError('Network failed', { transient: true });
    },
  };
  await assert.rejects(runCollector({
    queueFile,
    outputFile,
    client,
    metrics: ['post_engaged_users'],
    now: NOW,
  }), GraphApiError);
  assert.equal(fs.readFileSync(outputFile, 'utf8'), previous);
  assert.equal(fs.existsSync(`${outputFile}.tmp`), false);
});
