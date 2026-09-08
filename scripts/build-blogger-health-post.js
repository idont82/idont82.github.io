const path = require('node:path');

const REQUIRED_DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const PROHIBITED_CLAIMS = /먹어봤|복용해봤|직접\s*(?:먹|복용|사용)|치료|완치|효과를\s*보장/;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assertHttpsUrl(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
}

function markerFor(productId) {
  const safeId = String(productId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!safeId) {
    throw new Error('productId must contain letters or numbers.');
  }
  return `<!-- goldpick-product:${safeId} -->`;
}

function textLength(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, 'x')
    .replace(/\s+/g, '')
    .length;
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
}

function requireStringArray(value, label, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} must contain at least ${minimum} text item(s).`);
  }
}

function validateCampaign(campaign) {
  if (!campaign || typeof campaign !== 'object') {
    throw new Error('Campaign data is required.');
  }

  for (const key of ['slug', 'productId', 'title']) {
    requireString(campaign[key], key);
  }
  if (!/^[a-z0-9-]+$/.test(campaign.slug)) {
    throw new Error('slug must contain lowercase letters, numbers, and hyphens only.');
  }
  if (!campaign.product || typeof campaign.product !== 'object') {
    throw new Error('product is required.');
  }
  for (const key of ['name', 'price', 'affiliateUrl', 'imageSourceUrl']) {
    requireString(campaign.product[key], `product.${key}`);
  }
  assertHttpsUrl(campaign.product.affiliateUrl, 'product.affiliateUrl');
  assertHttpsUrl(campaign.product.imageSourceUrl, 'product.imageSourceUrl');
  requireStringArray(campaign.officialFacts, 'officialFacts', 2);
  if (!campaign.reviewPatterns || typeof campaign.reviewPatterns !== 'object') {
    throw new Error('reviewPatterns is required.');
  }
  requireStringArray(campaign.reviewPatterns.positive, 'reviewPatterns.positive');
  requireStringArray(campaign.reviewPatterns.caution, 'reviewPatterns.caution');
  requireStringArray(campaign.cautions, 'cautions');
  requireStringArray(campaign.editorialParagraphs, 'editorialParagraphs', 5);
  requireStringArray(campaign.imageFiles, 'imageFiles', 3);
  if (campaign.imageFiles.length !== 3 || new Set(campaign.imageFiles).size !== 3) {
    throw new Error('Campaign must contain exactly three distinct images.');
  }
  for (const file of campaign.imageFiles) {
    if (path.basename(file) !== file || !/^[a-z0-9-]+\.png$/.test(file)) {
      throw new Error('Image filenames must be safe lowercase PNG names.');
    }
  }
  if (campaign.disclosure !== REQUIRED_DISCLOSURE) {
    throw new Error('The exact Coupang Partners disclosure is required.');
  }

  const prose = [
    campaign.title,
    campaign.product.name,
    ...campaign.officialFacts,
    ...campaign.reviewPatterns.positive,
    ...campaign.reviewPatterns.caution,
    ...campaign.cautions,
    ...campaign.editorialParagraphs,
  ].join(' ');
  if (PROHIBITED_CLAIMS.test(prose)) {
    throw new Error('Campaign contains a prohibited claim.');
  }

  markerFor(campaign.productId);
  return campaign;
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function figure(imageBaseUrl, filename, caption) {
  const src = `${imageBaseUrl.replace(/\/$/, '')}/${filename}`;
  assertHttpsUrl(src, 'Image URL');
  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

function paragraphs(items) {
  return items.map((item) => `<p>${escapeHtml(item)}</p>`).join('');
}

function buildPost(campaign, imageBaseUrl) {
  validateCampaign(campaign);
  assertHttpsUrl(imageBaseUrl, 'imageBaseUrl');

  const [productImage, factsImage, checklistImage] = campaign.imageFiles;
  const content = [
    markerFor(campaign.productId),
    figure(imageBaseUrl, productImage, `${campaign.product.name} 제품 정보`),
    '<h2>후기 수보다 먼저 볼 것</h2>',
    paragraphs(campaign.editorialParagraphs.slice(0, 2)),
    figure(imageBaseUrl, factsImage, '공식 표시사항 확인 기준'),
    '<h2>라벨과 구성을 비교하는 방법</h2>',
    list(campaign.officialFacts),
    paragraphs(campaign.editorialParagraphs.slice(2, 5)),
    figure(imageBaseUrl, checklistImage, '후기 패턴과 구매 전 확인사항'),
    '<h2>후기는 이렇게 참고하세요</h2>',
    '<h3>자주 언급되는 장점</h3>',
    list(campaign.reviewPatterns.positive),
    '<h3>개인차를 확인할 부분</h3>',
    list(campaign.reviewPatterns.caution),
    paragraphs(campaign.editorialParagraphs.slice(5)),
    '<h2>구매 전 마지막 확인</h2>',
    list(campaign.cautions),
    `<p><strong>${escapeHtml(campaign.product.name)}</strong> · 작성 시점 표시 가격 ${escapeHtml(campaign.product.price)}</p>`,
    '<p>가격은 판매 시점에 따라 달라질 수 있습니다. 결제 화면에서 상품명, 구성, 최종 가격을 다시 확인하세요.</p>',
    `<p><a href="${escapeHtml(campaign.product.affiliateUrl)}" rel="nofollow sponsored" target="_blank">현재 상품 구성과 가격 확인하기</a></p>`,
    `<p>${escapeHtml(campaign.disclosure)}</p>`,
  ].join('');

  const length = textLength(content);
  if (length < 1500 || length > 2000) {
    throw new Error(`Article text must be 1,500–2,000 characters; received ${length}.`);
  }

  return {
    title: escapeHtml(campaign.title),
    content,
  };
}

module.exports = {
  REQUIRED_DISCLOSURE,
  buildPost,
  markerFor,
  textLength,
  validateCampaign,
};
