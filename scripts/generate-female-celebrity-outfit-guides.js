const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const data = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'female-celebrity-outfit-guides.json'), 'utf8'),
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

function validatePage(page) {
  const required = ['slug', 'celebrity', 'brand', 'productName', 'model', 'productType', 'title'];
  for (const field of required) {
    if (!page[field]) {
      throw new Error(`${page.slug || 'unknown page'}: missing ${field}`);
    }
  }
  if (!Array.isArray(page.sources) || page.sources.length < 2) {
    throw new Error(`${page.slug}: at least two sources are required`);
  }
  if (!page.product?.name || !page.product?.url || !page.product?.image) {
    throw new Error(`${page.slug}: incomplete Coupang product`);
  }
  if (!page.product.name.includes(page.model)) {
    throw new Error(`${page.slug}: Coupang product does not contain model ${page.model}`);
  }
}

function jsonLd(page) {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: page.title,
      description: page.description,
      image: page.product.image,
      thumbnailUrl: page.product.image,
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

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n                ');
}

function fanPointCards(page) {
  return page.fanPoints
    .map(
      (item) => `
              <section class="article-choice-card">
                <span class="product-detail-badge">팬 추천 포인트</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
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
  const hero = page.product.image;
  const heroImage = `<img src="${escapeHtml(hero)}" alt="${escapeHtml(page.brand)} ${escapeHtml(page.productName)} ${escapeHtml(page.model)} 상품 이미지" width="657" height="657">`;
  const heroMarkup = page.slug === 'wonyoung-eider-sheer-jacket-guide'
    ? `<a href="${escapeHtml(page.product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="article_hero" data-coupang-product-type="${escapeHtml(page.productType)}">${heroImage}</a>`
    : heroImage;
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
    .outfit-verification-note { margin: 18px 0 26px; padding: 18px; border: 1px solid #dbeafe; border-radius: 16px; background: #eff6ff; color: #334155; }
    .outfit-identity-wrap { width: 100%; max-width: 100%; margin: 18px 0 28px; border: 1px solid #e5e7eb; border-radius: 16px; }
    .outfit-identity-table { width: 100%; max-width: 100%; table-layout: fixed; border-collapse: collapse; background: #fff; }
    .outfit-identity-table th, .outfit-identity-table td { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: keep-all; }
    .outfit-identity-table th { width: 29%; background: #fff7e6; color: #7c4700; }
    .outfit-identity-table tr:last-child th, .outfit-identity-table tr:last-child td { border-bottom: 0; }
    .outfit-price-warning { margin: 20px 0; padding: 18px; border-left: 4px solid #ef4444; border-radius: 12px; background: #fff7f7; color: #475569; }
    @media (max-width: 720px) {
      .outfit-identity-table th, .outfit-identity-table td { padding: 10px 8px; font-size: 12px; line-height: 1.55; }
      .outfit-identity-table th { width: 34%; }
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
          <a href="#identity">동일 제품 확인</a>
          <a href="#fan-points">팬 추천 포인트</a>
          <a href="#product">쿠팡 상품</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">${escapeHtml(page.kicker)}</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.intro)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="#identity">동일 제품 확인</a>
        <a href="#fan-points">팬 추천 포인트</a>
        <a href="#product">쿠팡 상품</a>
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
            <img class="blog-avatar" src="${escapeHtml(hero)}" alt="${escapeHtml(page.brand)} ${escapeHtml(page.productName)} 상품 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>${escapeHtml(page.celebrity)} 팬의 시선으로 설레는 점과 정확한 품번 확인법을 함께 나눕니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#story">팬의 착장 이야기 <span>찾아본 이유</span></a>
              <a href="#identity">동일 제품 확인 <span>${escapeHtml(page.model)}</span></a>
              <a href="#features">제품 특징 <span>사이즈</span></a>
              <a href="#fan-points">팬 추천 포인트 <span>3가지</span></a>
              <a href="#product">쿠팡 상품 <span>가격 확인</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta">
            <span>${data.verifiedDate}</span>
            <span>카테고리 · 연예인 패션</span>
          </div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">동일 품번 확인</span>
            ${escapeHtml(page.summary)}
          </div>

          <figure class="article-hero">
            ${heroMarkup}
            <figcaption>상품 이미지는 ${data.verifiedDateKo} 쿠팡 파트너스 API에서 확인했습니다. 연예인 화보 사진은 복제하지 않았습니다.</figcaption>
          </figure>

          <div class="article-body">
            <h2 id="story">1. 팬이라서 같은 옷을 찾아봤습니다</h2>
            <p class="article-lead">${escapeHtml(page.story)}</p>

            <div class="outfit-verification-note">
              <strong>확인 원칙</strong><br>
              착용 출처의 제품명과 기본 품번, 쿠팡 상품명에 표시된 품번이 모두 일치하는 상품만 소개합니다. 색상별 세부 코드는 주문 화면에서 다시 확인해야 합니다.
            </div>

            <h2 id="identity">2. 동일 제품 확인표</h2>
            <div class="outfit-identity-wrap">
              <table class="outfit-identity-table">
                <tbody>
                  <tr><th>착용 연예인</th><td>${escapeHtml(page.celebrity)}</td></tr>
                  <tr><th>브랜드</th><td>${escapeHtml(page.brand)}</td></tr>
                  <tr><th>제품명</th><td>${escapeHtml(page.productName)}</td></tr>
                  <tr><th>기본 품번</th><td><strong>${escapeHtml(page.model)}</strong></td></tr>
                  <tr><th>쿠팡 상품명</th><td>${escapeHtml(page.product.name)}</td></tr>
                  <tr><th>확인 결과</th><td>착용 정보와 쿠팡 상품의 기본 품번 일치</td></tr>
                </tbody>
              </table>
            </div>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              <iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="features">3. 제품 특징과 사이즈 확인법</h2>
            <ul>
                ${listItems(page.features)}
            </ul>

            <h2 id="fan-points">4. 팬 추천 포인트</h2>
            <div class="article-choice-grid">${fanPointCards(page)}
            </div>

            <h2 id="check">5. 구매 전에 확인할 것</h2>
            <ol>
                ${listItems(page.checks)}
            </ol>
            <div class="article-callout">
              <strong>팬심과 구매 판단은 따로</strong>
              <p>${escapeHtml(page.caution)}</p>
            </div>

            <h2 id="product">6. 쿠팡 동일 품번 상품</h2>
            <p>${escapeHtml(page.priceNote)}</p>
            <p><strong>가격과 재고</strong>, 색상과 사이즈 구성은 달라질 수 있으므로 결제 화면을 최종 기준으로 확인하세요.</p>
            <div class="outfit-price-warning">
              <strong>가격 비교가 먼저입니다.</strong>
              <p>확인 가격은 ${price(page.product.price)}입니다. 공식 채널의 현재 가격, 쿠폰, 배송과 교환 조건을 함께 비교하세요.</p>
            </div>

            <section class="product-detail-card">
              <div class="product-detail-media">
                <a href="${escapeHtml(page.product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${escapeHtml(page.productType)}">
                  <img src="${escapeHtml(page.product.image)}" alt="${escapeHtml(page.brand)} ${escapeHtml(page.productName)} ${escapeHtml(page.model)} 쿠팡 상품 이미지" loading="lazy" width="420" height="420">
                </a>
              </div>
              <div class="product-detail-info">
                <span class="product-detail-badge">검색 결과 노출 순서 ${page.product.rank}번째 · ${data.verifiedDateKo}</span>
                <h3>${escapeHtml(page.product.name)}</h3>
                <div class="product-detail-price">확인 가격 <strong>${price(page.product.price)}</strong></div>
                <p class="product-detail-desc">착용 정보와 같은 기본 품번 ${escapeHtml(page.model)}가 상품명에 표시된 판매 페이지입니다. 옵션과 판매자를 다시 확인하세요.</p>
                <a class="product-detail-btn" href="${escapeHtml(page.product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${escapeHtml(page.productType)}">현재 상품 정보 확인</a>
                <p class="blog-ad-disclosure">${disclosure}</p>
              </div>
            </section>

            <h2 id="sources">7. 확인 출처</h2>
            <p>착용 정보와 제품명은 공식 브랜드 또는 신뢰할 수 있는 유통사의 상품 페이지로 교차 확인했습니다.</p>
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
            <p>품번, 색상, 사이즈, 판매자, 배송일과 교환 조건을 주문 화면에서 다시 확인하세요.</p>
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
  validatePage(page);
  const output = path.join(root, 'blog', `${page.slug}.html`);
  fs.writeFileSync(output, pageHtml(page), 'utf8');
  console.log(path.relative(root, output));
}
