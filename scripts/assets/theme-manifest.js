function formatPriceLabel(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

function pickProduct(items, { minPrice = 0, maxPrice = Infinity, requireKeyword = '' } = {}) {
  const candidates = (items || []).filter((item) => {
    const price = Number(item.productPrice);
    if (!Number.isFinite(price) || price < minPrice || price > maxPrice) return false;
    if (requireKeyword && !String(item.productName || '').includes(requireKeyword)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (b.isRocket ? 1 : 0) - (a.isRocket ? 1 : 0);
  });

  return candidates[0];
}

function buildManifestEntry({ char, name, product, deeplink, asOfDate }) {
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
  return {
    theme,
    asOfDate,
    items: (entries || []).filter((entry) => entry && entry.link),
  };
}

module.exports = { buildManifest, buildManifestEntry, formatPriceLabel, pickProduct };
