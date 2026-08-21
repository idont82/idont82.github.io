const assert = require('node:assert/strict');
const test = require('node:test');

let cleanupReplacedPosts;
let expectedOldIds;
try {
  ({ cleanupReplacedPosts, EXPECTED_OLD_IDS: expectedOldIds } = require('../scripts/delete-replaced-facebook-posts'));
} catch {
  cleanupReplacedPosts = undefined;
  expectedOldIds = [];
}

const OLD_IDS = [
  '1243431898854300_122110686801428837',
  '1243431898854300_122110687095428837',
  '1243431898854300_122110687353428837',
];

function publishedQueue() {
  return [18, 19, 20].map((shortLinkId, index) => ({
    id: `replacement-${index}`,
    category: 'laptop',
    article: `/blog/replacement-${index}.html`,
    linkMode: 'blog',
    scheduledAt: `2026-08-21T15:3${index}:00+09:00`,
    shortLinkId,
    cardCopy: ['노트북 추천', '스펙 비교', '자세히 보기'],
    status: 'published',
    attempts: 0,
    facebookPostId: `page_new_${index}`,
    facebookPermalink: `https://facebook.test/new-${index}`,
    publishedAt: '2026-08-21T07:00:00.000Z',
    replacesFacebookPostId: OLD_IDS[index],
  }));
}

function verifiedPost(item) {
  return {
    id: item.facebookPostId,
    message: `https://idont82.github.io/g/?n=${item.shortLinkId}\n\n본문`,
    permalink_url: item.facebookPermalink,
    attachments: {
      data: [{
        media_type: 'album',
        subattachments: { data: [{}, {}, {}] },
      }],
    },
  };
}

function fakeGraph(queue) {
  const deleted = [];
  return {
    deleted,
    getPost: async (id) => verifiedPost(queue.find((item) => item.facebookPostId === id)),
    deletePost: async (id) => {
      deleted.push(id);
      return true;
    },
  };
}

test('replacement cleanup module exposes the fixed old-post allowlist', () => {
  assert.equal(typeof cleanupReplacedPosts, 'function');
  assert.deepEqual(expectedOldIds, OLD_IDS);
});

test('cleanup refuses incomplete, mismatched, or visually unverified replacements', async () => {
  const incomplete = publishedQueue();
  incomplete[2].status = 'queued';
  const incompleteGraph = fakeGraph(incomplete);
  await assert.rejects(
    () => cleanupReplacedPosts({ queue: incomplete, graphClient: incompleteGraph, dryRun: false }),
    /all replacement posts must be published/
  );
  assert.equal(incompleteGraph.deleted.length, 0);

  const mismatched = publishedQueue();
  mismatched[1].replacesFacebookPostId = 'page_wrong';
  const mismatchGraph = fakeGraph(mismatched);
  await assert.rejects(
    () => cleanupReplacedPosts({ queue: mismatched, graphClient: mismatchGraph, dryRun: false }),
    /replacement allowlist mismatch/
  );
  assert.equal(mismatchGraph.deleted.length, 0);

  const badCards = publishedQueue();
  const badGraph = fakeGraph(badCards);
  badGraph.getPost = async (id) => {
    const post = verifiedPost(badCards.find((item) => item.facebookPostId === id));
    post.attachments.data[0].subattachments.data.pop();
    return post;
  };
  await assert.rejects(
    () => cleanupReplacedPosts({ queue: badCards, graphClient: badGraph, dryRun: false }),
    /exactly three cards/
  );
  assert.equal(badGraph.deleted.length, 0);

  const badPermalink = publishedQueue();
  const permalinkGraph = fakeGraph(badPermalink);
  permalinkGraph.getPost = async (id) => {
    const post = verifiedPost(badPermalink.find((item) => item.facebookPostId === id));
    post.permalink_url = 'https://facebook.test/unexpected';
    return post;
  };
  await assert.rejects(
    () => cleanupReplacedPosts({ queue: badPermalink, graphClient: permalinkGraph, dryRun: false }),
    /permalink mismatch/
  );
  assert.equal(permalinkGraph.deleted.length, 0);
});

test('cleanup validates all new posts before deleting exactly three old posts', async () => {
  const queue = publishedQueue();
  const graphClient = fakeGraph(queue);
  const dryRun = await cleanupReplacedPosts({ queue, graphClient, dryRun: true });
  assert.deepEqual(dryRun.deleteIds, OLD_IDS);
  assert.equal(graphClient.deleted.length, 0);

  const result = await cleanupReplacedPosts({ queue, graphClient, dryRun: false });
  assert.deepEqual(result.deletedIds, OLD_IDS);
  assert.deepEqual(graphClient.deleted, OLD_IDS);
});
