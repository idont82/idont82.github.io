const DISCLOSURE = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const SITE = 'https://idont82.github.io';

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function cleanText(value = '') {
  return decodeHtml(value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html, pattern) {
  return cleanText(html.match(pattern)?.[1] || '');
}

function extractArticle(html) {
  const articleBody = html.match(/<article[^>]*class="[^"]*blog-article[^"]*"[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html;
  const title = firstMatch(articleBody, /<h1[^>]*class="[^"]*blog-article-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || firstMatch(articleBody, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const description = decodeHtml(html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '').trim();
  const summary = firstMatch(articleBody, /<div[^>]*class="[^"]*article-summary-box[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    || description;
  const imageUrl = decodeHtml(html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || '').trim();
  const headings = [...articleBody.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
  const coupangUrl = decodeHtml(
    articleBody.match(/<a[^>]*data-coupang-link[^>]*href="([^"]+)"/i)?.[1]
    || articleBody.match(/<a[^>]*href="([^"]+)"[^>]*data-coupang-link/i)?.[1]
    || ''
  ).trim();

  if (!title || !description || headings.length < 3) {
    throw new Error('Article lacks title, description, or three card points');
  }
  return {
    title,
    description,
    summary,
    imageUrl,
    points: [...new Set(headings)],
    coupangUrl,
  };
}

function buildSubid(id) {
  const safe = id
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 45);
  return `fb-${safe}`;
}

function buildTrackedBlogUrl(articlePath, id) {
  const url = new URL(articlePath, SITE);
  url.searchParams.set('utm_source', 'facebook');
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'card_news');
  url.searchParams.set('utm_content', id);
  return url.toString();
}

function buildDirectUrl(coupangUrl, id) {
  if (!/^https:\/\/(?:link|www|ads-partners)\.coupang\.com\//i.test(coupangUrl)) {
    throw new Error('Direct Facebook post requires a Coupang Partners URL');
  }
  const url = new URL(coupangUrl);
  url.searchParams.set('subid', buildSubid(id));
  return url.toString();
}

function buildPostContent(queueItem, html) {
  const article = extractArticle(html);
  const link = queueItem.linkMode === 'blog'
    ? buildTrackedBlogUrl(queueItem.article, queueItem.id)
    : buildDirectUrl(article.coupangUrl, queueItem.id);
  const slides = [
    {
      label: 'GOLD PICK',
      title: article.title,
      body: article.description,
      imageUrl: article.imageUrl,
    },
    {
      label: '놓치기 쉬운 점',
      title: article.points[0],
      body: article.summary,
    },
    {
      label: '선택 기준',
      title: article.points[1],
      body: article.points.slice(2, 5).join(' · '),
    },
    {
      label: '추천 포인트',
      title: article.points[2],
      body: article.points.slice(3, 6).join(' · '),
    },
    {
      label: '자세히 보기',
      title: queueItem.linkMode === 'blog' ? '구매 가이드에서 비교하세요' : '현재 상품 정보를 확인하세요',
      body: `${link}\n\n${DISCLOSURE}`,
    },
  ];
  const caption = `${article.title}\n\n${article.description}\n\n${link}\n\n${DISCLOSURE}`;
  return {
    id: queueItem.id,
    link,
    trackingId: queueItem.linkMode === 'blog' ? queueItem.id : buildSubid(queueItem.id),
    caption,
    slides,
  };
}

module.exports = {
  DISCLOSURE,
  buildDirectUrl,
  buildPostContent,
  buildSubid,
  buildTrackedBlogUrl,
  cleanText,
  decodeHtml,
  extractArticle,
};
