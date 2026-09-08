const test = require('node:test');
const assert = require('node:assert/strict');

const { BloggerClient } = require('../scripts/blogger-api');

test('publishes with isDraft false', async () => {
  const calls = [];
  const client = new BloggerClient({
    token: 'x',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({
        id: 'p1',
        url: 'https://example.test/post',
      }), { status: 200 });
    },
  });

  await client.insertPost('b1', { title: '제목', content: '<p>본문</p>' });

  assert.match(calls[0].url, /\/blogs\/b1\/posts\?isDraft=false$/);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.authorization, 'Bearer x');
});

test('URL-encodes blog address lookup', async () => {
  let requestedUrl;
  const client = new BloggerClient({
    token: 'x',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({ id: 'blog1' }), { status: 200 });
    },
  });

  await client.getBlogByUrl('https://goldpick-choice.blogspot.com/');

  assert.match(requestedUrl, /url=https%3A%2F%2Fgoldpick-choice\.blogspot\.com%2F/);
});

test('normalizes a post list without items to an empty array', async () => {
  const client = new BloggerClient({
    token: 'x',
    fetchImpl: async () => new Response('{}', { status: 200 }),
  });

  assert.deepEqual(await client.listPosts('blog1'), []);
});

test('retries server errors up to three attempts', async () => {
  let attempts = 0;
  const client = new BloggerClient({
    token: 'x',
    sleepImpl: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      if (attempts < 3) {
        return new Response('{"error":{"message":"temporary"}}', { status: 500 });
      }
      return new Response('{"id":"blog1"}', { status: 200 });
    },
  });

  assert.equal((await client.getBlogByUrl('https://example.test/')).id, 'blog1');
  assert.equal(attempts, 3);
});

test('does not retry unauthorized requests or leak response details', async () => {
  let attempts = 0;
  const client = new BloggerClient({
    token: 'access-secret',
    sleepImpl: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      return new Response('{"error":{"message":"access-secret rejected"}}', { status: 401 });
    },
  });

  await assert.rejects(
    client.getBlogByUrl('https://example.test/'),
    (error) => {
      assert.match(error.message, /HTTP 401/);
      assert.doesNotMatch(error.message, /access-secret/);
      return true;
    },
  );
  assert.equal(attempts, 1);
});
