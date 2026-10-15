const SUB_ID_PATTERN = /[?&]subId=clawgame(&|$)/;

function formatPriceLabel(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

function hasUsablePrice(value) {
  if (value === null || value === undefined || value === '') return false;
  const price = Number(value);
  return Number.isFinite(price) && price > 0;
}

function rankOf(item) {
  const rank = Number(item.rank);
  return item.rank === null || item.rank === undefined || !Number.isFinite(rank) ? Infinity : rank;
}

function pickProduct(items, {
  minPrice = 0,
  maxPrice = Infinity,
  requireKeyword = '',
  requireAllKeywords = [],
  excludeKeywords = [],
  excludeProductIds = [],
} = {}) {
  const excludedIds = new Set([...excludeProductIds].map(String));
  const candidates = (items || []).filter((item) => {
    if (!item) return false;
    if (excludedIds.has(String(item.productId))) return false;
    if (excludeKeywords.some((term) => term && String(item.productName || '').includes(term))) return false;
    if (typeof item.productName !== 'string' || item.productName === '') return false;
    if (!hasUsablePrice(item.productPrice)) return false;
    const price = Number(item.productPrice);
    if (price < minPrice || price > maxPrice) return false;
    if (requireKeyword && !item.productName.includes(requireKeyword)) return false;
    if (Array.isArray(requireAllKeywords) && requireAllKeywords.some((term) => term && !item.productName.includes(term))) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const rankA = rankOf(a);
    const rankB = rankOf(b);
    if (rankA !== rankB) return rankA < rankB ? -1 : 1;
    return (b.isRocket ? 1 : 0) - (a.isRocket ? 1 : 0);
  });

  return candidates[0];
}

function buildManifestEntry({ char, name, product, deeplink, asOfDate }) {
  if (!asOfDate) {
    throw new Error(`${char} 항목에 가격 기준일(asOfDate)이 없습니다.`);
  }
  return {
    char,
    name,
    model: `${char}.glb`,
    thumbnail: `${char}.webp`,
    productName: product.productName,
    price: Number(product.productPrice),
    priceLabel: formatPriceLabel(product.productPrice),
    priceAsOf: asOfDate,
    rocket: Boolean(product.isRocket),
    link: deeplink,
  };
}

function buildManifest({ theme, entries, asOfDate }) {
  const items = [];
  for (const entry of entries || []) {
    if (!entry || !entry.link) continue;
    if (!SUB_ID_PATTERN.test(entry.link)) {
      throw new Error(`${entry.char} 링크에 subId=clawgame 이 없습니다.`);
    }
    if (!entry.priceAsOf) {
      throw new Error(`${entry.char} 항목에 가격 기준일(priceAsOf)이 없습니다.`);
    }
    items.push(entry);
  }
  return { theme, asOfDate, items };
}

module.exports = { buildManifest, buildManifestEntry, formatPriceLabel, pickProduct };
