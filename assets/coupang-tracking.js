(function () {
  const coupangHostPattern = /(^|\.)((link|www|ads-partners)\.)?coupang\.com$/i;

  function isCoupangUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return coupangHostPattern.test(parsed.hostname);
    } catch (error) {
      return false;
    }
  }

  function getPlacement(link) {
    if (link.dataset.coupangPlacement) return link.dataset.coupangPlacement;
    if (link.closest('.mobile-conversion-card')) return 'mobile_summary_card';
    if (link.closest('.product, .product-card, .recommend-card')) return 'product_card';
    if (link.closest('.article-ad, .ad-card, .game-ad-footer, #gameAdFooter')) return 'ad_block';
    if (link.closest('header, .site-header, .blog-header')) return 'header';
    return 'inline_link';
  }

  function getProductType(link) {
    if (link.dataset.coupangProductType) return link.dataset.coupangProductType;
    const pagePath = window.location.pathname.replace(/^\/+/, '').replace(/\.html$/, '');
    if (pagePath.startsWith('search/')) return pagePath.replace(/^search\//, '');
    if (pagePath.startsWith('recipe/')) return 'recipe';
    if (pagePath.includes('claw-machine')) return 'mini_claw';
    return 'unknown';
  }

  function trackCoupangClick(link) {
    const payload = {
      page_path: window.location.pathname,
      link_url: link.href,
      coupang_placement: getPlacement(link),
      coupang_product_type: getProductType(link),
      outbound: true
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'coupang_click', payload);
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'coupang_click',
      ...payload
    });
  }

  function enhanceSearchMobileCta() {
    if (!window.location.pathname.startsWith('/search/')) return;
    if (document.querySelector('.search-mobile-coupang-card')) return;

    const firstProduct = document.querySelector('.product');
    const header = document.querySelector('.article-header');
    if (!firstProduct || !header) return;

    const productLink = Array.from(firstProduct.querySelectorAll('a[href]')).find((link) => isCoupangUrl(link.href));
    if (!productLink) return;

    const productImage = firstProduct.querySelector('img');
    const productTitle = firstProduct.querySelector('h2')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || '추천 상품';
    const productSummary = firstProduct.querySelector('.one-liner')?.textContent?.trim() || '먼저 많이 보는 대표 상품부터 가격과 후기를 확인해보세요.';
    const productType = getProductType(productLink);

    const card = document.createElement('section');
    card.className = 'search-mobile-coupang-card';
    card.innerHTML = `
      ${productImage ? `<img src="${productImage.getAttribute('src')}" alt="${productImage.getAttribute('alt') || productTitle}" loading="lazy">` : ''}
      <div class="search-mobile-coupang-copy">
        <span class="search-mobile-coupang-eyebrow">먼저 보는 추천</span>
        <strong>${productTitle}</strong>
        <p>${productSummary}</p>
        <a href="${productLink.href}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url">현재 가격 확인하기</a>
      </div>
    `;

    const cta = card.querySelector('a');
    cta.dataset.coupangLink = 'true';
    cta.dataset.coupangPlacement = 'search_mobile_top';
    cta.dataset.coupangProductType = productType;
    header.insertAdjacentElement('afterend', card);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceSearchMobileCta);
  } else {
    enhanceSearchMobileCta();
  }

  document.addEventListener('click', function (event) {
    if (!event.target || typeof event.target.closest !== 'function') return;
    const link = event.target.closest('a[data-coupang-link], a[href]');
    if (!link || !isCoupangUrl(link.href)) return;
    trackCoupangClick(link);
  });
})();
