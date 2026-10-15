const SESSION_KEY = 'clawSuccessCardShown';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 시크릿 모드나 쿠키 차단에서 sessionStorage 접근은 던진다. 그때는 카드를 띄우지 않고 게임만 돌린다.
export function markSuccessCardShown(storage) {
  if (!storage) return false;
  try {
    if (storage.getItem(SESSION_KEY)) return false;
    storage.setItem(SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export function cardHtml(entry, { placement }) {
  if (!entry || !entry.link) return '';

  const rocket = entry.rocket ? '<span class="pc-rocket">로켓배송</span>' : '';
  return [
    `<a class="pc-card" href="${escapeHtml(entry.link)}" target="_blank"`,
    ' rel="nofollow sponsored noopener" referrerpolicy="unsafe-url" data-coupang-link',
    ` data-coupang-placement="${escapeHtml(placement)}" data-coupang-product-type="mini_claw">`,
    `<img class="pc-thumb" src="${escapeHtml(entry.thumbnail)}" alt="${escapeHtml(entry.name)}" loading="lazy">`,
    `<span class="pc-name">${escapeHtml(entry.productName)}</span>`,
    `<span class="pc-price">${escapeHtml(entry.priceLabel)}</span>`,
    `<span class="pc-asof">${escapeHtml(entry.priceAsOf)} 기준</span>`,
    rocket,
    '<span class="pc-cta">쿠팡에서 보기</span>',
    '</a>',
  ].join('');
}

export function cardsHtml(items, { placement, limit = 3 }) {
  if (!Array.isArray(items)) return '';
  return items
    .filter((entry) => entry && entry.link)
    .slice(0, limit)
    .map((entry) => cardHtml(entry, { placement }))
    .join('');
}
