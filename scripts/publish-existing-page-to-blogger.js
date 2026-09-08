const fs = require('node:fs/promises');
const path = require('node:path');

const { BloggerClient } = require('./blogger-api');
const { getAccessToken } = require('./blogger-oauth');
const { bloggerPaths } = require('./blogger-paths');

const DISCLOSURE_TEXT = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const LAPTOP_SCOPED_CSS = `<style>
.goldpick-import{font-family:Arial,'Malgun Gothic',sans-serif;line-height:1.75;color:#231d18;max-width:860px;margin:0 auto}.goldpick-import .laptop-kicker{font-weight:800;color:#7c4b23;letter-spacing:.05em}.goldpick-import .laptop-lead{font-size:1.08rem;line-height:1.85;color:#443d37}.goldpick-import .laptop-summary{margin:24px 0;padding:22px;border:1px solid #e4cda8;border-radius:18px;background:#fff7e8}.goldpick-import .laptop-hero{display:block;margin:24px 0;border-radius:24px;overflow:hidden;background:#f5f2ec}.goldpick-import .laptop-hero img{display:block;width:100%;max-height:520px;object-fit:contain}.goldpick-import .laptop-section{margin-top:48px}.goldpick-import .laptop-section h2{font-size:1.65rem;line-height:1.35}.goldpick-import .laptop-checklist{padding-left:1.4rem;line-height:1.85}.goldpick-import .laptop-table-wrap{overflow-x:auto}.goldpick-import .laptop-table{width:100%;min-width:620px;border-collapse:collapse}.goldpick-import .laptop-table th,.goldpick-import .laptop-table td{padding:14px;border-bottom:1px solid #ddd;text-align:left}.goldpick-import .laptop-products{display:grid;gap:24px}.goldpick-import .laptop-product-card{display:grid;grid-template-columns:minmax(220px,36%) 1fr;gap:24px;padding:20px;border:1px solid #e6ddcf;border-radius:22px;background:#fff}.goldpick-import .laptop-product-image img{width:100%;aspect-ratio:1;object-fit:contain}.goldpick-import .laptop-product-content{min-width:0;overflow-wrap:anywhere}.goldpick-import .laptop-role-label{display:inline-block;padding:6px 10px;border-radius:999px;background:#3e2d22;color:#fff;font-size:.82rem;font-weight:800}.goldpick-import .laptop-price{margin:12px 0;color:#6e3d18}.goldpick-import .laptop-price strong{display:block;color:#bd5c1c;font-size:1.8rem;line-height:1.25}.goldpick-import .laptop-notes div{margin-top:12px}.goldpick-import .laptop-notes dt{font-weight:800}.goldpick-import .laptop-notes dd{margin:4px 0 0;line-height:1.65}.goldpick-import .laptop-buy-button{display:inline-block;margin-top:14px;padding:12px 16px;border-radius:10px;background:#bd5c1c;color:#fff;text-decoration:none;font-weight:800}.goldpick-import .laptop-caution{padding:20px;border-left:5px solid #b84c2a;background:#fff4ef}.goldpick-import .laptop-faq details{padding:16px 0;border-bottom:1px solid #ddd}.goldpick-import .laptop-faq summary{cursor:pointer;font-weight:800}.goldpick-import .laptop-footer{margin-top:56px;padding-top:24px;border-top:1px solid #ddd;color:#666}@media (max-width:680px){.goldpick-import .laptop-product-card{display:block!important}.goldpick-import .laptop-product-content{margin-top:18px}.goldpick-import .laptop-product-image img{max-height:330px}.goldpick-import .laptop-table-wrap{overflow-x:visible!important}.goldpick-import .laptop-table{width:100%!important;min-width:0!important;table-layout:fixed;font-size:.78rem;line-height:1.45}.goldpick-import .laptop-table th,.goldpick-import .laptop-table td{padding:9px 5px;overflow-wrap:anywhere;word-break:break-word}.goldpick-import .laptop-table th:nth-child(1),.goldpick-import .laptop-table td:nth-child(1){width:24%}.goldpick-import .laptop-table th:nth-child(2),.goldpick-import .laptop-table td:nth-child(2){width:56%}.goldpick-import .laptop-table th:nth-child(3),.goldpick-import .laptop-table td:nth-child(3){width:20%}}
</style>`;

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

function decorateClass(html, tag, className, style, dataAttribute = '') {
  const pattern = new RegExp(`<${tag}\\b([^>]*\\bclass=(["'])[^"']*\\b${className}\\b[^"']*\\2[^>]*)>`, 'gi');
  return html.replace(pattern, (whole, attributes) => {
    let decorated = attributes;
    if (/\bstyle=(['"])/i.test(decorated)) {
      decorated = decorated.replace(/\bstyle=(['"])(.*?)\1/i, (styleWhole, quote, current) => `style=${quote}${current};${style}${quote}`);
    } else {
      decorated += ` style="${style}"`;
    }
    if (dataAttribute && !decorated.includes(dataAttribute)) {
      decorated += ` ${dataAttribute}`;
    }
    return `<${tag}${decorated}>`;
  });
}

function decorateLaptopLayout(html) {
  const decorations = [
    ['div', 'laptop-summary', 'margin:24px 0;padding:22px;border:1px solid #e4cda8;border-radius:18px;background:#fff7e8'],
    ['a', 'laptop-hero', 'display:block;margin:24px 0;border-radius:24px;overflow:hidden;background:#f5f2ec'],
    ['div', 'laptop-table-wrap', 'overflow-x:auto;margin-top:18px'],
    ['table', 'laptop-table', 'width:100%;min-width:620px;border-collapse:collapse'],
    ['div', 'laptop-products', 'display:grid;gap:24px'],
    ['article', 'laptop-product-card', 'display:grid;grid-template-columns:minmax(220px,36%) 1fr;gap:24px;padding:20px;border:1px solid #e6ddcf;border-radius:22px;background:#fff', 'data-blogger-product-card="styled"'],
    ['a', 'laptop-product-image', 'display:block;text-decoration:none'],
    ['div', 'laptop-product-content', 'min-width:0;overflow-wrap:anywhere'],
    ['span', 'laptop-role-label', 'display:inline-block;padding:6px 10px;border-radius:999px;background:#3e2d22;color:#fff;font-size:13px;font-weight:800'],
    ['p', 'laptop-price', 'margin:12px 0;color:#6e3d18;font-size:18px;font-weight:700', 'data-blogger-price="prominent"'],
    ['a', 'laptop-buy-button', 'display:inline-block;margin-top:14px;padding:12px 16px;border-radius:10px;background:#bd5c1c;color:#fff;text-decoration:none;font-weight:800', 'data-blogger-buy-button="styled"'],
    ['section', 'laptop-caution', 'margin-top:48px;padding:20px;border-left:5px solid #b84c2a;background:#fff4ef'],
    ['footer', 'laptop-footer', 'margin-top:56px;padding-top:24px;border-top:1px solid #ddd;color:#666'],
  ];
  return decorations.reduce(
    (result, [tag, className, style, dataAttribute]) => decorateClass(result, tag, className, style, dataAttribute),
    html,
  );
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
  body = decorateLaptopLayout(addReadableImageStyles(body)).trim();

  return {
    title,
    content: [
      markerForSource(sourceUrl),
      LAPTOP_SCOPED_CSS,
      '<div class="goldpick-import" style="font-family:Arial,\'Malgun Gothic\',sans-serif;line-height:1.75;color:#231d18;max-width:860px;margin:0 auto">',
      body,
      '</div>',
      `<p style="margin-top:48px;padding:16px;border-radius:12px;background:#f4f4f4;font-size:14px">${DISCLOSURE_TEXT}</p>`,
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
  const checks = { title: true, images: actualImages, disclosure: true };
  if (expected.content.includes('laptop-product-card')) {
    const requiredMarkers = [
      ['product cards', 'data-blogger-product-card="styled"', 3],
      ['prominent prices', 'data-blogger-price="prominent"', 3],
      ['purchase buttons', 'data-blogger-buy-button="styled"', 3],
    ];
    for (const [label, marker, count] of requiredMarkers) {
      const actualCount = post.content.split(marker).length - 1;
      if (actualCount !== count) {
        throw new Error(`Published Blogger ${label} count is invalid: ${actualCount}.`);
      }
    }
    if (!post.content.includes('.goldpick-import .laptop-product-card') || !post.content.includes('@media (max-width:680px)')) {
      throw new Error('Published Blogger responsive laptop styles are missing.');
    }
    checks.productCards = 3;
    checks.prominentPrices = 3;
    checks.purchaseButtons = 3;
    checks.responsive = true;
  }
  return checks;
}

async function writePrivateJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(file, 0o600);
}

async function publishExistingPage({ file, sourceUrl, dependencies = {} }) {
  const root = path.resolve(dependencies.root || '.');
  const privatePaths = bloggerPaths(root);
  const readFile = dependencies.readFile || fs.readFile;
  const tokenProvider = dependencies.getToken || (() => getAccessToken(privatePaths));
  const clientFactory = dependencies.createClient || ((token) => new BloggerClient({ token }));
  const publicationWriter = dependencies.writePublication || ((record) => writePrivateJson(
    path.join(privatePaths.privateRoot, 'imports', `${record.slug}.json`),
    record,
  ));
  const html = await readFile(path.resolve(root, file), 'utf8');
  const expected = buildImportedPost(html, sourceUrl);
  const token = await tokenProvider();
  const client = clientFactory(token);
  const blog = await client.getBlogByUrl(privatePaths.blogUrl);
  const marker = markerForSource(sourceUrl);
  const slug = marker.slice('<!-- goldpick-source:'.length, -' -->'.length);
  const recentPosts = await client.listPosts(blog.id);
  const existing = recentPosts.find((post) => String(post.content || '').includes(marker));

  if (existing) {
    await client.updatePost(blog.id, existing.id, expected);
    const remote = await client.getPost(blog.id, existing.id);
    const checks = verifyImportedPost(remote, expected, sourceUrl);
    await publicationWriter({
      slug,
      sourceUrl,
      postId: remote.id,
      url: remote.url,
      updatedAt: new Date().toISOString(),
      checks,
    });
    return { status: 'updated', postId: remote.id, url: remote.url, checks };
  }

  const inserted = await client.insertPost(blog.id, expected);
  const remote = await client.getPost(blog.id, inserted.id);
  const checks = verifyImportedPost(remote, expected, sourceUrl);
  await publicationWriter({
    slug,
    sourceUrl,
    postId: remote.id,
    url: remote.url,
    publishedAt: new Date().toISOString(),
    checks,
  });
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
