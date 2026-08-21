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
  const shortLinkIds = new Set();
  for (const item of queue) {
    for (const field of [
      'id', 'category', 'article', 'linkMode', 'scheduledAt', 'status',
      'shortLinkId', 'cardCopy',
    ]) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        throw new Error(`${item.id || 'queue item'} missing ${field}`);
      }
    }
    if (ids.has(item.id)) {
      throw new Error(`Duplicate Facebook queue id: ${item.id}`);
    }
    ids.add(item.id);
    if (!Number.isSafeInteger(item.shortLinkId) || item.shortLinkId < 1) {
      throw new Error(`${item.id} has invalid shortLinkId`);
    }
    if (shortLinkIds.has(item.shortLinkId)) {
      throw new Error(`Duplicate Facebook short link id: ${item.shortLinkId}`);
    }
    shortLinkIds.add(item.shortLinkId);
    if (!Array.isArray(item.cardCopy) || item.cardCopy.length !== 3) {
      throw new Error(`${item.id} cardCopy must contain exactly three phrases`);
    }
    for (const copy of item.cardCopy) {
      if (typeof copy !== 'string' || !copy.trim() || copy.length > 28
        || (copy.match(/\n/g) || []).length > 1) {
        throw new Error(`${item.id} has invalid cardCopy`);
      }
    }
    if (item.cardTemplate !== undefined && item.cardTemplate !== 'shopping-grid') {
      throw new Error(`${item.id} has invalid cardTemplate`);
    }
    if (item.cardTemplate === 'shopping-grid') {
      if (!Array.isArray(item.shoppingCards) || item.shoppingCards.length !== 3) {
        throw new Error(`${item.id} shoppingCards must contain exactly three cards`);
      }
      for (const card of item.shoppingCards) {
        for (const field of ['hook', 'productName', 'imageUrls', 'specs', 'uses', 'disclaimer']) {
          if (card[field] === undefined || card[field] === null || card[field] === '') {
            throw new Error(`${item.id} shopping card missing ${field}`);
          }
        }
        for (const field of ['hook', 'productName', 'disclaimer']) {
          if (typeof card[field] !== 'string' || !card[field].trim()) {
            throw new Error(`${item.id} shopping card missing ${field}`);
          }
        }
        if (!Array.isArray(card.imageUrls) || !card.imageUrls.length
          || card.imageUrls.some((url) => typeof url !== 'string' || !url.trim())) {
          throw new Error(`${item.id} shopping card imageUrls must contain images`);
        }
        if (!Array.isArray(card.specs) || card.specs.length < 1 || card.specs.length > 3
          || card.specs.some((value) => typeof value !== 'string' || !value.trim())) {
          throw new Error(`${item.id} shopping card specs must contain 1 to 3 items`);
        }
        if (!Array.isArray(card.uses) || card.uses.length < 1 || card.uses.length > 4
          || card.uses.some((value) => typeof value !== 'string' || !value.trim())) {
          throw new Error(`${item.id} shopping card uses must contain 1 to 4 items`);
        }
      }
    }
    if (item.cardImageUrls !== undefined) {
      const safeImagePath = /^\/images\/facebook-card-news\/[a-z0-9-]+\.png$/;
      if (!Array.isArray(item.cardImageUrls) || item.cardImageUrls.length !== 3
        || item.cardImageUrls.some((imagePath) => typeof imagePath !== 'string'
          || !safeImagePath.test(imagePath))) {
        throw new Error(`${item.id} has invalid cardImageUrls`);
      }
    }
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
