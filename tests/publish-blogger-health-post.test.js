const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  runPublication,
  verifyRemotePost,
} = require('../scripts/publish-blogger-health-post');
const { buildPost, markerFor } = require('../scripts/build-blogger-health-post');

const campaign = require('./fixtures/blogger-health-campaign.json');
const root = path.resolve('D:/site');

function imageUrls() {
  return campaign.imageFiles.map(
    (file) => `https://idont82.github.io/images/blogger/${campaign.slug}/${file}`,
  );
}

function baseDependencies(overrides = {}) {
  const calls = [];
  const client = {
    getBlogByUrl: async () => ({ id: 'blog1' }),
    listPosts: async () => [],
    insertPost: async (blogId, post) => {
      calls.push(['insert', blogId, post]);
      return { id: 'post1', url: 'https://goldpick-choice.blogspot.com/post1' };
    },
    getPost: async (blogId, postId) => ({
      id: postId,
      url: 'https://goldpick-choice.blogspot.com/post1',
      ...buildPost(campaign, `https://idont82.github.io/images/blogger/${campaign.slug}`),
    }),
  };
  return {
    calls,
    root,
    readJson: async () => structuredClone(campaign),
    renderImages: async () => {
      calls.push(['render']);
      return campaign.imageFiles;
    },
    publishAssets: async () => {
      calls.push(['assets']);
      return { committed: true };
    },
    waitImages: async (urls) => {
      calls.push(['wait', urls]);
      return urls;
    },
    getToken: async () => 'access',
    createClient: () => client,
    writePublication: async (record) => calls.push(['write', record]),
    ...overrides,
  };
}

test('dry-run validates without Git, Blogger, rendering, or publication writes', async () => {
  const dependencies = baseDependencies({
    getToken: async () => { throw new Error('OAuth must not run'); },
    createClient: () => { throw new Error('Blogger must not run'); },
    renderImages: async () => { throw new Error('Renderer must not run'); },
    publishAssets: async () => { throw new Error('Git must not run'); },
    writePublication: async () => { throw new Error('Record must not be written'); },
  });

  const result = await runPublication({
    campaignPath: 'campaign.json',
    dryRun: true,
    dependencies,
  });

  assert.equal(result.status, 'dry-run');
  assert.equal(result.imageCount, 3);
  assert.ok(result.textLength >= 1500 && result.textLength <= 2000);
});

test('recovers an existing post with the same product marker', async () => {
  const existing = {
    id: 'existing1',
    url: 'https://goldpick-choice.blogspot.com/existing',
    ...buildPost(campaign, `https://idont82.github.io/images/blogger/${campaign.slug}`),
  };
  const dependencies = baseDependencies({
    createClient: () => ({
      getBlogByUrl: async () => ({ id: 'blog1' }),
      listPosts: async () => [existing],
      getPost: async () => existing,
    }),
    renderImages: async () => { throw new Error('Must not render an existing post'); },
  });

  const result = await runPublication({ campaignPath: 'campaign.json', dependencies });

  assert.deepEqual(result, {
    status: 'recovered',
    postId: 'existing1',
    url: existing.url,
  });
});

test('publishes a new post only after rendering and public image verification', async () => {
  const dependencies = baseDependencies();

  const result = await runPublication({ campaignPath: 'campaign.json', dependencies });

  assert.equal(result.status, 'published');
  assert.equal(result.postId, 'post1');
  assert.deepEqual(
    dependencies.calls.map((call) => call[0]),
    ['render', 'assets', 'wait', 'insert', 'write'],
  );
});

test('does not call Blogger insert when image publication fails', async () => {
  let inserted = false;
  const dependencies = baseDependencies({
    publishAssets: async () => { throw new Error('push failed'); },
    createClient: () => ({
      getBlogByUrl: async () => ({ id: 'blog1' }),
      listPosts: async () => [],
      insertPost: async () => { inserted = true; },
    }),
  });

  await assert.rejects(
    runPublication({ campaignPath: 'campaign.json', dependencies }),
    /push failed/,
  );
  assert.equal(inserted, false);
});

test('remote verification requires title, images, link, length, and disclosure', () => {
  const post = {
    id: 'post1',
    ...buildPost(campaign, `https://idont82.github.io/images/blogger/${campaign.slug}`),
  };
  assert.doesNotThrow(() => verifyRemotePost(post, campaign, imageUrls()));

  const broken = { ...post, content: post.content.replace(imageUrls()[1], 'missing.png') };
  assert.throws(() => verifyRemotePost(broken, campaign, imageUrls()), /missing image/);
});
