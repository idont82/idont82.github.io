const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPkcePair,
  parseInstalledClient,
  refreshAccessToken,
} = require('../scripts/blogger-oauth');

test('creates an S256 PKCE verifier and matching challenge', () => {
  const crypto = require('node:crypto');
  const pair = createPkcePair();
  const expected = crypto.createHash('sha256').update(pair.verifier).digest('base64url');

  assert.match(pair.verifier, /^[A-Za-z0-9_-]{43,128}$/);
  assert.equal(pair.challenge, expected);
});

test('accepts Google installed-app credentials', () => {
  const parsed = parseInstalledClient({
    installed: {
      client_id: 'id',
      client_secret: 'secret',
      redirect_uris: ['http://localhost'],
    },
  });

  assert.deepEqual(parsed, {
    clientId: 'id',
    clientSecret: 'secret',
    redirectUris: ['http://localhost'],
  });
});

test('rejects credentials that are not for an installed app', () => {
  assert.throws(
    () => parseInstalledClient({ web: { client_id: 'id' } }),
    /Desktop OAuth client/,
  );
});

test('refreshes access without dropping the refresh token', async () => {
  let request;
  const fetchImpl = async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({
      access_token: 'access',
      expires_in: 3600,
      token_type: 'Bearer',
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const token = await refreshAccessToken(
    { clientId: 'id', clientSecret: 'secret' },
    { refresh_token: 'refresh' },
    fetchImpl,
  );

  assert.equal(request.url, 'https://oauth2.googleapis.com/token');
  assert.match(request.init.body, /grant_type=refresh_token/);
  assert.equal(token.access_token, 'access');
  assert.equal(token.refresh_token, 'refresh');
  assert.ok(token.expires_at > Date.now());
});

test('reports sanitized refresh failures', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    error: 'invalid_grant',
    error_description: 'refresh-secret',
  }), { status: 400 });

  await assert.rejects(
    refreshAccessToken(
      { clientId: 'id', clientSecret: 'client-secret' },
      { refresh_token: 'refresh-secret' },
      fetchImpl,
    ),
    (error) => {
      assert.match(error.message, /invalid_grant/);
      assert.doesNotMatch(error.message, /refresh-secret|client-secret/);
      return true;
    },
  );
});
