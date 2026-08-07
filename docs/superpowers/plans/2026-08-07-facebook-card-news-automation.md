# Facebook Card News Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate five-slide Facebook card news from existing blog articles, publish one queued post through the Facebook Graph API, and record post-level delivery and tracking data without exposing credentials or duplicating posts.

**Architecture:** A JSON queue is the durable source of truth. Pure Node.js modules validate/select queue items, extract deterministic card copy and affiliate links from existing HTML, and wrap the Graph API; a small Python/Pillow renderer turns the extracted slide model into PNG files. A Node.js orchestrator joins those units, while a scheduled GitHub Actions workflow supplies secrets, runs targeted tests, publishes at most one post, and commits only queue/insight result files.

**Tech Stack:** Vanilla Node.js 24 (`node:test`, built-in `fetch`, `FormData`, `Blob`), Python 3.12 with Pillow 11.3.0, Facebook Graph API, GitHub Actions, existing static HTML/JSON data and GTM click tracking.

---

## Baseline and file map

Work in the isolated worktree:

```text
D:\py_project\claw\idont82.github.io\.worktrees\facebook-card-news-automation
```

The baseline run on 2026-08-07 reported 90 passing tests and one unrelated existing failure in `tests/root-blog-home.test.js`: the test expects claw-tour cards first, while the committed homepage currently places idol-goods cards first. Do not change that test or homepage in this feature.

Create these focused files:

- `data/facebook-post-queue.json`: durable 14-post experiment queue and publishing results.
- `data/facebook-post-insights.json`: latest supported Meta metrics keyed by Facebook post ID.
- `scripts/facebook-post-queue.js`: queue validation, due selection, state transitions, atomic writes.
- `scripts/facebook-card-content.js`: HTML extraction, tracked-link construction, five-slide/caption model.
- `scripts/generate-facebook-cards.py`: deterministic 1080×1350 PNG rendering.
- `scripts/facebook-graph-api.js`: authenticated requests, retries, media upload, publish, duplicate lookup, insights.
- `scripts/publish-facebook-posts.js`: one-post dry-run/publish/recovery orchestration.
- `scripts/collect-facebook-insights.js`: tolerant insight collection and atomic result writes.
- `.github/workflows/facebook-card-news.yml`: manual dry-run and daily 20:30 KST publishing.
- `docs/facebook-card-news-runbook.md`: one-time Meta setup, secrets, dry-run, test-page verification, recovery.
- `tests/facebook-post-queue.test.js`: queue contract and experiment allocation.
- `tests/facebook-card-content.test.js`: extraction, disclosure, UTM and `subid` behavior.
- `tests/facebook-card-renderer.test.js`: real Pillow rendering and overflow rejection.
- `tests/facebook-graph-api.test.js`: retry, upload, duplicate and publish API contracts.
- `tests/facebook-publisher.test.js`: state machine, dry-run, recovery and secret redaction.
- `tests/facebook-insights.test.js`: unsupported-metric tolerance and persisted result shape.
- `tests/facebook-workflow.test.js`: schedule, permissions, secret references and targeted-test workflow contract.

Modify only:

- `.gitignore`: ignore local card artifacts.

## Task 1: Durable queue domain and initial 14-post experiment

**Files:**
- Create: `scripts/facebook-post-queue.js`
- Create: `data/facebook-post-queue.json`
- Create: `tests/facebook-post-queue.test.js`

- [ ] **Step 1: Write the failing queue contract tests**

Create `tests/facebook-post-queue.test.js` with these concrete checks:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  selectDuePost,
  transitionPost,
  validateInitialExperiment,
  validateQueue,
  writeQueueAtomic,
} = require('../scripts/facebook-post-queue');

const queue = JSON.parse(fs.readFileSync('data/facebook-post-queue.json', 'utf8'));

test('initial Facebook experiment has 14 unique posts split 11 blog and 3 direct', () => {
  assert.doesNotThrow(() => validateQueue(queue));
  assert.doesNotThrow(() => validateInitialExperiment(queue));
  assert.equal(queue.length, 14);
  assert.equal(queue.filter((item) => item.linkMode === 'blog').length, 11);
  assert.equal(queue.filter((item) => item.linkMode === 'direct').length, 3);
  assert.equal(new Set(queue.map((item) => item.article)).size, 14);
  assert.deepEqual(
    new Set(queue.map((item) => item.category)),
    new Set(['celebrity', 'idol', 'seasonal', 'problem', 'claw'])
  );
});

test('due selection blocks behind failed work and otherwise selects one oldest queued item', () => {
  const sample = queue.slice(0, 2).map((item) => ({ ...item }));
  sample[0].status = 'failed';
  assert.throws(() => selectDuePost(sample, new Date('2026-08-30T00:00:00Z')), /blocked/i);
  sample[0].status = 'queued';
  assert.equal(selectDuePost(sample, new Date('2026-08-30T00:00:00Z')).id, sample[0].id);
});

test('queue transitions reject illegal state changes and write atomically', () => {
  const sample = [{ ...queue[0] }];
  transitionPost(sample, sample[0].id, 'rendered');
  assert.equal(sample[0].status, 'rendered');
  assert.throws(() => transitionPost(sample, sample[0].id, 'published'), /rendered.*publishing/i);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-queue-'));
  const file = path.join(dir, 'queue.json');
  writeQueueAtomic(file, sample);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), sample);
  assert.equal(fs.existsSync(`${file}.tmp`), false);
});

test('queue rejects the same article scheduled less than 60 days apart', () => {
  const duplicate = [
    { ...queue[0], id: 'repeat-a', scheduledAt: '2026-08-10T20:30:00+09:00' },
    { ...queue[0], id: 'repeat-b', scheduledAt: '2026-09-01T20:30:00+09:00' },
  ];
  assert.throws(() => validateQueue(duplicate), /60 days/i);
});
```

- [ ] **Step 2: Run the queue test and verify the missing-module failure**

Run:

```powershell
node --test tests/facebook-post-queue.test.js
```

Expected: FAIL with `Cannot find module '../scripts/facebook-post-queue'`.

- [ ] **Step 3: Create the 14-item queue with exact dates, categories and link allocation**

Create `data/facebook-post-queue.json`. Use the common result fields shown below on every item, schedule one item per day from 2026-08-10 through 2026-08-23 at `20:30:00+09:00`, and use these exact article/category/link-mode tuples:

```json
[
  ["20260810-seasonal-neck-fan", "seasonal", "/blog/neck-fan-summer-social-guide.html", "blog"],
  ["20260811-celebrity-wonyoung-eider", "celebrity", "/blog/wonyoung-eider-sheer-jacket-guide.html", "blog"],
  ["20260812-idol-blackpink-photocard", "idol", "/blog/blackpink-album-photocard-storage-guide.html", "blog"],
  ["20260813-problem-water-size", "problem", "/blog/water-500ml-vs-2l-guide.html", "direct"],
  ["20260814-claw-plush-guide", "claw", "/blog/claw-machine-popular-plush-buying-guide.html", "blog"],
  ["20260815-seasonal-uv-umbrella", "seasonal", "/blog/uv-umbrella-summer-social-guide.html", "blog"],
  ["20260816-celebrity-suzy-k2", "celebrity", "/blog/suzy-k2-dry-ice-shirt-guide.html", "blog"],
  ["20260817-idol-seventeen-binder", "idol", "/blog/seventeen-photocard-binder-guide.html", "direct"],
  ["20260818-problem-rice-size", "problem", "/blog/instant-rice-210g-vs-130g-guide.html", "blog"],
  ["20260819-claw-jamsil-tour", "claw", "/blog/jamsil-bangi-claw-tour.html", "blog"],
  ["20260820-seasonal-mosquito", "seasonal", "/blog/mosquito-repellent-summer-social-guide.html", "blog"],
  ["20260821-idol-ive-photocard", "idol", "/blog/ive-album-photocard-guide.html", "blog"],
  ["20260822-problem-rainy-commute", "problem", "/blog/rainy-commute-essentials-guide.html", "direct"],
  ["20260823-seasonal-waterpark", "seasonal", "/blog/waterpark-waterproof-kit-social-guide.html", "blog"]
]
```

Expand each tuple into this complete object shape:

```json
{
  "id": "20260810-seasonal-neck-fan",
  "category": "seasonal",
  "article": "/blog/neck-fan-summer-social-guide.html",
  "linkMode": "blog",
  "scheduledAt": "2026-08-10T20:30:00+09:00",
  "status": "queued",
  "attempts": 0,
  "facebookPostId": null,
  "facebookPermalink": null,
  "publishedAt": null,
  "lastError": null,
  "trackingId": null
}
```

- [ ] **Step 4: Implement queue validation, selection, transitions and atomic writes**

Create `scripts/facebook-post-queue.js` with these exported interfaces and rules:

```js
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

function validateQueue(queue) {
  if (!Array.isArray(queue)) throw new Error('Facebook queue must be an array');
  const ids = new Set();
  for (const item of queue) {
    for (const field of ['id', 'category', 'article', 'linkMode', 'scheduledAt', 'status']) {
      if (!item[field]) throw new Error(`${item.id || 'queue item'} missing ${field}`);
    }
    if (ids.has(item.id)) throw new Error(`Duplicate Facebook queue id: ${item.id}`);
    ids.add(item.id);
    if (!item.article.startsWith('/blog/') || !item.article.endsWith('.html')) {
      throw new Error(`${item.id} has invalid article path`);
    }
    if (!['blog', 'direct'].includes(item.linkMode)) throw new Error(`${item.id} has invalid linkMode`);
    if (!ALLOWED_STATES.has(item.status)) throw new Error(`${item.id} has invalid status`);
    if (Number.isNaN(Date.parse(item.scheduledAt))) throw new Error(`${item.id} has invalid scheduledAt`);
  }
  const byArticle = new Map();
  for (const item of [...queue].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))) {
    if (item.status === 'failed') continue;
    const previous = byArticle.get(item.article);
    if (previous && Date.parse(item.scheduledAt) - Date.parse(previous.scheduledAt) < 60 * 24 * 60 * 60 * 1000) {
      throw new Error(`${item.article} repeats within 60 days`);
    }
    byArticle.set(item.article, item);
  }
  return queue;
}

function validateInitialExperiment(queue) {
  validateQueue(queue);
  if (queue.length !== 14) throw new Error('Initial Facebook experiment must contain 14 posts');
  if (queue.filter((item) => item.linkMode === 'blog').length !== 11) throw new Error('Expected 11 blog posts');
  if (queue.filter((item) => item.linkMode === 'direct').length !== 3) throw new Error('Expected 3 direct posts');
  if (new Set(queue.map((item) => item.article)).size !== queue.length) throw new Error('60-day seed set must be unique');
  return queue;
}

function selectDuePost(queue, now = new Date()) {
  validateQueue(queue);
  if (queue.some((item) => item.status === 'failed')) throw new Error('Facebook queue is blocked by failed work');
  const recovering = queue.find((item) => ['rendered', 'publishing'].includes(item.status));
  if (recovering) return recovering;
  return queue
    .filter((item) => item.status === 'queued' && Date.parse(item.scheduledAt) <= now.getTime())
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0] || null;
}

function transitionPost(queue, id, nextState, patch = {}) {
  const item = queue.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown Facebook queue id: ${id}`);
  if (!TRANSITIONS[item.status].has(nextState)) {
    throw new Error(`Illegal Facebook queue transition: ${item.status} -> ${nextState}`);
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
```

- [ ] **Step 5: Run the queue tests and commit**

Run:

```powershell
node --test tests/facebook-post-queue.test.js
```

Expected: 3 tests PASS.

Commit only these files:

```powershell
git add -- data/facebook-post-queue.json scripts/facebook-post-queue.js tests/facebook-post-queue.test.js
git commit -m "feat: add facebook publishing queue"
```

## Task 2: Deterministic blog extraction, disclosure and tracked links

**Files:**
- Create: `scripts/facebook-card-content.js`
- Create: `tests/facebook-card-content.test.js`

- [ ] **Step 1: Write failing extraction and tracking tests**

Create `tests/facebook-card-content.test.js`. Use a temporary HTML fixture so tests do not depend on a specific article layout:

```js
const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildPostContent,
  buildSubid,
  buildTrackedBlogUrl,
  extractArticle,
} = require('../scripts/facebook-card-content');

const html = `<!doctype html><html><head>
  <meta name="description" content="구매 전에 무게와 보관 공간을 비교하세요.">
  <meta property="og:image" content="https://example.com/hero.jpg">
</head><body>
  <h1 class="blog-article-title">테스트 상품 구매 가이드</h1>
  <div class="article-summary-box"><p>한 줄 결론입니다.</p></div>
  <h2>구매 전에 놓치기 쉬운 점</h2>
  <h2>핵심 선택 기준</h2>
  <h3>가벼운 구성이 맞는 사람</h3>
  <h3>대용량 구성이 맞는 사람</h3>
  <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=1&amp;subid=old">상품</a>
</body></html>`;

test('article extraction returns clean Korean text and the first affiliate link', () => {
  const article = extractArticle(html);
  assert.equal(article.title, '테스트 상품 구매 가이드');
  assert.equal(article.summary, '한 줄 결론입니다.');
  assert.deepEqual(article.points.slice(0, 2), ['구매 전에 놓치기 쉬운 점', '핵심 선택 기준']);
  assert.equal(article.coupangUrl, 'https://link.coupang.com/re/AFFSDP?pageKey=1&subid=old');
});

test('blog and direct modes produce stable post-level tracking identifiers', () => {
  const id = '20260813-problem-water-size';
  assert.equal(buildSubid(id), 'fb-20260813-problem-water-size');
  const blogUrl = new URL(buildTrackedBlogUrl('/blog/example.html', id));
  assert.equal(blogUrl.searchParams.get('utm_source'), 'facebook');
  assert.equal(blogUrl.searchParams.get('utm_content'), id);

  const direct = buildPostContent({ id, linkMode: 'direct' }, html);
  assert.equal(new URL(direct.link).searchParams.get('subid'), buildSubid(id));
  assert.match(direct.caption, /쿠팡 파트너스 활동/);
  assert.match(direct.caption, new RegExp(direct.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(direct.slides.length, 5);
  assert.match(direct.slides[4].body, /수수료/);
});
```

- [ ] **Step 2: Run the content test and verify the missing-module failure**

Run:

```powershell
node --test tests/facebook-card-content.test.js
```

Expected: FAIL with `Cannot find module '../scripts/facebook-card-content'`.

- [ ] **Step 3: Implement HTML decoding and article extraction**

Create `scripts/facebook-card-content.js` with no third-party parser. Define these helpers exactly so later tasks can import them:

```js
const DISCLOSURE = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const SITE = 'https://idont82.github.io';

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function cleanText(value = '') {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html, pattern) {
  return cleanText(html.match(pattern)?.[1] || '');
}

function extractArticle(html) {
  const title = firstMatch(html, /<h1[^>]*class="[^"]*blog-article-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const description = decodeHtml(html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '').trim();
  const summary = firstMatch(html, /<div[^>]*class="[^"]*article-summary-box[^"]*"[^>]*>([\s\S]*?)<\/div>/i) || description;
  const imageUrl = decodeHtml(html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || '').trim();
  const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map((match) => cleanText(match[1])).filter(Boolean);
  const coupangUrl = decodeHtml(html.match(/<a[^>]*data-coupang-link[^>]*href="([^"]+)"/i)?.[1]
    || html.match(/<a[^>]*href="([^"]+)"[^>]*data-coupang-link/i)?.[1]
    || '').trim();
  if (!title || !description || headings.length < 3) throw new Error('Article lacks title, description, or three card points');
  return { title, description, summary, imageUrl, points: [...new Set(headings)], coupangUrl };
}
```

- [ ] **Step 4: Implement five-slide content and both link modes**

Append these exact public functions:

```js
function buildSubid(id) {
  const safe = id.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 45);
  return `fb-${safe}`;
}

function buildTrackedBlogUrl(articlePath, id) {
  const url = new URL(articlePath, SITE);
  url.searchParams.set('utm_source', 'facebook');
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'card_news');
  url.searchParams.set('utm_content', id);
  return url.toString();
}

function buildDirectUrl(coupangUrl, id) {
  if (!/^https:\/\/(?:link|www|ads-partners)\.coupang\.com\//i.test(coupangUrl)) {
    throw new Error('Direct Facebook post requires a Coupang Partners URL');
  }
  const url = new URL(coupangUrl);
  url.searchParams.set('subid', buildSubid(id));
  return url.toString();
}

function buildPostContent(queueItem, html) {
  const article = extractArticle(html);
  const link = queueItem.linkMode === 'blog'
    ? buildTrackedBlogUrl(queueItem.article, queueItem.id)
    : buildDirectUrl(article.coupangUrl, queueItem.id);
  const slides = [
    { label: 'GOLD PICK', title: article.title, body: article.description, imageUrl: article.imageUrl },
    { label: '놓치기 쉬운 점', title: article.points[0], body: article.summary },
    { label: '선택 기준', title: article.points[1], body: article.points.slice(2, 5).join(' · ') },
    { label: '추천 포인트', title: article.points[2], body: article.points.slice(3, 6).join(' · ') },
    { label: '자세히 보기', title: queueItem.linkMode === 'blog' ? '구매 가이드에서 비교하세요' : '현재 상품 정보를 확인하세요', body: `${link}\n\n${DISCLOSURE}` },
  ];
  const caption = `${article.title}\n\n${article.description}\n\n${link}\n\n${DISCLOSURE}`;
  return { id: queueItem.id, link, trackingId: queueItem.linkMode === 'blog' ? queueItem.id : buildSubid(queueItem.id), caption, slides };
}

module.exports = {
  DISCLOSURE,
  buildDirectUrl,
  buildPostContent,
  buildSubid,
  buildTrackedBlogUrl,
  cleanText,
  decodeHtml,
  extractArticle,
};
```

- [ ] **Step 5: Run content tests plus a real-article smoke assertion and commit**

Add one test that reads `blog/wonyoung-eider-sheer-jacket-guide.html`, calls `buildPostContent()` in blog mode, and asserts five slides, a non-empty Korean title, and `utm_content=20260811-celebrity-wonyoung-eider`.

Run:

```powershell
node --test tests/facebook-card-content.test.js
```

Expected: all content tests PASS.

Commit:

```powershell
git add -- scripts/facebook-card-content.js tests/facebook-card-content.test.js
git commit -m "feat: build facebook card content"
```

## Task 3: Pillow card renderer with Korean font and overflow enforcement

**Files:**
- Create: `scripts/generate-facebook-cards.py`
- Create: `tests/facebook-card-renderer.test.js`
- Modify: `.gitignore`

- [ ] **Step 1: Write a failing real-render test**

Create `tests/facebook-card-renderer.test.js` that writes a five-slide JSON fixture, invokes Python, and verifies all PNG headers encode 1080×1350:

```js
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('renderer creates five 1080x1350 PNG cards and a manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-cards-'));
  const input = path.join(dir, 'content.json');
  fs.writeFileSync(input, JSON.stringify({
    id: 'render-test',
    slides: Array.from({ length: 5 }, (_, index) => ({
      label: `카드 ${index + 1}`,
      title: '한글 카드뉴스 제목',
      body: '구매 전에 무게와 크기, 보관 공간을 함께 확인하세요.',
      imageUrl: '',
    })),
  }), 'utf8');
  const result = spawnSync('python', ['scripts/generate-facebook-cards.py', '--input', input, '--output-dir', dir], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 5);
  for (const card of manifest.cards) assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
});
```

- [ ] **Step 2: Run the renderer test and verify it fails because the script is absent**

Run:

```powershell
node --test tests/facebook-card-renderer.test.js
```

Expected: FAIL because `scripts/generate-facebook-cards.py` does not exist.

- [ ] **Step 3: Implement font resolution, wrapping and fit checks**

Create `scripts/generate-facebook-cards.py`. The implementation must:

```python
import argparse
import json
import os
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

WIDTH, HEIGHT = 1080, 1350
MARGIN = 84
DISCLOSURE_MIN_SIZE = 27

def resolve_font() -> str:
  candidates = [
    os.environ.get('FACEBOOK_CARD_FONT', ''),
    r'C:\Windows\Fonts\malgun.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
  ]
  for candidate in candidates:
    if candidate and Path(candidate).exists():
      return candidate
  raise RuntimeError('Set FACEBOOK_CARD_FONT or install Malgun Gothic/Noto Sans CJK')

def wrap_text(draw, text, font, max_width):
  lines, current = [], ''
  for char in text.replace('\r', ''):
    if char == '\n':
      lines.append(current.rstrip())
      current = ''
      continue
    candidate = current + char
    if current and draw.textbbox((0, 0), candidate, font=font)[2] > max_width:
      lines.append(current.rstrip())
      current = char.lstrip()
    else:
      current = candidate
  if current: lines.append(current.rstrip())
  return lines

def fit_text(draw, text, font_path, start_size, min_size, max_width, max_height, spacing=14):
  for size in range(start_size, min_size - 1, -2):
    font = ImageFont.truetype(font_path, size)
    lines = wrap_text(draw, text, font, max_width)
    box = draw.multiline_textbbox((0, 0), '\n'.join(lines), font=font, spacing=spacing)
    if box[3] - box[1] <= max_height:
      return font, lines
  raise ValueError(f'Text does not fit card: {text[:80]}')
```

- [ ] **Step 4: Implement optional cover image, five-card rendering and manifest**

The same script must provide `render_slide(slide, index, font_path)` and `main()` with these rules:

- Solid category colors rotate through `#17152f`, `#38265f`, `#194f5f`, `#664021`, `#5d2447`.
- If slide 1 has an HTTP(S) `imageUrl`, fetch it with a 10-second timeout, crop it to the top 500px via `ImageOps.fit`, and continue with a solid background if fetching fails.
- Draw the label at `(84, 72)`, title below 560px on the cover or 230px on text slides, body beneath the title, and `GOLD PICK · n/5` in the footer.
- Use `fit_text()` for every title and body; any unfit text exits non-zero instead of clipping.
- Save `01.png` through `05.png` as optimized RGB PNGs.
- Write `manifest.json` as `{"id":"...","cards":["absolute paths..."]}`.
- Accept only `--input` and `--output-dir` arguments and require exactly five slides.

Add `.facebook-artifacts/` to `.gitignore` so local dry-runs never pollute Git status.

- [ ] **Step 5: Add overflow and missing-font tests, run and commit**

Extend `tests/facebook-card-renderer.test.js` with:

- A body containing 20,000 Korean characters; expect non-zero exit and `Text does not fit card`.
- `FACEBOOK_CARD_FONT` pointing to a missing file while system fonts remain available; expect fallback success.

Run:

```powershell
node --test tests/facebook-card-renderer.test.js
```

Expected: all renderer tests PASS.

Commit:

```powershell
git add -- .gitignore scripts/generate-facebook-cards.py tests/facebook-card-renderer.test.js
git commit -m "feat: render facebook card images"
```

## Task 4: Facebook Graph API client with retry and duplicate lookup

**Files:**
- Create: `scripts/facebook-graph-api.js`
- Create: `tests/facebook-graph-api.test.js`

- [ ] **Step 1: Write failing client tests with an injected fetch stub**

Create `tests/facebook-graph-api.test.js` covering these exact behaviors:

```js
const assert = require('node:assert/strict');
const test = require('node:test');
const { FacebookGraphClient } = require('../scripts/facebook-graph-api');

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

test('Graph client retries 500 but not an OAuth 400', async () => {
  let calls = 0;
  const client = new FacebookGraphClient({
    pageId: 'page', token: 'secret', version: 'v25.0', sleep: async () => {},
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? jsonResponse({ error: { message: 'temporary' } }, 500) : jsonResponse({ id: 'ok' });
    },
  });
  assert.deepEqual(await client.getPost('ok'), { id: 'ok' });
  assert.equal(calls, 2);
});

test('duplicate lookup finds the tracking link in recent Page posts', async () => {
  const client = new FacebookGraphClient({
    pageId: 'page', token: 'secret', version: 'v25.0', sleep: async () => {},
    fetchImpl: async () => jsonResponse({ data: [{ id: 'page_1', message: 'https://site/?utm_content=post-1', permalink_url: 'https://facebook/post-1' }] }),
  });
  assert.equal((await client.findDuplicate('utm_content=post-1')).id, 'page_1');
});
```

Also test that `publishCarousel()` uploads each file with `published=false`, passes all returned photo IDs as `attached_media[n]` to `/{pageId}/feed`, and requests `permalink_url` after publishing.

- [ ] **Step 2: Run the client tests and verify the missing-module failure**

Run:

```powershell
node --test tests/facebook-graph-api.test.js
```

Expected: FAIL with missing `scripts/facebook-graph-api.js`.

- [ ] **Step 3: Implement the client constructor, safe errors and retry policy**

Create `scripts/facebook-graph-api.js` around this public surface:

```js
const fs = require('node:fs');

class GraphApiError extends Error {
  constructor(message, { status = 0, code = null, transient = false } = {}) {
    super(message);
    this.name = 'GraphApiError';
    this.status = status;
    this.code = code;
    this.transient = transient;
  }
}

class FacebookGraphClient {
  constructor({ pageId, token, version, fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
    if (!pageId || !token || !version) throw new Error('META_PAGE_ID, META_PAGE_ACCESS_TOKEN and META_GRAPH_VERSION are required');
    this.pageId = pageId;
    this.token = token;
    this.version = version;
    this.fetch = fetchImpl;
    this.sleep = sleep;
    this.base = `https://graph.facebook.com/${version}`;
  }

  async request(path, options = {}) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      let response;
      try {
        response = await this.fetch(`${this.base}${path}`, options);
      } catch (error) {
        if (attempt === 3) throw new GraphApiError('Facebook network request failed', { transient: true });
        await this.sleep(250 * (2 ** (attempt - 1)));
        continue;
      }
      const body = await response.json().catch(() => ({}));
      if (response.ok) return body;
      const transient = response.status === 429 || response.status >= 500;
      if (transient && attempt < 3) {
        await this.sleep(250 * (2 ** (attempt - 1)));
        continue;
      }
      throw new GraphApiError(body.error?.message || `Facebook API HTTP ${response.status}`, {
        status: response.status,
        code: body.error?.code ?? null,
        transient,
      });
    }
    throw new GraphApiError('Facebook retry loop exhausted', { transient: true });
  }

}
```

Never include the token, request Authorization header, or raw Graph response in thrown messages.

- [ ] **Step 4: Implement duplicate lookup, upload, cleanup, publish and insights methods**

Add these methods to `FacebookGraphClient`:

- `listRecentPosts()`: `GET /{pageId}/feed?fields=id,message,permalink_url,created_time&limit=50`.
- `findDuplicate(marker)`: return the first recent post whose `message` contains the marker.
- `uploadPhoto(file)`: read the file into a `Blob`, send multipart `source`, `published=false`, and the access token to `/{pageId}/photos`; return the photo ID.
- `deleteObject(id)`: `DELETE /{id}` and ignore a cleanup-only error.
- `publishCarousel({ files, message })`: upload files sequentially, create a form with `message`, token and `attached_media[0..n]`, POST to `/{pageId}/feed`, then call `getPost(id)`; delete uploaded unpublished photos if the final feed post fails.
- `getPost(id)`: `GET /{id}?fields=id,permalink_url,message`.
- `getInsight(postId, metric)`: `GET /{postId}/insights?metric={metric}`.

Export both `FacebookGraphClient` and `GraphApiError`.

- [ ] **Step 5: Run the client tests and commit**

Run:

```powershell
node --test tests/facebook-graph-api.test.js
```

Expected: all Graph client tests PASS without network access.

Commit:

```powershell
git add -- scripts/facebook-graph-api.js tests/facebook-graph-api.test.js
git commit -m "feat: add facebook graph client"
```

## Task 5: One-post publisher, dry-run and crash recovery

**Files:**
- Create: `scripts/publish-facebook-posts.js`
- Create: `tests/facebook-publisher.test.js`

- [ ] **Step 1: Write failing orchestration tests with injected dependencies**

Create `tests/facebook-publisher.test.js` using a one-item temporary queue. Test these scenarios separately:

1. `dryRun: true` writes `content.json` and card files but leaves queue status `queued` and never calls the Graph client.
2. A normal run transitions `queued → rendered → publishing → published`, sets `trackingId`, `facebookPostId`, `facebookPermalink`, `publishedAt`, and publishes exactly once.
3. A `rendered` item resumes at `publishing`, and a `publishing` item with an existing duplicate is recovered to `published` without uploading.
4. A permanent error sets `failed`, increments `attempts`, and stores a sanitized `lastError` that does not contain the supplied token.

Use this dependency interface in the tests:

```js
await runPublisher({
  queueFile,
  root,
  outputRoot,
  now: new Date('2026-08-30T00:00:00Z'),
  dryRun: false,
  graphClient,
  renderCards: async (content, directory) => cardFiles,
});
```

- [ ] **Step 2: Run publisher tests and verify the missing-module failure**

Run:

```powershell
node --test tests/facebook-publisher.test.js
```

Expected: FAIL with missing `scripts/publish-facebook-posts.js`.

- [ ] **Step 3: Implement CLI parsing, renderer invocation and injected orchestration**

Create `scripts/publish-facebook-posts.js` and export `parseArgs`, `renderWithPython`, and `runPublisher`. Use these defaults:

```js
const DEFAULT_QUEUE = 'data/facebook-post-queue.json';
const DEFAULT_OUTPUT = '.facebook-artifacts';
```

Supported arguments:

```text
--queue <path>
--output-dir <path>
--now <ISO-8601>
--dry-run
```

`renderWithPython(content, directory)` must create the directory, write `content.json`, spawn `python scripts/generate-facebook-cards.py --input ... --output-dir ...`, reject on non-zero exit, and return card paths from `manifest.json`.

- [ ] **Step 4: Implement the exact state/recovery flow**

`runPublisher()` must execute this order:

```js
const queue = readQueue(queueFile);
const item = selectDuePost(queue, now);
if (!item) return { status: 'idle' };

const html = fs.readFileSync(path.join(root, item.article.replace(/^\//, '')), 'utf8');
const content = buildPostContent(item, html);
const directory = path.join(outputRoot, item.id);
const files = await renderCards(content, directory);

if (dryRun) return { status: 'dry-run', id: item.id, files, content };

if (item.status === 'queued') {
  transitionPost(queue, item.id, 'rendered', { trackingId: content.trackingId, lastError: null });
  writeQueueAtomic(queueFile, queue);
}
if (item.status === 'rendered') {
  transitionPost(queue, item.id, 'publishing');
  writeQueueAtomic(queueFile, queue);
}

const duplicate = await graphClient.findDuplicate(content.trackingId);
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
```

After the duplicate check, call `publishCarousel()` only when no matching post exists, then persist `published`. On error:

- Never include `META_PAGE_ACCESS_TOKEN` in `lastError`.
- Increment `attempts` once per complete publisher run, not once per internal HTTP retry.
- Transition to `failed`; recovery requires a person to reset it to `queued` after correcting the cause.
- Keep `facebookPostId` and `facebookPermalink` null unless Graph confirms a post.

The CLI `main()` constructs `FacebookGraphClient` only when `--dry-run` is absent. It reads `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, and `META_GRAPH_VERSION` from the environment and exits non-zero on failure.

- [ ] **Step 5: Run publisher tests and a real dry-run, then commit**

Run:

```powershell
node --test tests/facebook-publisher.test.js
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z
```

Expected:

- Publisher tests PASS.
- Dry-run creates `.facebook-artifacts/20260810-seasonal-neck-fan/01.png` through `05.png` and `manifest.json`.
- `data/facebook-post-queue.json` remains unchanged and no Meta credentials are required.

Commit:

```powershell
git add -- scripts/publish-facebook-posts.js tests/facebook-publisher.test.js
git commit -m "feat: orchestrate facebook publishing"
```

## Task 6: Tolerant Meta insight collection

**Files:**
- Create: `data/facebook-post-insights.json`
- Create: `scripts/collect-facebook-insights.js`
- Create: `tests/facebook-insights.test.js`

- [ ] **Step 1: Write failing insight tests**

Create `tests/facebook-insights.test.js` to assert:

- Only queue items with `status: published` and a `facebookPostId` are queried.
- Metrics are requested one at a time.
- A `GraphApiError` with code `100` for an unsupported metric records that metric under `unsupportedMetrics` and continues.
- A network/auth error fails the run without overwriting the previous result file.
- A successful result is atomically written as:

```json
{
  "updatedAt": "2026-08-30T00:00:00.000Z",
  "posts": {
    "page_123": {
      "queueId": "20260810-seasonal-neck-fan",
      "metrics": { "post_impressions_unique": 1200 },
      "unsupportedMetrics": ["post_clicks"]
    }
  }
}
```

- [ ] **Step 2: Run the insight tests and verify the missing-module failure**

Run:

```powershell
node --test tests/facebook-insights.test.js
```

Expected: FAIL with missing `scripts/collect-facebook-insights.js`.

- [ ] **Step 3: Implement collection and atomic persistence**

Create `data/facebook-post-insights.json` with:

```json
{
  "updatedAt": null,
  "posts": {}
}
```

Create `scripts/collect-facebook-insights.js` and export:

```js
const DEFAULT_METRICS = ['post_impressions_unique', 'post_engaged_users', 'post_clicks'];

async function collectInsights({ queue, previous, client, metrics = DEFAULT_METRICS, now = new Date() }) {
  const next = structuredClone(previous);
  next.updatedAt = now.toISOString();
  for (const item of queue.filter((entry) => entry.status === 'published' && entry.facebookPostId)) {
    const record = { queueId: item.id, metrics: {}, unsupportedMetrics: [] };
    for (const metric of metrics) {
      try {
        const response = await client.getInsight(item.facebookPostId, metric);
        record.metrics[metric] = response.data?.[0]?.values?.at(-1)?.value ?? null;
      } catch (error) {
        if (error.code === 100) record.unsupportedMetrics.push(metric);
        else throw error;
      }
    }
    next.posts[item.facebookPostId] = record;
  }
  return next;
}
```

Add `writeJsonAtomic()` using the same temporary-file/rename pattern as the queue. The CLI reads `FACEBOOK_INSIGHT_METRICS` as an optional comma-separated override, constructs the Graph client from the same three Meta environment variables, and writes only after the complete collection succeeds.

- [ ] **Step 4: Run insight tests and commit**

Run:

```powershell
node --test tests/facebook-insights.test.js
```

Expected: all insight tests PASS.

Commit:

```powershell
git add -- data/facebook-post-insights.json scripts/collect-facebook-insights.js tests/facebook-insights.test.js
git commit -m "feat: collect facebook post insights"
```

## Task 7: Scheduled GitHub Actions workflow and operator runbook

**Files:**
- Create: `.github/workflows/facebook-card-news.yml`
- Create: `docs/facebook-card-news-runbook.md`
- Create: `tests/facebook-workflow.test.js`

- [ ] **Step 1: Write a failing static workflow contract test**

Create `tests/facebook-workflow.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('Facebook workflow is locked, secret-backed, scheduled at 20:30 KST and supports dry-run', () => {
  const yaml = fs.readFileSync('.github/workflows/facebook-card-news.yml', 'utf8');
  assert.match(yaml, /cron:\s*['"]30 11 \* \* \*['"]/);
  assert.match(yaml, /workflow_dispatch:/);
  assert.match(yaml, /dry_run:/);
  assert.match(yaml, /concurrency:/);
  assert.match(yaml, /contents:\s*write/);
  assert.match(yaml, /secrets\.META_PAGE_ID/);
  assert.match(yaml, /secrets\.META_PAGE_ACCESS_TOKEN/);
  assert.match(yaml, /node --test tests\/facebook-/);
  assert.match(yaml, /publish-facebook-posts\.js/);
  assert.match(yaml, /collect-facebook-insights\.js/);
  assert.doesNotMatch(yaml, /coupang\/api\.txt/);
});
```

- [ ] **Step 2: Run the workflow test and verify the missing-file failure**

Run:

```powershell
node --test tests/facebook-workflow.test.js
```

Expected: FAIL with `ENOENT` for `.github/workflows/facebook-card-news.yml`.

- [ ] **Step 3: Create the workflow with manual dry-run and daily publish paths**

Create `.github/workflows/facebook-card-news.yml` with:

```yaml
name: Facebook card news

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: Generate cards without calling Meta
        required: true
        default: true
        type: boolean
  schedule:
    - cron: '30 11 * * *'

permissions:
  contents: write

concurrency:
  group: facebook-card-news-${{ github.ref }}
  cancel-in-progress: false

jobs:
  publish:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    env:
      META_PAGE_ID: ${{ secrets.META_PAGE_ID }}
      META_PAGE_ACCESS_TOKEN: ${{ secrets.META_PAGE_ACCESS_TOKEN }}
      META_GRAPH_VERSION: ${{ vars.META_GRAPH_VERSION }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install card renderer dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y fonts-noto-cjk
          python -m pip install Pillow==11.3.0
      - name: Run Facebook automation tests
        shell: bash
        run: node --test tests/facebook-*.test.js
      - name: Generate or publish one queued post
        shell: bash
        run: |
          if [[ "${{ github.event_name }}" == "workflow_dispatch" && "${{ inputs.dry_run }}" == "true" ]]; then
            node scripts/publish-facebook-posts.js --dry-run
          else
            node scripts/publish-facebook-posts.js
            node scripts/collect-facebook-insights.js
          fi
      - name: Upload dry-run cards
        if: github.event_name == 'workflow_dispatch' && inputs.dry_run
        uses: actions/upload-artifact@v4
        with:
          name: facebook-card-news-preview
          path: .facebook-artifacts/
      - name: Commit publishing results only
        if: github.event_name == 'schedule' || !inputs.dry_run
        shell: bash
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -- data/facebook-post-queue.json data/facebook-post-insights.json
          git diff --cached --quiet || git commit -m "chore: record facebook publishing result"
          git push
```

Set `META_GRAPH_VERSION` as a required repository variable in the runbook; do not silently default the API version in production.

- [ ] **Step 4: Write the complete operator runbook**

Create `docs/facebook-card-news-runbook.md` with these sections and exact actions:

1. Create a Facebook Page and separate Facebook test Page manually.
2. Create a Meta developer app and configure Facebook Login/Pages API. Request `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, and `read_insights`; confirm the current Meta App Dashboard still exposes those scopes before submitting App Review or generating the production token.
3. Obtain a Page Access Token through the official OAuth flow; never paste it into repository files or Actions logs.
4. Add Actions secrets `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`; add variable `META_GRAPH_VERSION` (initially `v25.0`, but confirm against the current Meta dashboard before enabling schedule).
5. Run `node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z` locally and inspect all five cards.
6. Run the Actions workflow manually with `dry_run=true`; download and inspect the artifact.
7. Temporarily point `META_PAGE_ID` at the test Page, run once with `dry_run=false`, verify image order, Korean text, disclosure, clickable link and mobile rendering.
8. Re-run the same item and confirm no duplicate is created.
9. Reset the queue test item only after confirming recovery behavior, then switch the secret to the production Page.
10. Enable scheduled operation only after the test Page checklist passes.
11. Recovery instructions for `failed`: inspect `lastError`, correct token/content, change only that item from `failed` to `queued`, reset neither `attempts` nor tracking ID, and run manually.
12. Explain that Coupang Partner order/revenue reporting may require portal comparison because no public affiliate-report API was confirmed; do not scrape the portal.

- [ ] **Step 5: Run workflow tests and commit**

Run:

```powershell
node --test tests/facebook-workflow.test.js
```

Expected: workflow contract test PASS.

Commit:

```powershell
git add -- .github/workflows/facebook-card-news.yml docs/facebook-card-news-runbook.md tests/facebook-workflow.test.js
git commit -m "ci: schedule facebook card news"
```

## Task 8: Feature verification and documented baseline exception

**Files:**
- Modify only if verification exposes a feature defect: files created in Tasks 1–7
- Do not modify: `index.html`, `tests/root-blog-home.test.js`

- [ ] **Step 1: Run all Facebook feature tests together**

Run:

```powershell
$facebookTests = Get-ChildItem tests\facebook-*.test.js | Select-Object -ExpandProperty FullName
node --test $facebookTests
```

Expected: all Facebook tests PASS, zero failures.

- [ ] **Step 2: Run the real dry-run twice and validate both complete outputs**

Run:

```powershell
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/run-a
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/run-b
(Get-ChildItem .facebook-artifacts\run-a\20260810-seasonal-neck-fan\*.png).Count
(Get-ChildItem .facebook-artifacts\run-b\20260810-seasonal-neck-fan\*.png).Count
```

Expected: each run contains five 1080×1350 PNG cards, each manifest lists those five cards, and the queue file remains unchanged (`git diff -- data/facebook-post-queue.json` prints nothing). Pixel hashes are not compared because an optional remote OG image can legitimately change between fetches.

- [ ] **Step 3: Run the complete repository suite and record the known baseline result**

Run:

```powershell
$allTests = Get-ChildItem tests\*.test.js | Select-Object -ExpandProperty FullName
node --test $allTests
```

Expected until the unrelated homepage issue is resolved elsewhere: all new Facebook tests pass, and the only failure remains `root blog home prioritizes claw tour articles` with the same idol-vs-claw ordering diff observed at baseline. If any additional test fails, stop and fix only the Facebook feature regression before continuing.

- [ ] **Step 4: Verify security, scope and generated-file cleanliness**

Run:

```powershell
rg -n "META_PAGE_ACCESS_TOKEN\s*[:=]\s*[^$]|AF7523287" .github scripts data docs tests --glob '!docs/superpowers/**'
git status --short
git diff --check
```

Expected:

- No literal Meta token appears.
- Existing public affiliate tracking codes may appear in blog/data files, but no new secret key is present.
- `.facebook-artifacts/` is absent from Git status.
- `git diff --check` reports no whitespace errors in feature files.

- [ ] **Step 5: Commit any verification-only corrections and inspect branch history**

If a feature defect required correction, first add a failing test, make the minimal fix, rerun the relevant test, then commit only those files:

```powershell
git add -- <exact corrected feature files>
git commit -m "fix: harden facebook card publishing"
```

Finally run:

```powershell
git log --oneline --decorate -8
git status --short
```

Expected: focused commits from Tasks 1–7 (plus at most one verified correction commit), no uncommitted feature files, and no changes to the unrelated homepage/test baseline issue.

## Task 9: Live test-Page gate before production scheduling

**Files:**
- Modify after successful API response: `data/facebook-post-queue.json`
- Modify after insight collection: `data/facebook-post-insights.json`

- [ ] **Step 1: Complete the one-time manual Meta configuration from the runbook**

Use the test Facebook Page. Store the Page ID/token only in the current shell or GitHub Secrets; do not write them to disk.

- [ ] **Step 2: Execute one live test-Page publish through the API**

Run in an approved secret-bearing environment:

```powershell
$env:META_PAGE_ID='<test-page-id>'
$env:META_PAGE_ACCESS_TOKEN='<test-page-token>'
$env:META_GRAPH_VERSION='v25.0'
node scripts/publish-facebook-posts.js --now 2026-08-30T00:00:00Z
```

Expected: one five-image Facebook Page post, a clickable tracked URL, disclosure in the body/final card, and queue state `published` with Facebook ID/permalink.

- [ ] **Step 3: Prove idempotency with the same command**

Run the same command again.

Expected: no second Facebook post; output reports `recovered` or `idle`, depending on the persisted state.

- [ ] **Step 4: Collect supported insights and verify tolerant behavior**

Run:

```powershell
node scripts/collect-facebook-insights.js
```

Expected: `data/facebook-post-insights.json` contains the test post, supported metrics have values or null, unsupported metrics are named without failing the complete collection.

- [ ] **Step 5: Review the live post manually before enabling production schedule**

Confirm on desktop and mobile:

- Five cards are in order and no Korean text is clipped.
- The Facebook body contains the disclosure and correct link.
- Blog mode lands on the expected article with all UTM parameters.
- Direct mode uses the expected `fb-...` `subid`.
- No token or private API response is visible.

Do not enable the production Page secret or daily schedule until every item passes.
