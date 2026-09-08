const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

const { BloggerClient } = require('./blogger-api');
const {
  REQUIRED_DISCLOSURE,
  buildPost,
  markerFor,
  textLength,
  validateCampaign,
} = require('./build-blogger-health-post');
const { getAccessToken } = require('./blogger-oauth');
const { bloggerPaths } = require('./blogger-paths');
const {
  commitAssetDirectory,
  publicImageUrls,
  waitForPublicImages,
} = require('./publish-blogger-assets');

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writePrivateJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(file, 0o600);
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (exitCode) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed with exit code ${exitCode}: ${stderr.trim()}`));
      }
    });
  });
}

async function defaultRenderImages({ root, campaignPath, campaign, outputDir }) {
  const productPath = path.join(path.dirname(campaignPath), 'product.png');
  await runCommand('python', [
    path.join(root, 'scripts', 'render-blogger-health-images.py'),
    '--campaign', campaignPath,
    '--product', productPath,
    '--output', outputDir,
  ], root);
  return campaign.imageFiles.map((file) => path.join(outputDir, file));
}

function normalizeHtmlEntities(value) {
  return String(value).replaceAll('&amp;', '&');
}

function verifyRemotePost(post, campaign, imageUrls) {
  if (!post || !post.id || typeof post.content !== 'string') {
    throw new Error('Remote Blogger post is incomplete.');
  }
  const expected = buildPost(
    campaign,
    `https://idont82.github.io/images/blogger/${campaign.slug}`,
  );
  if (post.title !== expected.title) {
    throw new Error('Remote Blogger post title does not match.');
  }
  if (!post.content.includes(markerFor(campaign.productId))) {
    throw new Error('Remote Blogger post marker is missing.');
  }
  for (const url of imageUrls) {
    if (!post.content.includes(url)) {
      throw new Error(`Remote Blogger post has a missing image: ${url}`);
    }
  }
  if ((post.content.match(/<img\b/g) || []).length !== 3) {
    throw new Error('Remote Blogger post must contain exactly three images.');
  }
  if (!normalizeHtmlEntities(post.content).includes(campaign.product.affiliateUrl)) {
    throw new Error('Remote Blogger post product link is missing.');
  }
  const length = textLength(post.content);
  if (length < 1500 || length > 2000) {
    throw new Error(`Remote Blogger post text length is invalid: ${length}.`);
  }
  if (!post.content.trim().endsWith(`${REQUIRED_DISCLOSURE}</p>`)) {
    throw new Error('Remote Blogger post bottom disclosure does not match.');
  }
  return {
    title: true,
    images: 3,
    productLink: true,
    textLength: length,
    disclosure: true,
  };
}

function defaultDependencies(root) {
  const privatePaths = bloggerPaths(root);
  return {
    root,
    readJson,
    renderImages: defaultRenderImages,
    publishAssets: (siteRoot, slug, outputDir) => commitAssetDirectory(siteRoot, slug, outputDir),
    waitImages: (urls) => waitForPublicImages(urls),
    getToken: () => getAccessToken(privatePaths),
    createClient: (token) => new BloggerClient({ token }),
    writePublication: (record) => writePrivateJson(
      path.join(privatePaths.privateRoot, record.slug, 'publication.json'),
      record,
    ),
  };
}

async function runPublication({ campaignPath, dryRun = false, dependencies = {} }) {
  if (!campaignPath) {
    throw new Error('A campaign JSON path is required.');
  }
  const root = path.resolve(dependencies.root || process.cwd());
  const deps = { ...defaultDependencies(root), ...dependencies, root };
  const resolvedCampaignPath = path.resolve(root, campaignPath);
  const campaign = await deps.readJson(resolvedCampaignPath);
  validateCampaign(campaign);
  const imageBaseUrl = `https://idont82.github.io/images/blogger/${campaign.slug}`;
  const urls = publicImageUrls(campaign.slug, campaign.imageFiles);
  const builtPost = buildPost(campaign, imageBaseUrl);

  if (dryRun) {
    return {
      status: 'dry-run',
      slug: campaign.slug,
      productId: campaign.productId,
      title: builtPost.title,
      imageCount: urls.length,
      textLength: textLength(builtPost.content),
      disclosure: builtPost.content.trim().endsWith(`${REQUIRED_DISCLOSURE}</p>`),
    };
  }

  const token = await deps.getToken();
  const client = deps.createClient(token);
  const blog = await client.getBlogByUrl(bloggerPaths(root).blogUrl);
  const posts = await client.listPosts(blog.id);
  const marker = markerFor(campaign.productId);
  const existing = posts.find((post) => String(post.content || '').includes(marker));
  if (existing) {
    const remote = await client.getPost(blog.id, existing.id);
    verifyRemotePost(remote, campaign, urls);
    return { status: 'recovered', postId: remote.id, url: remote.url };
  }

  const outputDir = path.join(root, 'images', 'blogger', campaign.slug);
  await deps.renderImages({
    root,
    campaignPath: resolvedCampaignPath,
    campaign,
    outputDir,
  });
  await deps.publishAssets(root, campaign.slug, outputDir);
  await deps.waitImages(urls);

  const inserted = await client.insertPost(blog.id, builtPost);
  const remote = await client.getPost(blog.id, inserted.id);
  const checks = verifyRemotePost(remote, campaign, urls);
  const record = {
    slug: campaign.slug,
    productId: campaign.productId,
    blogId: blog.id,
    postId: remote.id,
    url: remote.url,
    publishedAt: new Date().toISOString(),
    checks,
  };
  await deps.writePublication(record);

  return {
    status: 'published',
    postId: remote.id,
    url: remote.url,
    checks,
  };
}

function parseArguments(argv) {
  const campaignIndex = argv.indexOf('--campaign');
  if (campaignIndex === -1 || !argv[campaignIndex + 1]) {
    throw new Error('Usage: node scripts/publish-blogger-health-post.js --campaign <file> [--dry-run]');
  }
  return {
    campaignPath: argv[campaignIndex + 1],
    dryRun: argv.includes('--dry-run'),
  };
}

if (require.main === module) {
  let arguments;
  try {
    arguments = parseArguments(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
  if (arguments) {
    runPublication(arguments)
      .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
      .catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
      });
  }
}

module.exports = {
  parseArguments,
  runPublication,
  verifyRemotePost,
};
