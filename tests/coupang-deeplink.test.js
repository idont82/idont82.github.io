const assert = require('node:assert/strict');
const test = require('node:test');

const { appendSubId, createDeeplinks } = require('../scripts/coupang-deeplink');

test('appendSubId adds the parameter to a bare URL', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc', 'clawgame'),
    'https://link.coupang.com/a/abc?subId=clawgame',
  );
});

test('appendSubId keeps existing query parameters', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc?x=1', 'clawgame'),
    'https://link.coupang.com/a/abc?x=1&subId=clawgame',
  );
});

test('appendSubId replaces an existing subId', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc?subId=old', 'clawgame'),
    'https://link.coupang.com/a/abc?subId=clawgame',
  );
});

test('appendSubId returns the url unchanged when subId is empty', () => {
  assert.equal(appendSubId('https://link.coupang.com/a/abc', ''), 'https://link.coupang.com/a/abc');
});

test('createDeeplinks sends the urls and appends subId to the results', async () => {
  let seenBody = null;
  const requestImpl = async (body) => {
    seenBody = JSON.parse(body);
    return {
      rCode: '0',
      data: [
        { originalUrl: 'https://www.coupang.com/vp/products/1', shortenUrl: 'https://link.coupang.com/a/one' },
        { originalUrl: 'https://www.coupang.com/vp/products/2', shortenUrl: 'https://link.coupang.com/a/two' },
      ],
    };
  };

  const result = await createDeeplinks(
    ['https://www.coupang.com/vp/products/1', 'https://www.coupang.com/vp/products/2'],
    'clawgame',
    requestImpl,
  );

  assert.deepEqual(seenBody, {
    coupangUrls: ['https://www.coupang.com/vp/products/1', 'https://www.coupang.com/vp/products/2'],
  });
  assert.deepEqual(result, [
    { originalUrl: 'https://www.coupang.com/vp/products/1', shortenUrl: 'https://link.coupang.com/a/one?subId=clawgame' },
    { originalUrl: 'https://www.coupang.com/vp/products/2', shortenUrl: 'https://link.coupang.com/a/two?subId=clawgame' },
  ]);
});

test('createDeeplinks throws when the API reports a failure', async () => {
  const requestImpl = async () => ({ rCode: '400', rMessage: 'url convert failed' });
  await assert.rejects(
    () => createDeeplinks(['https://www.coupang.com/vp/products/1'], 'clawgame', requestImpl),
    /url convert failed/,
  );
});

test('createDeeplinks returns an empty list without calling the API', async () => {
  const requestImpl = async () => { throw new Error('호출되면 안 됨'); };
  assert.deepEqual(await createDeeplinks([], 'clawgame', requestImpl), []);
});
