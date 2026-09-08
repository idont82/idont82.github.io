const path = require('node:path');
const { spawn } = require('node:child_process');

const PUBLIC_BASE = 'https://idont82.github.io/images/blogger';

function assertSlug(slug) {
  if (!/^[a-z0-9-]+$/.test(String(slug))) {
    throw new Error('Blogger asset slug must be a safe lowercase slug.');
  }
}

function assertSafeAssetDirectory(root, slug, directory) {
  assertSlug(slug);
  const resolvedRoot = path.resolve(root);
  const expected = path.join(resolvedRoot, 'images', 'blogger', slug);
  const resolvedDirectory = path.resolve(directory);
  if (resolvedDirectory !== expected) {
    throw new Error('Asset path must be the exact campaign directory below images/blogger.');
  }
  return resolvedDirectory;
}

function publicImageUrls(slug, files) {
  assertSlug(slug);
  if (!Array.isArray(files) || files.length !== 3 || new Set(files).size !== 3) {
    throw new Error('Exactly three distinct image files are required.');
  }
  return files.map((file) => {
    if (!/^[a-z0-9-]+\.png$/.test(file) || path.basename(file) !== file) {
      throw new Error('Image files must be safe lowercase PNG filenames.');
    }
    return `${PUBLIC_BASE}/${slug}/${file}`;
  });
}

function defaultCommandRunner(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (exitCode) => resolve({ exitCode, stdout, stderr }));
  });
}

async function runChecked(commandRunner, command, args, options) {
  const result = await commandRunner(command, args, options);
  if (result.exitCode !== 0) {
    throw new Error(`${command} ${args[0]} failed with exit code ${result.exitCode}.`);
  }
  return result;
}

async function commitAssetDirectory(root, slug, directory, commandRunner = defaultCommandRunner) {
  const safeDirectory = assertSafeAssetDirectory(root, slug, directory);
  const relative = path.relative(path.resolve(root), safeDirectory).split(path.sep).join('/');
  const options = { cwd: path.resolve(root) };

  await runChecked(commandRunner, 'git', ['add', '--', relative], options);
  await runChecked(commandRunner, 'git', ['diff', '--cached', '--check', '--', relative], options);
  const changed = await commandRunner('git', ['diff', '--cached', '--quiet', '--', relative], options);
  if (changed.exitCode === 0) {
    return { committed: false, directory: relative };
  }
  if (changed.exitCode !== 1) {
    throw new Error(`git diff failed with exit code ${changed.exitCode}.`);
  }

  await runChecked(
    commandRunner,
    'git',
    ['commit', '--only', relative, '-m', `feat: publish Blogger assets for ${slug}`],
    options,
  );
  await runChecked(commandRunner, 'git', ['push', 'origin', 'main'], options);
  return { committed: true, directory: relative };
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPublicImages(urls, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const sleepImpl = options.sleepImpl || sleep;
  const timeoutMs = options.timeoutMs || 300_000;
  const startedAt = Date.now();
  let lastPending = urls.slice();

  while (Date.now() - startedAt < timeoutMs) {
    const ready = [];
    const pending = [];
    for (const url of urls) {
      try {
        const response = await fetchImpl(url, { cache: 'no-store' });
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.toLowerCase().startsWith('image/')) {
          ready.push(url);
        } else {
          pending.push(url);
        }
      } catch {
        pending.push(url);
      }
    }
    if (pending.length === 0) {
      return ready;
    }
    lastPending = pending;
    await sleepImpl(5_000);
  }

  throw new Error(`GitHub Pages images were not ready before timeout (${lastPending.length} pending).`);
}

module.exports = {
  assertSafeAssetDirectory,
  commitAssetDirectory,
  publicImageUrls,
  waitForPublicImages,
};
