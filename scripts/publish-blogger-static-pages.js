// Blogger 정적 페이지(소개 / 개인정보처리방침)를 만들거나 갱신한다.
//
//   node scripts/publish-blogger-static-pages.js            # 미리보기 생성
//   node scripts/publish-blogger-static-pages.js --publish  # Blogger 반영
//
// 같은 마커가 있는 페이지가 이미 있으면 새로 만들지 않고 수정한다.
const fs = require('node:fs/promises');
const path = require('node:path');

const { BloggerClient } = require('./blogger-api');
const { getAccessToken } = require('./blogger-oauth');
const { bloggerPaths } = require('./blogger-paths');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, '.blogger-artifacts', 'pages');
const EXPECTED_HOST = 'goldpick-choice.blogspot.com';
const BLOG_URL = 'https://goldpick-choice.blogspot.com';
const CONTACT = 'idont82@gmail.com';
const EFFECTIVE_DATE = '2026년 10월 29일';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function labelUrl(label) {
  return `${BLOG_URL}/search/label/${encodeURIComponent(label)}`;
}

const h2 = (text) => `<h2 style="font-size:22px;line-height:1.45;margin:34px 0 12px;color:#10243f">${escapeHtml(text)}</h2>`;
const p = (text) => `<p style="margin:14px 0">${escapeHtml(text)}</p>`;
const ul = (items) => `<ul style="padding-left:22px;margin:14px 0">${items.map((i) => `<li style="margin:9px 0">${i}</li>`).join('')}</ul>`;
const link = (label, url) => `<a href="${escapeHtml(url)}" style="color:#174bb8">${escapeHtml(label)}</a>`;

const LABELS = ['겨울', '생활가전', '건강식품', '생활용품', '패션·잡화', '노트북', '후기 분석', '홈쇼핑 체크'];

function wrap(marker, body) {
  return `${marker}<div style="max-width:760px;margin:0 auto;font-family:Arial,'Malgun Gothic',sans-serif;color:#182538;font-size:16px;line-height:1.85;overflow-wrap:anywhere">${body}</div>`;
}

function aboutPage() {
  const marker = '<!-- goldpick-page-about -->';
  const body = [
    p('Gold Pick은 사기 전에 궁금한 차이를 정리하는 블로그입니다. 제품 수가 많아 비교가 어려운 품목을 골라, 무엇을 기준으로 봐야 하는지 정리합니다.'),

    h2('어떻게 정리하나요'),
    p('공개된 상품 후기와 커뮤니티 글에서 같은 이야기가 반복되는 지점을 찾습니다. 그 불만을 뒤집으면 상세 페이지에서 확인할 항목이 되고, 그것이 선택 기준이 됩니다.'),
    p('상품 정보는 쿠팡 파트너스 상품 검색 API에서 가져오고, 제조사 안내와 공개된 해외 매체 자료를 함께 참고합니다. 글마다 참고한 자료의 링크를 답니다.'),

    h2('하지 않는 것'),
    ul([
      '제품을 직접 구매해 사용 시험을 하지 않습니다.',
      '성능을 측정하거나 순위를 매기지 않습니다.',
      '효과나 최저가를 보장하지 않습니다.',
    ]),
    p('글에 적힌 설명은 판매명에 표시된 정보와 공개 자료를 정리한 것입니다. 최종 판단은 판매 페이지의 상세 사양으로 하시기 바랍니다.'),

    h2('가격 표기 기준'),
    p('가격은 글에 적힌 조회일 기준입니다. 쿠팡의 가격, 재고, 옵션은 수시로 바뀌므로 구매 전 판매 페이지에서 다시 확인하세요.'),

    h2('주제별로 보기'),
    `<p style="margin:14px 0">${LABELS.map((label) => link(label, labelUrl(label))).join(' · ')}</p>`,

    h2('제휴 안내'),
    p('이 블로그는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 수수료는 독자가 지불하는 가격에 영향을 주지 않습니다.'),
    p(`개인정보 처리에 관한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.`),

    h2('문의'),
    `<p style="margin:14px 0">${escapeHtml(CONTACT)}</p>`,
  ].join('\n');
  return { title: '블로그 소개', content: wrap(marker, body), marker };
}

function privacyPage() {
  const marker = '<!-- goldpick-page-privacy -->';
  const body = [
    p('Gold Pick(이하 "이 블로그")은 방문자의 개인정보를 소중히 다룹니다. 이 블로그가 어떤 정보를 다루는지 아래와 같이 안내합니다.'),

    h2('수집하는 정보'),
    p('이 블로그는 방문자에게 직접 개인정보를 요구하거나 수집하지 않습니다. 회원 가입 절차가 없고 별도의 입력 양식도 두지 않습니다.'),
    p('다만 이 블로그는 Google이 운영하는 Blogger 플랫폼 위에서 제공되므로, Google이 접속 기록, 브라우저 정보, 쿠키 등을 수집할 수 있습니다. 해당 정보의 처리는 Google의 개인정보처리방침을 따릅니다.'),

    h2('쿠키와 Google 서비스'),
    p('Google은 쿠키를 사용해 이 블로그의 방문 통계를 집계하고 광고를 제공할 수 있습니다. 쿠키는 브라우저 설정에서 차단하거나 삭제할 수 있으며, Google 광고 설정에서 맞춤 광고를 끌 수 있습니다.'),
    ul([
      link('Google 개인정보처리방침', 'https://policies.google.com/privacy'),
      link('Google 광고 설정', 'https://adssettings.google.com/'),
    ]),

    h2('제휴 링크'),
    p('글에 포함된 쿠팡 링크는 쿠팡 파트너스 제휴 링크입니다. 링크를 클릭하면 쿠팡이 방문 경로를 식별하기 위한 쿠키를 설정할 수 있습니다.'),
    p('이 블로그는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 구매자가 지불하는 금액은 제휴 링크 이용 여부와 관계없이 동일합니다.'),

    h2('댓글'),
    p('댓글을 남기면 Google 계정에 연결된 표시 이름과 프로필 이미지가 다른 방문자에게 공개됩니다. 댓글에 개인을 식별할 수 있는 정보를 남기지 않도록 주의해 주세요.'),

    h2('외부 사이트'),
    p('이 블로그는 쿠팡을 비롯한 외부 사이트로 연결되는 링크를 포함합니다. 연결된 외부 사이트의 개인정보 처리에 대해서는 책임지지 않으므로, 해당 사이트의 정책을 직접 확인하시기 바랍니다.'),

    h2('문의'),
    p('개인정보 처리에 관해 궁금한 점이 있으면 아래로 연락해 주세요.'),
    `<p style="margin:14px 0">${escapeHtml(CONTACT)}</p>`,

    `<p style="margin-top:34px;font-size:14px;color:#64748b">시행일: ${escapeHtml(EFFECTIVE_DATE)}</p>`,
  ].join('\n');
  return { title: '개인정보처리방침', content: wrap(marker, body), marker };
}

const PAGES = [
  { slug: 'about', build: aboutPage },
  { slug: 'privacy', build: privacyPage },
];

async function buildAll() {
  await fs.mkdir(outputDir, { recursive: true });
  const built = [];
  for (const entry of PAGES) {
    const page = entry.build();
    const preview = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(page.title)}</title><body style="margin:0;padding:16px;background:#fff"><h1 style="font:bold 28px/1.45 Arial,'Malgun Gothic',sans-serif;max-width:760px;margin:20px auto;color:#10243f">${escapeHtml(page.title)}</h1>${page.content}</body></html>`;
    const previewPath = path.join(outputDir, `${entry.slug}-preview.html`);
    await fs.writeFile(previewPath, preview, 'utf8');
    built.push({ ...entry, page, previewPath });
  }
  return built;
}

async function findExistingPage(client, blogId, marker) {
  const list = await client.request(`/blogs/${blogId}/pages?fetchBodies=true&maxResults=50`);
  return (list.items || []).find((item) => String(item.content).includes(marker)) || null;
}

async function publish() {
  const paths = bloggerPaths(root);
  const client = new BloggerClient({ token: await getAccessToken(paths) });
  const blog = await client.getBlogByUrl(paths.blogUrl);
  if (new URL(blog.url).hostname !== EXPECTED_HOST) {
    throw new Error(`예상과 다른 블로그입니다: ${blog.url}`);
  }

  const built = await buildAll();
  const receipts = [];
  for (const entry of built) {
    const { title, content, marker } = entry.page;
    const existing = await findExistingPage(client, blog.id, marker);
    const saved = existing
      ? await client.request(`/blogs/${blog.id}/pages/${existing.id}`, { method: 'PUT', body: { title, content } })
      : await client.request(`/blogs/${blog.id}/pages`, { method: 'POST', body: { title, content } });

    const checked = await client.request(`/blogs/${blog.id}/pages/${saved.id}`);
    if (checked.title !== title || !String(checked.content).includes(marker)) {
      throw new Error(`${entry.slug}: 발행 결과 검증 실패`);
    }
    receipts.push({ slug: entry.slug, id: checked.id, title: checked.title, url: checked.url, updated: Boolean(existing) });
  }

  await fs.writeFile(
    path.join(outputDir, 'receipts.json'),
    `${JSON.stringify({ blogId: blog.id, publishedAt: new Date().toISOString(), pages: receipts }, null, 2)}\n`,
    'utf8',
  );
  return receipts;
}

async function main() {
  if (process.argv.includes('--publish')) {
    for (const receipt of await publish()) {
      console.log(`${receipt.updated ? '수정' : '생성'}  ${receipt.title}  ${receipt.url}`);
    }
    return;
  }
  for (const entry of await buildAll()) {
    console.log(`미리보기  ${entry.page.title}  ${path.relative(root, entry.previewPath)}`);
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { buildAll, publish, aboutPage, privacyPage };
