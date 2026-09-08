const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { bloggerPaths } = require('../scripts/blogger-paths');

test('keeps credentials outside tracked content', () => {
  const result = bloggerPaths(path.resolve('.'));

  assert.match(result.oauthClient, /\.blogger-artifacts[\\/]oauth-client\.json$/);
  assert.match(result.token, /\.blogger-artifacts[\\/]token\.json$/);
  assert.equal(result.blogUrl, 'https://goldpick-choice.blogspot.com/');
});
