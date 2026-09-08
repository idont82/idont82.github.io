const fs = require('node:fs/promises');
const path = require('node:path');

const { BloggerClient } = require('./blogger-api');
const { getAccessToken } = require('./blogger-oauth');
const { bloggerPaths } = require('./blogger-paths');

const DISCLOSURE_TEXT = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

function decodeBasicEntities(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function markerForSource(sourceUrl) {
  const parsed = new URL(sourceUrl);
  const identifier = parsed.pathname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!identifier) {
    throw new Error('Source URL must contain a stable path.');
  }
  return `<!-- goldpick-source:${identifier} -->`;
}

function extractMain(html) {
  const match = String(html).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) {
    throw new Error('The source page has no main content.');
  }
  return match[1]
    .replace(/^\s*<article\b[^>]*>/i, '')
    .replace(/<\/article>\s*$/i, '');
}

function makeUrlsAbsolute(html, sourceUrl) {
  return html.replace(/\b(href|src)=(['"])(.*?)\2/gi, (whole, attribute, quote, value) => {
    if (/^(?:data:|mailto:|tel:|javascript:)/i.test(value)) {
      return whole;
    }
    const absolute = new URL(decodeBasicEntities(value), sourceUrl).toString().replaceAll('&', '&amp;');
    return `${attribute}=${quote}${absolute}${quote}`;
  });
}

function addReadableImageStyles(html) {
  return html.replace(/<img\b(?![^>]*\bstyle=)([^>]*)>/gi, '<img style="max-width:100%;height:auto;display:block;margin:20px auto"$1>');
}

function buildImportedPost(html, sourceUrl) {
  const titleMatch = String(html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) {
    throw new Error('The source page title is missing.');
  }
  const title = decodeBasicEntities(titleMatch[1])
    .replace(/\s*\|\s*Gold Pick\s*$/i, '')
    .trim();
  let body = extractMain(html);
  body = body.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, '');

  const disclosurePattern = /<p\b[^>]*class=(['"])[^'"]*disclosure[^'"]*\1[^>]*>[\s\S]*?<\/p>/i;
  const disclosureMatch = body.match(disclosurePattern);
  if (!disclosureMatch || !disclosureMatch[0].includes(DISCLOSURE_TEXT)) {
    throw new Error('The exact Coupang disclosure is missing from the source page.');
  }
  body = body.replace(disclosurePattern, '');
  body = makeUrlsAbsolute(body, sourceUrl);
  body = addReadableImageStyles(body).trim();

  return {
    title,
    content: [
      markerForSource(sourceUrl),
      '<div style="font-family:Arial,\'Malgun Gothic\',sans-serif;line-height:1.75;color:#17202a;max-width:860px;margin:0 auto">',
      body,
      '</div>',
      `<p>${DISCLOSURE_TEXT}</p>`,
    ].join(''),
  };
}

function verifyImportedPost(post, expected, sourceUrl) {
  if (!post || !post.id || post.title !== expected.title) {
    throw new Error('Published Blogger title does not match the source page.');
  }
  if (!String(post.content).includes(markerForSource(sourceUrl))) {
    throw new Error('Published Blogger source marker is missing.');
  }
  const expectedImages = (expected.content.match(/<img\b/gi) || []).length;
  const actualImages = (post.content.match(/<img\b/gi) || []).length;
  if (actualImages !== expectedImages || actualImages < 3) {
    throw new Error(`Published Blogger image count is invalid: ${actualImages}.`);
  }
  if (!post.content.trim().endsWith(`${DISCLOSURE_TEXT}</p>`)) {
    throw new Error('Published Blogger disclosure is not at the bottom.');
  }
  return { title: true, images: actualImages, disclosure: true };
}

async function writePrivateJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(file, 0o600);
}

async function publishExistingPage({ file, sourceUrl }) {
  const root = path.resolve('.');
  const privatePaths = bloggerPaths(root);
  const html = await fs.readFile(path.resolve(root, file), 'utf8');
  const expected = buildImportedPost(html, sourceUrl);
  const token = await getAccessToken(privatePaths);
  const client = new BloggerClient({ token });
  const blog = await client.getBlogByUrl(privatePaths.blogUrl);
  const marker = markerForSource(sourceUrl);
  const recentPosts = await client.listPosts(blog.id);
  const existing = recentPosts.find((post) => String(post.content || '').includes(marker));

  if (existing) {
    const remote = await client.getPost(blog.id, existing.id);
    const checks = verifyImportedPost(remote, expected, sourceUrl);
    return { status: 'recovered', postId: remote.id, url: remote.url, checks };
  }

  const inserted = await client.insertPost(blog.id, expected);
  const remote = await client.getPost(blog.id, inserted.id);
  const checks = verifyImportedPost(remote, expected, sourceUrl);
  const slug = marker.slice('<!-- goldpick-source:'.length, -' -->'.length);
  await writePrivateJson(
    path.join(privatePaths.privateRoot, 'imports', `${slug}.json`),
    {
      sourceUrl,
      postId: remote.id,
      url: remote.url,
      publishedAt: new Date().toISOString(),
      checks,
    },
  );
  return { status: 'published', postId: remote.id, url: remote.url, checks };
}

function parseArguments(argv) {
  const fileIndex = argv.indexOf('--file');
  const urlIndex = argv.indexOf('--url');
  if (fileIndex < 0 || !argv[fileIndex + 1] || urlIndex < 0 || !argv[urlIndex + 1]) {
    throw new Error('Usage: node scripts/publish-existing-page-to-blogger.js --file <html> --url <public-url>');
  }
  return { file: argv[fileIndex + 1], sourceUrl: argv[urlIndex + 1] };
}

if (require.main === module) {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
  if (options) {
    publishExistingPage(options)
      .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
      .catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
      });
  }
}

module.exports = {
  buildImportedPost,
  markerForSource,
  parseArguments,
  publishExistingPage,
  verifyImportedPost,
};
