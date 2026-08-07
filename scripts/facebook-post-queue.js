const fs = require('node:fs');
const path = require('node:path');

const ALLOWED_STATES = new Set(['queued', 'rendered', 'publishing', 'published', 'failed']);
const TRANSITIONS = {
  queued: new Set(['rendered', 'failed']),
  rendered: new Set(['publishing', 'failed']),
  publishing: new Set(['published', 'failed']),
  published: new Set(),
  failed: new Set(['queued']),
};
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

function validateQueue(queue) {
  if (!Array.isArray(queue)) {
    throw new Error('Facebook queue must be an array');
  }

  const ids = new Set();
  for (const item of queue) {
    for (const field of ['id', 'category', 'article', 'linkMode', 'scheduledAt', 'status']) {
      if (!item[field]) {
        throw new Error(`${item.id || 'queue item'} missing ${field}`);
      }
    }
    if (ids.has(item.id)) {
      throw new Error(`Duplicate Facebook queue id: ${item.id}`);
    }
    ids.add(item.id);
    if (!item.article.startsWith('/blog/') || !item.article.endsWith('.html')) {
      throw new Error(`${item.id} has invalid article path`);
    }
    if (!['blog', 'direct'].includes(item.linkMode)) {
      throw new Error(`${item.id} has invalid linkMode`);
    }
    if (!ALLOWED_STATES.has(item.status)) {
      throw new Error(`${item.id} has invalid status`);
    }
    if (Number.isNaN(Date.parse(item.scheduledAt))) {
      throw new Error(`${item.id} has invalid scheduledAt`);
    }
  }

  const byArticle = new Map();
  const scheduled = [...queue].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
  for (const item of scheduled) {
    if (item.status === 'failed') {
      continue;
    }
    const previous = byArticle.get(item.article);
    if (previous && Date.parse(item.scheduledAt) - Date.parse(previous.scheduledAt) < SIXTY_DAYS_MS) {
      throw new Error(`${item.article} repeats within 60 days`);
    }
    byArticle.set(item.article, item);
  }
  return queue;
}

function validateInitialExperiment(queue) {
  validateQueue(queue);
  if (queue.length !== 14) {
    throw new Error('Initial Facebook experiment must contain 14 posts');
  }
  if (queue.filter((item) => item.linkMode === 'blog').length !== 11) {
    throw new Error('Expected 11 blog posts');
  }
  if (queue.filter((item) => item.linkMode === 'direct').length !== 3) {
    throw new Error('Expected 3 direct posts');
  }
  if (new Set(queue.map((item) => item.article)).size !== queue.length) {
    throw new Error('60-day seed set must be unique');
  }
  return queue;
}

function selectDuePost(queue, now = new Date()) {
  validateQueue(queue);
  if (queue.some((item) => item.status === 'failed')) {
    throw new Error('Facebook queue is blocked by failed work');
  }
  const recovering = queue.find((item) => ['rendered', 'publishing'].includes(item.status));
  if (recovering) {
    return recovering;
  }
  return queue
    .filter((item) => item.status === 'queued' && Date.parse(item.scheduledAt) <= now.getTime())
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0] || null;
}

function transitionPost(queue, id, nextState, patch = {}) {
  const item = queue.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Unknown Facebook queue id: ${id}`);
  }
  if (!TRANSITIONS[item.status].has(nextState)) {
    const allowed = [...TRANSITIONS[item.status]].join(', ') || 'none';
    throw new Error(`Illegal Facebook queue transition: ${item.status} -> ${nextState}; expected one of: ${allowed}`);
  }
  Object.assign(item, patch, { status: nextState });
  return item;
}

function readQueue(file) {
  return validateQueue(JSON.parse(fs.readFileSync(file, 'utf8')));
}

function writeQueueAtomic(file, queue) {
  validateQueue(queue);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

module.exports = {
  ALLOWED_STATES,
  readQueue,
  selectDuePost,
  transitionPost,
  validateInitialExperiment,
  validateQueue,
  writeQueueAtomic,
};
