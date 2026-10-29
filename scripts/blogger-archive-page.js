// 전체 글 목록 페이지를 만든다.
//
// Blogger 기본 robots.txt 는 `/search` 를 막는다. 라벨 보관함(`/search/label/...`)이
// 전부 크롤링 차단이라, 홈 첫 화면에서 밀려난 글은 크롤러가 닿을 경로가 없다.
// `/p/` 페이지는 차단되지 않으므로, 모든 글을 한 번씩 거는 이 페이지가
// 과거 글로 가는 유일한 크롤링 통로가 된다.
const ARCHIVE_MARKER = '<!-- goldpick-page-archive -->';
const ARCHIVE_TITLE = '전체 글 목록';
const UNLABELED = '기타';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function publishedDate(post) {
  return String(post.published || '').slice(0, 10);
}

// 글마다 라벨 하나만 고른다. 같은 글을 여러 묶음에 거는 편이 링크는 늘지만,
// 중복 링크는 크롤러에 새 경로를 주지 않으면서 페이지만 길어진다.
// 고르는 기준은 블로그 전체에서 가장 적게 쓰인 라벨이다. '구매 가이드'처럼 거의
// 모든 글에 붙은 라벨을 쓰면 묶음 하나에 전부 들어가 목록이 제 구실을 못 한다.
function narrowestLabel(labels, frequency) {
  if (!labels || labels.length === 0) {
    return UNLABELED;
  }
  return labels.reduce((best, label) => (
    (frequency.get(label) || 0) < (frequency.get(best) || 0) ? label : best
  ), labels[0]);
}

function groupByLabel(posts) {
  const frequency = new Map();
  for (const post of posts) {
    for (const label of post.labels || []) {
      frequency.set(label, (frequency.get(label) || 0) + 1);
    }
  }

  const groups = new Map();
  for (const post of posts) {
    const label = narrowestLabel(post.labels, frequency);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(post);
  }

  const ordered = [...groups.entries()]
    .map(([label, items]) => ({
      label,
      posts: [...items].sort((a, b) => publishedDate(b).localeCompare(publishedDate(a))),
    }))
    .sort((a, b) => {
      if (a.label === UNLABELED) return 1;
      if (b.label === UNLABELED) return -1;
      return b.posts.length - a.posts.length || a.label.localeCompare(b.label, 'ko');
    });

  return ordered;
}

function renderGroup(group) {
  const items = group.posts.map((post) => (
    `<li style="margin:10px 0"><a href="${escapeHtml(post.url)}" style="color:#174bb8">${escapeHtml(post.title)}</a>`
    + `<span style="color:#64748b;font-size:14px"> · ${escapeHtml(publishedDate(post))}</span></li>`
  )).join('');
  return `<h2 style="font-size:20px;line-height:1.45;margin:30px 0 10px;color:#10243f">${escapeHtml(group.label)}`
    + `<span style="font-size:14px;font-weight:normal;color:#64748b"> (${group.posts.length})</span></h2>`
    + `<ul style="padding-left:22px;margin:10px 0;list-style:disc">${items}</ul>`;
}

function buildArchivePage(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('목록에 넣을 글이 없습니다.');
  }

  const groups = groupByLabel(posts);
  const body = [
    `<p style="margin:14px 0">지금까지 올린 글 ${posts.length}개를 주제별로 모았습니다. 찾는 품목이 있으면 아래에서 바로 열어보세요.</p>`,
    ...groups.map(renderGroup),
  ].join('\n');

  const content = `${ARCHIVE_MARKER}<div style="max-width:760px;margin:0 auto;font-family:Arial,'Malgun Gothic',sans-serif;color:#182538;font-size:16px;line-height:1.85;overflow-wrap:anywhere">${body}</div>`;
  return { title: ARCHIVE_TITLE, content, marker: ARCHIVE_MARKER };
}

module.exports = { buildArchivePage, groupByLabel, escapeHtml, ARCHIVE_MARKER, ARCHIVE_TITLE };
