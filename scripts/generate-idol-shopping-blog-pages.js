const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const data = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'idol-shopping-blog-pages.json'), 'utf8'),
);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function price(value) {
  return `${Number(value).toLocaleString('ko-KR')}원`;
}

function jsonLd(page) {
  const hero = page.products[0].image;
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: page.title,
      description: page.description,
      image: hero,
      thumbnailUrl: hero,
      datePublished: data.verifiedDate,
      dateModified: data.verifiedDate,
      inLanguage: 'ko-KR',
      mainEntityOfPage: `${site}/blog/${page.slug}.html`,
      author: {
        '@type': 'Person',
        name: '골드픽',
      },
      publisher: {
        '@type': 'Organization',
        name: '골드픽',
      },
    },
    null,
    2,
  );
}

function comparisonCards(page) {
  return page.comparison
    .map(
      (item) => `
              <section class="article-choice-card">
                <span class="product-detail-badge">${escapeHtml(item.tag)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
              </section>`,
    )
    .join('');
}

function productRows(page) {
  return page.products
    .map(
      (product) => `
                <tr>
                  <td>${product.rank}위</td>
                  <td>${escapeHtml(product.name)}</td>
                  <td>${escapeHtml(product.status)}</td>
                  <td>${price(product.price)}</td>
                </tr>`,
    )
    .join('');
}

function productCards(page) {
  return page.products
    .map(
      (product) => `
              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${escapeHtml(page.productType)}">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} 상품 이미지" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">팬 추천 포인트 · 검색 결과 ${product.rank}위 · ${escapeHtml(product.status)}</span>
                  <h3>${escapeHtml(product.name)}</h3>
                  <div class="product-detail-price">확인 시점 가격 <strong>${price(product.price)}</strong></div>
                  <p class="product-detail-desc">${escapeHtml(product.reason)}</p>
                  <a class="product-detail-btn" href="${escapeHtml(product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${escapeHtml(page.productType)}">현재 상품 정보 확인</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`,
    )
    .join('');
}

function faqItems(page) {
  return page.faq
    .map(
      (item) => `
              <details>
                <summary>${escapeHtml(item.q)}</summary>
                <p>${escapeHtml(item.a)}</p>
              </details>`,
    )
    .join('');
}

function sourceItems(page) {
  return page.sources
    .map(
      (source) => `
              <li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`,
    )
    .join('');
}

function relatedItems(page) {
  return page.related
    .map(
      (item) => `
              <a href="${escapeHtml(item.url)}">${escapeHtml(item.label)} <span>관련 글</span></a>`,
    )
    .join('');
}

function pageHtml(page) {
  const canonical = `${site}/blog/${page.slug}.html`;
  const hero = page.products[0].image;
  return `<!doctype html>
<html lang="ko">
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-MRKNJH9Z');</script>
  <!-- End Google Tag Manager -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-9914349640032484">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9914349640032484" crossorigin="anonymous"></script>
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(hero)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.shortTitle)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(hero)}">
  <meta name="thumbnail" content="${escapeHtml(hero)}">
  <link rel="image_src" href="${escapeHtml(hero)}">
  <link rel="icon" href="/images/favicon.png">
  <link rel="stylesheet" href="/blog/assets/style.css">
  <script defer src="/blog/assets/blog.js"></script>
  <style>
    .idol-product-table-wrap { width: 100%; max-width: 100%; overflow-x: visible; margin: 18px 0 28px; border: 1px solid #e5e7eb; border-radius: 16px; }
    .idol-product-table { width: 100%; max-width: 100%; table-layout: fixed; border-collapse: collapse; background: #fff; }
    .idol-product-table th, .idol-product-table td { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: keep-all; }
    .idol-product-table th { background: #fff7e6; color: #7c4700; font-size: 14px; }
    .idol-product-table th:nth-child(1), .idol-product-table td:nth-child(1) { width: 12%; }
    .idol-product-table th:nth-child(2), .idol-product-table td:nth-child(2) { width: 42%; }
    .idol-product-table th:nth-child(3), .idol-product-table td:nth-child(3) { width: 26%; }
    .idol-product-table th:nth-child(4), .idol-product-table td:nth-child(4) { width: 20%; }
    .idol-product-table tr:last-child td { border-bottom: 0; }
    .idol-source-note { padding: 18px; border-radius: 16px; background: #f8fafc; color: #475569; }
    @media (max-width: 720px) {
      .idol-product-table th, .idol-product-table td { padding: 10px 6px; font-size: 12px; line-height: 1.5; }
      .idol-product-table th { font-size: 11px; }
      .idol-product-table th:nth-child(1), .idol-product-table td:nth-child(1) { width: 13%; }
      .idol-product-table th:nth-child(2), .idol-product-table td:nth-child(2) { width: 39%; }
      .idol-product-table th:nth-child(3), .idol-product-table td:nth-child(3) { width: 27%; }
      .idol-product-table th:nth-child(4), .idol-product-table td:nth-child(4) { width: 21%; }
    }
  </style>
  <script type="application/ld+json">
${jsonLd(page)}
  </script>
</head>
<body class="blog-article-page">
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRKNJH9Z" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  <div class="blog-shell">
    <header class="blog-header">
      <div class="blog-mobile-bar">
        <button type="button" class="blog-mobile-back" data-blog-back aria-label="뒤로 가기">‹</button>
        <a class="blog-mobile-brand" href="/">골드픽</a>
        <div class="blog-mobile-title">${escapeHtml(page.shortTitle)}</div>
        <div class="blog-mobile-actions">
          <button type="button" class="blog-mobile-icon" data-share-page aria-label="이 페이지 공유">↗</button>
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="blogMobileDrawer${escapeHtml(page.slug)}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="blogMobileDrawer${escapeHtml(page.slug)}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/" data-blog-path="/">홈</a>
          <a href="#compare">유형 비교</a>
          <a href="#check">구매 체크</a>
          <a href="#products">상품 참고</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">${escapeHtml(page.kicker)}</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.intro)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="#compare">유형 비교</a>
        <a href="#check">구매 체크</a>
        <a href="#products">상품 참고</a>
      </nav>
    </header>

    <div class="mobile-top-ad" data-mobile-top-ad aria-label="모바일 상단 쿠팡 광고">
      <div class="article-ad article-ad-frame-block">
        <p class="article-ad-label">광고</p>
        <iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
      </div>
    </div>

    <main class="blog-layout">
      <aside class="blog-sidebar blog-sidebar-left">
        <div class="blog-stack">
          <section class="blog-panel blog-profile">
            <img class="blog-avatar" src="${escapeHtml(hero)}" alt="${escapeHtml(page.group)} 굿즈 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>${escapeHtml(page.group)}를 좋아하는 팬의 시선으로 설레는 점과 꼭 확인할 점을 함께 나눕니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#answer">먼저 결론 <span>구매 방향</span></a>
              <a href="#compare">유형 비교 <span>용도 구분</span></a>
              <a href="#check">구매 기준 <span>3가지</span></a>
              <a href="#products">상품 참고 <span>확인일 공개</span></a>
              <a href="#faq">FAQ <span>자주 묻는 질문</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta">
            <span>${data.verifiedDate}</span>
            <span>카테고리 · 아이돌 굿즈</span>
          </div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">팬 추천 포인트</span>
            ${escapeHtml(page.summary)}
          </div>

          <figure class="article-hero">
            <img src="${escapeHtml(hero)}" alt="${escapeHtml(page.shortTitle)} 구매 가이드 대표 이미지" width="657" height="657">
            <figcaption>상품 이미지는 ${data.verifiedDateKo} 쿠팡 파트너스 API 검색 결과에서 확인한 참고 이미지입니다. 판매 페이지의 현재 구성이 최종 기준입니다.</figcaption>
          </figure>

          <div class="article-body">
            <p class="article-lead" id="answer">${escapeHtml(page.lead)}</p>

            <div class="idol-source-note">
              <strong>선정 기준</strong><br>
              이 글은 최근 아이돌 검색 관심도 후보와 쿠팡 상품 검색 결과의 관련성을 함께 살펴 만든 구매 가이드입니다. 네이버가 전체 실시간 인기검색어 순위를 제공하지 않으므로 확인할 수 없는 검색 순위를 주장하지 않습니다.
            </div>

            <h2 id="compare">1. 먼저 상품 유형을 나눠 봅니다</h2>
            <p><strong>공식·라이선스·범용</strong> 상품은 같은 검색 결과에 함께 나올 수 있지만 확인 방법과 구매 목적이 다릅니다. 공식 판매처 상품은 판매 채널과 구성 공지를, 라이선스 상품은 제조·유통 및 권리 표기를, 범용 용품은 규격과 재질을 중심으로 보세요.</p>
            <div class="article-choice-grid">${comparisonCards(page)}
            </div>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              <iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="check">2. 구매 전에 확인할 기준 3가지</h2>
            <ol>
              ${page.checks.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ol>
            <div class="article-callout">
              <strong>공식성 주의</strong>
              <p>${escapeHtml(page.caution)}</p>
            </div>

            <h2 id="products">3. ${escapeHtml(page.keyword)} 쿠팡 검색 상품 비교</h2>
            <p>${data.verifiedDateKo} 쿠팡 파트너스 API에서 <strong>“${escapeHtml(page.keyword)}” 관련 검색어</strong>로 확인한 결과 중 글의 구매 의도에 맞는 상품을 골랐습니다. 아래 순위는 판매량 순위가 아니라 <strong>확인 당시 검색 결과 순서</strong>입니다. 가격과 재고, 구성은 달라질 수 있으므로 구매 전 상세 페이지를 다시 확인하세요.</p>

            <div class="idol-product-table-wrap">
              <table class="idol-product-table">
                <thead>
                  <tr>
                    <th>검색 순서</th>
                    <th>상품</th>
                    <th>구분</th>
                    <th>확인 가격</th>
                  </tr>
                </thead>
                <tbody>${productRows(page)}
                </tbody>
              </table>
            </div>

            <div class="article-product-detail-list">${productCards(page)}
            </div>

            <h2>4. 공식 정보와 판매 페이지를 함께 보는 순서</h2>
            <p>먼저 아티스트 공식 사이트나 공식 스토어에서 발매명과 기본 구성을 확인한 뒤, 쿠팡 판매 페이지에서 판매자, 배송, 추가 사은품과 교환 조건을 비교하세요. 상품명이 비슷해도 개봉 여부와 구성품 누락 조건이 다를 수 있습니다.</p>
            <ul class="article-source-list">${sourceItems(page)}
            </ul>

            <section class="faq-list" id="faq" aria-label="${escapeHtml(page.shortTitle)} FAQ">
              <h2>자주 묻는 질문</h2>${faqItems(page)}
            </section>
          </div>
        </article>
      </section>

      <aside class="blog-sidebar blog-sidebar-right">
        <div class="blog-stack blog-stack-sticky">
          <section class="blog-panel">
            <h2>추천 배너</h2>
            <iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
            <p class="blog-ad-disclosure">${disclosure}</p>
          </section>
          <section class="blog-panel">
            <h2>관련 글</h2>
            <div class="blog-link-list">${relatedItems(page)}
            </div>
          </section>
          <section class="blog-panel">
            <h2>구매 전 마지막 확인</h2>
            <p>판매자, 구성품, 옵션, 배송일, 교환 조건을 주문 화면에서 다시 확인하세요.</p>
            <p class="blog-ad-disclosure">${disclosure}</p>
          </section>
        </div>
      </aside>
    </main>
  </div>
</body>
</html>
`;
}

for (const page of data.pages) {
  const output = path.join(root, 'blog', `${page.slug}.html`);
  fs.writeFileSync(output, pageHtml(page), 'utf8');
  console.log(path.relative(root, output));
}
