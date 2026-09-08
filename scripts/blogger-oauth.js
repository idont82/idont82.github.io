const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const { bloggerPaths } = require('./blogger-paths');

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const BLOGGER_SCOPE = 'https://www.googleapis.com/auth/blogger';

function parseInstalledClient(raw) {
  const installed = raw && raw.installed;
  if (!installed || !installed.client_id || !installed.client_secret) {
    throw new Error('A Google Desktop OAuth client JSON file is required.');
  }

  return {
    clientId: installed.client_id,
    clientSecret: installed.client_secret,
    redirectUris: Array.isArray(installed.redirect_uris) ? installed.redirect_uris : [],
  };
}

async function parseJsonResponse(response, label) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const code = body.error || `HTTP ${response.status}`;
    throw new Error(`${label} failed: ${code}`);
  }

  return body;
}

async function refreshAccessToken(client, token, fetchImpl = fetch) {
  if (!token || !token.refresh_token) {
    throw new Error('Blogger OAuth refresh token is missing.');
  }

  const body = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  });
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const refreshed = await parseJsonResponse(response, 'OAuth token refresh');

  return {
    ...token,
    ...refreshed,
    refresh_token: token.refresh_token,
    expires_at: Date.now() + (Number(refreshed.expires_in || 3600) * 1000),
  };
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writePrivateJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(file, 0o600);
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    const child = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '""', url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return;
  }

  const command = process.platform === 'darwin' ? 'open' : 'xdg-open';
  const child = spawn(command, [url], { detached: true, stdio: 'ignore' });
  child.unref();
}

async function authorizeInteractive(paths, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || fetch;
  const browserOpener = dependencies.openBrowser || openBrowser;
  const client = parseInstalledClient(await readJson(paths.oauthClient));
  const state = crypto.randomBytes(24).toString('hex');

  let resolveCallback;
  let rejectCallback;
  const callback = new Promise((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
  });
  const server = http.createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      if (requestUrl.pathname !== '/oauth2callback') {
        response.writeHead(404).end('Not found');
        return;
      }
      if (requestUrl.searchParams.get('state') !== state) {
        throw new Error('OAuth state did not match.');
      }
      const error = requestUrl.searchParams.get('error');
      if (error) {
        throw new Error(`OAuth authorization failed: ${error}`);
      }
      const code = requestUrl.searchParams.get('code');
      if (!code) {
        throw new Error('OAuth authorization code is missing.');
      }
      response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Gold Pick Blogger authorization completed. You may close this window.');
      resolveCallback(code);
    } catch (error) {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Blogger authorization failed. Return to the terminal.');
      rejectCallback(error);
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  const authorizationUrl = new URL(AUTH_URL);
  authorizationUrl.search = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: BLOGGER_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  }).toString();

  try {
    process.stdout.write(`Open this Google authorization page if the browser does not open:\n${authorizationUrl}\n`);
    browserOpener(authorizationUrl.toString());
    const code = await callback;
    const response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: client.clientId,
        client_secret: client.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });
    const token = await parseJsonResponse(response, 'OAuth authorization');
    const stored = {
      ...token,
      expires_at: Date.now() + (Number(token.expires_in || 3600) * 1000),
    };
    await writePrivateJson(paths.token, stored);
    return stored;
  } finally {
    server.close();
  }
}

async function getAccessToken(paths, dependencies = {}) {
  const client = parseInstalledClient(await readJson(paths.oauthClient));
  let token = await readJson(paths.token);

  if (token.access_token && Number(token.expires_at) > Date.now() + 60_000) {
    return token.access_token;
  }

  token = await refreshAccessToken(client, token, dependencies.fetchImpl || fetch);
  await writePrivateJson(paths.token, token);
  return token.access_token;
}

if (require.main === module) {
  authorizeInteractive(bloggerPaths(path.resolve('.')))
    .then(() => process.stdout.write('Blogger OAuth authorization saved.\n'))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}

module.exports = {
  authorizeInteractive,
  getAccessToken,
  parseInstalledClient,
  refreshAccessToken,
};
