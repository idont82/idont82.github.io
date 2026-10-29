// 겨울 보온 3편을 Blogger(goldpick-choice.blogspot.com)에만 올린다.
//
//   node scripts/publish-winter-warm-blogger-posts.js                        # 미리보기만 생성
//   node scripts/publish-winter-warm-blogger-posts.js --publish              # 세 편 모두 발행
//   node scripts/publish-winter-warm-blogger-posts.js --publish --only <슬러그>  # 한 편만 발행
//
// 발행은 2단계로 돈다. 1차로 글을 올려 URL을 받고, 2차로 서로를 가리키는
// 내부 링크를 넣어 업데이트한다. 같은 마커가 이미 있으면 새 글 대신 수정한다.
// 한 편만 올릴 때는 가리킬 상대가 없으므로 2차 단계를 건너뛴다.
const fs = require('node:fs/promises');
const path = require('node:path');

const { BloggerClient } = require('./blogger-api');
const { getAccessToken } = require('./blogger-oauth');
const { bloggerPaths } = require('./blogger-paths');
const { WINTER_POSTS, buildPost, markerFor, escapeHtml } = require('./winter-warm-blogger-posts');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, '.blogger-artifacts', 'winter');
const EXPECTED_HOST = 'goldpick-choice.blogspot.com';

function asOfToday() {
  return new Date().toISOString().slice(0, 10);
}

async function readProducts(post) {
  const file = path.join(root, 'data', post.dataFile);
  const payload = JSON.parse(await fs.readFile(file, 'utf8'));
  if (payload.subId !== post.subId) {
    throw new Error(`${post.dataFile} 의 subId(${payload.subId})가 ${post.subId} 와 다릅니다. 딥링크를 다시 만드세요.`);
  }
  return payload.items || [];
}

async function writePreview(post, built) {
  await fs.mkdir(outputDir, { recursive: true });
  const previewPath = path.join(outputDir, `${post.slug}-preview.html`);
  const postPath = path.join(outputDir, `${post.slug}-post.json`);
  const page = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(built.title)}</title><body style="margin:0;padding:16px;background:#fff"><h1 style="font:bold 28px/1.45 Arial,'Malgun Gothic',sans-serif;max-width:760px;margin:20px auto;color:#10243f">${escapeHtml(built.title)}</h1>${built.content}</body></html>`;
  await fs.writeFile(previewPath, page, 'utf8');
  await fs.writeFile(postPath, `${JSON.stringify(built, null, 2)}\n`, 'utf8');
  return { previewPath, postPath };
}

function selectPosts(slugs) {
  if (!slugs || slugs.length === 0) {
    return WINTER_POSTS;
  }
  return slugs.map((slug) => {
    const found = WINTER_POSTS.find((post) => post.slug === slug);
    if (!found) {
      throw new Error(`알 수 없는 슬러그입니다: ${slug} (가능: ${WINTER_POSTS.map((p) => p.slug).join(', ')})`);
    }
    return found;
  });
}

async function buildAll(related = new Map(), slugs = []) {
  const asOfDate = asOfToday();
  const results = [];
  for (const post of selectPosts(slugs)) {
    const items = await readProducts(post);
    const built = buildPost(post, items, { asOfDate, related: related.get(post.slug) || [] });
    const files = await writePreview(post, built);
    results.push({ post, built, files, products: items.length });
  }
  return results;
}

async function findExisting(client, blogId, marker) {
  let pageToken = '';
  do {
    const query = `/blogs/${blogId}/posts?maxResults=50&fetchBodies=true${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const list = await client.request(query);
    const match = (list.items || []).find((item) => String(item.content).includes(marker));
    if (match) return match;
    pageToken = list.nextPageToken || '';
  } while (pageToken);
  return null;
}

async function save(client, blogId, post, built) {
  const marker = markerFor(post.slug);
  const existing = await findExisting(client, blogId, marker);
  const saved = existing
    ? await client.updatePost(blogId, existing.id, built)
    : await client.insertPost(blogId, built);

  const checked = await client.getPost(blogId, saved.id);
  if (checked.title !== built.title) {
    throw new Error(`${post.slug}: 발행된 제목이 다릅니다.`);
  }
  if (!String(checked.content).includes(marker)) {
    throw new Error(`${post.slug}: 마커가 누락됐습니다.`);
  }
  const affiliateLinks = (String(checked.content).match(/rel="sponsored nofollow noopener"/g) || []).length;
  if (affiliateLinks < 5) {
    throw new Error(`${post.slug}: 파트너스 링크가 ${affiliateLinks}개뿐입니다.`);
  }
  return { id: checked.id, url: checked.url, title: checked.title, affiliateLinks, updated: Boolean(existing) };
}

async function publish(slugs = []) {
  const paths = bloggerPaths(root);
  const client = new BloggerClient({ token: await getAccessToken(paths) });
  const blog = await client.getBlogByUrl(paths.blogUrl);
  if (new URL(blog.url).hostname !== EXPECTED_HOST) {
    throw new Error(`예상과 다른 블로그입니다: ${blog.url}`);
  }

  const selected = selectPosts(slugs);

  // 1차: 본문만 올려 URL 확보
  const firstPass = await buildAll(new Map(), slugs);
  const receipts = [];
  for (const entry of firstPass) {
    receipts.push({ slug: entry.post.slug, subId: entry.post.subId, ...(await save(client, blog.id, entry.post, entry.built)) });
  }

  // 한 편만 올렸다면 가리킬 상대가 없으므로 여기서 끝낸다.
  if (selected.length < 2) {
    await writeReceipts(blog.id, receipts);
    return receipts;
  }

  // 2차: 서로를 가리키는 내부 링크를 넣어 다시 저장
  const related = new Map();
  for (const post of selected) {
    related.set(
      post.slug,
      receipts
        .filter((receipt) => receipt.slug !== post.slug)
        .map((receipt) => ({ title: receipt.title, url: receipt.url })),
    );
  }
  const secondPass = await buildAll(related, slugs);
  const finalReceipts = [];
  for (const entry of secondPass) {
    finalReceipts.push({ slug: entry.post.slug, subId: entry.post.subId, ...(await save(client, blog.id, entry.post, entry.built)) });
  }

  await writeReceipts(blog.id, finalReceipts);
  return finalReceipts;
}

// 이미 올라간 글의 영수증은 남겨두고 이번에 올린 것만 덮어쓴다.
async function writeReceipts(blogId, receipts) {
  const file = path.join(outputDir, 'receipts.json');
  let previous = [];
  try {
    previous = JSON.parse(await fs.readFile(file, 'utf8')).posts || [];
  } catch {
    previous = [];
  }
  const merged = [...previous.filter((item) => !receipts.some((row) => row.slug === item.slug)), ...receipts];
  await fs.writeFile(
    file,
    `${JSON.stringify({ blogId, publishedAt: new Date().toISOString(), posts: merged }, null, 2)}\n`,
    'utf8',
  );
}

function parseSlugs(argv) {
  const slugs = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only' && argv[i + 1]) {
      slugs.push(argv[i + 1]);
      i += 1;
    }
  }
  return slugs;
}

async function main() {
  const slugs = parseSlugs(process.argv.slice(2));
  if (process.argv.includes('--publish')) {
    const receipts = await publish(slugs);
    for (const receipt of receipts) {
      console.log(`${receipt.updated ? '수정' : '발행'}  ${receipt.slug}  링크 ${receipt.affiliateLinks}개  ${receipt.url}`);
    }
    return;
  }
  const built = await buildAll(new Map(), slugs);
  for (const entry of built) {
    console.log(`미리보기  ${entry.post.slug}  상품 ${entry.products}개  ${path.relative(root, entry.files.previewPath)}`);
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { buildAll, publish, selectPosts, parseSlugs };
