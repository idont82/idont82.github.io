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

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return decodeHtml(match?.[2] || '').trim();
}

function extractProductImages(articleBody, fallbackImage = '') {
  const images = [];
  const affiliateLinks = articleBody.match(/<a\b[^>]*data-coupang-link[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (const link of affiliateLinks) {
    const imageTag = link.match(/<img\b[^>]*>/i)?.[0] || '';
    const imageUrl = extractAttribute(imageTag, 'data-src') || extractAttribute(imageTag, 'src');
    if (imageUrl && !images.includes(imageUrl)) {
      images.push(imageUrl);
    }
  }
  if (!images.length && fallbackImage) {
    images.push(fallbackImage);
  }
  return images;
}

function selectThreeImageCandidates(imageUrls) {
  if (!Array.isArray(imageUrls) || !imageUrls.length) {
    throw new Error('Article lacks a product image for Facebook cards');
  }
  return Array.from({ length: 3 }, (_, index) => {
    const primaryIndex = index % imageUrls.length;
    return [
      imageUrls[primaryIndex],
      ...imageUrls.filter((_, candidateIndex) => candidateIndex !== primaryIndex),
    ];
  });
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
  const productImages = extractProductImages(articleBody, imageUrl);

  if (!title || !description || headings.length < 3) {
    throw new Error('Article lacks title, description, or three card points');
  }
  return {
    title,
    description,
    summary,
    imageUrl,
    productImages,
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

function buildShortUrl(shortLinkId) {
  if (!Number.isSafeInteger(shortLinkId) || shortLinkId < 1) {
    throw new Error('Facebook short link id must be a positive integer');
  }
  return `${SITE}/g/?n=${shortLinkId}`;
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
  if (!Array.isArray(queueItem.cardCopy) || queueItem.cardCopy.length !== 3) {
    throw new Error('Facebook cardCopy must contain exactly three phrases');
  }
  const destinationLink = queueItem.linkMode === 'blog'
    ? buildTrackedBlogUrl(queueItem.article, queueItem.id)
    : buildDirectUrl(article.coupangUrl, queueItem.id);
  const link = buildShortUrl(queueItem.shortLinkId);
  const overrideImages = queueItem.cardImageUrls || [];
  const imageCandidates = overrideImages.length
    ? overrideImages.map((imageUrl, index) => [
      imageUrl,
      ...overrideImages.filter((_, candidateIndex) => candidateIndex !== index),
      ...article.productImages.filter((candidate) => !overrideImages.includes(candidate)),
    ])
    : selectThreeImageCandidates(article.productImages);
  const slides = queueItem.cardCopy.map((title, index) => ({
    label: 'GOLD PICK',
    title,
    imageUrl: imageCandidates[index][0],
    imageUrls: imageCandidates[index],
  }));
  const caption = queueItem.linkMode === 'blog'
    ? `${link}\n\n${queueItem.cardCopy[0]}\n${queueItem.cardCopy[1]}\n\n${DISCLOSURE}`
    : `${queueItem.cardCopy[0]}\n${queueItem.cardCopy[1]}\n\n${link}\n\n${DISCLOSURE}`;
  return {
    id: queueItem.id,
    link,
    destinationLink,
    duplicateMarker: link,
    trackingId: queueItem.linkMode === 'blog' ? queueItem.id : buildSubid(queueItem.id),
    caption,
    slides,
  };
}

module.exports = {
  DISCLOSURE,
  buildDirectUrl,
  buildPostContent,
  buildShortUrl,
  buildSubid,
  buildTrackedBlogUrl,
  cleanText,
  decodeHtml,
  extractArticle,
  extractProductImages,
  selectThreeImageCandidates,
};
