import { thumbnailUrl } from './plushie-model-utils.js';

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

// entry 는 매니페스트 항목 그대로다. entry.thumbnail 은 파일 이름뿐이라
// 테마를 알아야 경로가 된다. 호출자가 미리 바꿔 넣는 대신 여기서 푼다.
export function cardHtml(entry, { placement, theme }) {
  if (!entry || !entry.link) return '';

  const rocket = entry.rocket ? '<span class="pc-rocket">로켓배송</span>' : '';
  // 테마가 없으면 깨진 이미지를 그리는 대신 썸네일만 뺀다. 링크와 가격은 남는다.
  const src = theme && entry.thumbnail ? thumbnailUrl(theme, entry) : '';
  const thumb = src
    ? `<img class="pc-thumb" src="${escapeHtml(src)}" alt="${escapeHtml(entry.name)}" loading="lazy">`
    : '';

  return [
    `<a class="pc-card" href="${escapeHtml(entry.link)}" target="_blank"`,
    ' rel="nofollow sponsored noopener" referrerpolicy="unsafe-url" data-coupang-link',
    ` data-coupang-placement="${escapeHtml(placement)}" data-coupang-product-type="mini_claw">`,
    thumb,
    `<span class="pc-name">${escapeHtml(entry.productName)}</span>`,
    `<span class="pc-price">${escapeHtml(entry.priceLabel)}</span>`,
    `<span class="pc-asof">${escapeHtml(entry.priceAsOf)} 기준</span>`,
    rocket,
    '<span class="pc-cta">쿠팡에서 보기</span>',
    '</a>',
  ].join('');
}

export function cardsHtml(items, { placement, theme, limit = 3 }) {
  if (!Array.isArray(items)) return '';
  return items
    .filter((entry) => entry && entry.link)
    .slice(0, limit)
    .map((entry) => cardHtml(entry, { placement, theme }))
    .join('');
}
