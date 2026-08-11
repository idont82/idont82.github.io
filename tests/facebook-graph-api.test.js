const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { FacebookGraphClient, GraphApiError } = require('../scripts/facebook-graph-api');

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function clientWith(fetchImpl) {
  return new FacebookGraphClient({
    pageId: 'page',
    token: 'secret-token',
    version: 'v25.0',
    fetchImpl,
    sleep: async () => {},
  });
}

test('Graph client retries a 500 but does not retry an OAuth 400', async () => {
  let retryCalls = 0;
  const retryClient = clientWith(async () => {
    retryCalls += 1;
    return retryCalls === 1
      ? jsonResponse({ error: { message: 'temporary' } }, 500)
      : jsonResponse({ id: 'ok' });
  });
  assert.deepEqual(await retryClient.getPost('ok'), { id: 'ok' });
  assert.equal(retryCalls, 2);

  let oauthCalls = 0;
  const oauthClient = clientWith(async () => {
    oauthCalls += 1;
    return jsonResponse({ error: { message: 'Invalid OAuth access token.', code: 190 } }, 400);
  });
  await assert.rejects(oauthClient.getPost('bad'), (error) => {
    assert.ok(error instanceof GraphApiError);
    assert.equal(error.code, 190);
    assert.doesNotMatch(error.message, /secret-token/);
    return true;
  });
  assert.equal(oauthCalls, 1);
});

test('duplicate lookup finds the tracking marker in recent Page posts', async () => {
  let requestedUrl = '';
  const client = clientWith(async (url) => {
    requestedUrl = url;
    return jsonResponse({
      data: [
        { id: 'page_1', message: 'https://site/?utm_content=post-1', permalink_url: 'https://facebook/post-1' },
        { id: 'page_2', message: 'another post' },
      ],
    });
  });
  assert.equal((await client.findDuplicate('utm_content=post-1')).id, 'page_1');
  assert.match(requestedUrl, /\/page\/published_posts\?/);
  assert.equal(await client.findDuplicate('utm_content=missing'), null);
});

test('publishCarousel uploads unpublished photos, attaches them and reads the permalink', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-graph-'));
  const files = [path.join(dir, '01.png'), path.join(dir, '02.png')];
  files.forEach((file, index) => fs.writeFileSync(file, `image-${index}`));
  const requests = [];
  let photo = 0;
  const client = clientWith(async (url, options = {}) => {
    requests.push({ url, options });
    if (url.endsWith('/page/photos')) return jsonResponse({ id: `photo-${++photo}` });
    if (url.endsWith('/page/feed')) return jsonResponse({ id: 'page_post' });
    return jsonResponse({ id: 'page_post', permalink_url: 'https://facebook/post' });
  });

  const post = await client.publishCarousel({ files, message: '카드뉴스 본문' });
  assert.equal(post.permalink_url, 'https://facebook/post');
  const uploads = requests.filter(({ url }) => url.endsWith('/page/photos'));
  assert.equal(uploads.length, 2);
  for (const { options } of uploads) {
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('published'), 'false');
    assert.equal(options.body.get('access_token'), 'secret-token');
    assert.ok(options.body.get('source') instanceof Blob);
  }
  const feed = requests.find(({ url }) => url.endsWith('/page/feed'));
  assert.equal(feed.options.body.get('message'), '카드뉴스 본문');
  assert.equal(feed.options.body.get('attached_media[0]'), JSON.stringify({ media_fbid: 'photo-1' }));
  assert.equal(feed.options.body.get('attached_media[1]'), JSON.stringify({ media_fbid: 'photo-2' }));
  assert.match(
    requests.at(-1).url,
    /page_post\?fields=id%2Cpermalink_url%2Cmessage&access_token=secret-token$/,
  );
});

test('publishCarousel cleans up unpublished photos when feed creation fails', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-cleanup-'));
  const file = path.join(dir, '01.png');
  fs.writeFileSync(file, 'image');
  const deleted = [];
  const client = clientWith(async (url, options = {}) => {
    if (url.endsWith('/page/photos')) return jsonResponse({ id: 'photo-1' });
    if (url.endsWith('/page/feed')) return jsonResponse({ error: { message: 'invalid post' } }, 400);
    if (options.method === 'DELETE') {
      deleted.push(url);
      return jsonResponse({ success: true });
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  await assert.rejects(client.publishCarousel({ files: [file], message: 'post' }), GraphApiError);
  assert.equal(deleted.length, 1);
  assert.match(deleted[0], /\/photo-1\?/);
});
