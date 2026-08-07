const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { runPublisher } = require('../scripts/publish-facebook-posts');

const NOW = new Date('2026-08-30T00:00:00Z');

function createFixture(status = 'queued') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-publisher-'));
  const article = '/blog/test-product.html';
  fs.mkdirSync(path.join(root, 'blog'), { recursive: true });
  fs.writeFileSync(path.join(root, article.slice(1)), `<!doctype html>
    <meta name="description" content="구매 전에 꼭 확인할 핵심 기준입니다.">
    <meta property="og:image" content="https://example.com/product.jpg">
    <article class="blog-article">
      <h1 class="blog-article-title">테스트 상품 구매 가이드</h1>
      <div class="article-summary-box">가격과 성능을 함께 비교했습니다.</div>
      <h2>사용 환경 확인</h2><h2>예산 범위 정하기</h2><h2>후기 비교하기</h2>
    </article>`, 'utf8');
  const queueFile = path.join(root, 'queue.json');
  const queue = [{
    id: '20260810-test-product',
    category: 'problem',
    article,
    linkMode: 'blog',
    scheduledAt: '2026-08-10T11:30:00Z',
    status,
    attempts: 0,
  }];
  fs.writeFileSync(queueFile, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  return { root, queueFile, outputRoot: path.join(root, 'artifacts') };
}

function fakeRenderer(calls) {
  return async (content, directory) => {
    calls.push(content);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'content.json'), JSON.stringify(content), 'utf8');
    const files = Array.from({ length: 5 }, (_, index) => path.join(directory, `${index + 1}.png`));
    files.forEach((file) => fs.writeFileSync(file, 'png'));
    return files;
  };
}

test('dry-run renders files without credentials or queue mutation', async () => {
  const fixture = createFixture();
  const before = fs.readFileSync(fixture.queueFile, 'utf8');
  const renders = [];
  const result = await runPublisher({
    ...fixture,
    now: NOW,
    dryRun: true,
    renderCards: fakeRenderer(renders),
  });
  assert.equal(result.status, 'dry-run');
  assert.equal(renders.length, 1);
  assert.equal(result.files.length, 5);
  assert.equal(fs.readFileSync(fixture.queueFile, 'utf8'), before);
});

test('normal run publishes once and persists confirmed Facebook fields', async () => {
  const fixture = createFixture();
  let publishes = 0;
  const graphClient = {
    token: 'secret-token',
    findDuplicate: async () => null,
    publishCarousel: async ({ files, message }) => {
      publishes += 1;
      assert.equal(files.length, 5);
      assert.match(message, /utm_content=20260810-test-product/);
      return { id: 'page_post', permalink_url: 'https://facebook.test/page_post' };
    },
  };
  const result = await runPublisher({
    ...fixture,
    now: NOW,
    graphClient,
    renderCards: fakeRenderer([]),
  });
  const [item] = JSON.parse(fs.readFileSync(fixture.queueFile, 'utf8'));
  assert.equal(result.status, 'published');
  assert.equal(publishes, 1);
  assert.equal(item.status, 'published');
  assert.equal(item.trackingId, '20260810-test-product');
  assert.equal(item.facebookPostId, 'page_post');
  assert.equal(item.facebookPermalink, 'https://facebook.test/page_post');
  assert.equal(item.publishedAt, NOW.toISOString());
});

test('rendered work resumes and publishing work recovers from a duplicate', async () => {
  const rendered = createFixture('rendered');
  let renderedPublishes = 0;
  await runPublisher({
    ...rendered,
    now: NOW,
    graphClient: {
      token: 'token',
      findDuplicate: async () => null,
      publishCarousel: async () => {
        renderedPublishes += 1;
        return { id: 'resumed', permalink_url: 'https://facebook.test/resumed' };
      },
    },
    renderCards: fakeRenderer([]),
  });
  assert.equal(renderedPublishes, 1);
  assert.equal(JSON.parse(fs.readFileSync(rendered.queueFile, 'utf8'))[0].status, 'published');

  const publishing = createFixture('publishing');
  let recoveredPublishes = 0;
  const result = await runPublisher({
    ...publishing,
    now: NOW,
    graphClient: {
      token: 'token',
      findDuplicate: async (marker) => ({
        id: 'existing',
        message: marker,
        permalink_url: 'https://facebook.test/existing',
        created_time: '2026-08-29T11:00:00Z',
      }),
      publishCarousel: async () => { recoveredPublishes += 1; },
    },
    renderCards: fakeRenderer([]),
  });
  const [item] = JSON.parse(fs.readFileSync(publishing.queueFile, 'utf8'));
  assert.equal(result.status, 'recovered');
  assert.equal(recoveredPublishes, 0);
  assert.equal(item.facebookPostId, 'existing');
  assert.equal(item.publishedAt, '2026-08-29T11:00:00Z');
});

test('permanent error blocks the queue once and never persists the token', async () => {
  const fixture = createFixture();
  const graphClient = {
    token: 'highly-secret-token',
    findDuplicate: async () => null,
    publishCarousel: async () => {
      throw new Error('Request failed for highly-secret-token');
    },
  };
  await assert.rejects(runPublisher({
    ...fixture,
    now: NOW,
    graphClient,
    renderCards: fakeRenderer([]),
  }));
  const [item] = JSON.parse(fs.readFileSync(fixture.queueFile, 'utf8'));
  assert.equal(item.status, 'failed');
  assert.equal(item.attempts, 1);
  assert.doesNotMatch(item.lastError, /highly-secret-token/);
  assert.equal(item.facebookPostId ?? null, null);
  assert.equal(item.facebookPermalink ?? null, null);
});
