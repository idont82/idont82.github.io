const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-18';
const dateText = '2026.07.18';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const pages = [
  {
    slug: 'kids-slime-safety-guide',
    dataFile: 'coupang-kids-slime.json',
    productType: 'kids_slime',
    category: 'goods baby',
    badge: '어린이 완구',
    shortTitle: '아이슬라임',
    keyword: '아이슬라임 추천',
    subKeywords: ['액체괴물 안전성', 'KC인증 슬라임', '대용량 슬라임 베이스'],
    title: '아이슬라임 추천 및 안전 가이드 | 유해성 논란과 올바른 놀이법',
    description: '어린이용 아이슬라임 추천 및 구매 기준을 정리했습니다. KC인증 마크 확인, 붕소 등 화학성분 안전 기준, 위생적인 관리 방법과 인기 제품 정보를 확인하세요.',
    opener: '어린이들이 가장 좋아하는 놀이 중 하나가 바로 슬라임, 이른바 \'액체괴물\'입니다. 하지만 부모님 입장에서는 유해 물질이나 피부 자극 걱정이 앞서게 되죠. 아이슬라임 추천 제품을 고를 때는 단순한 재미나 가격보다 안전 인증과 성분 기준을 먼저 확인해야 합니다.',
    why: '슬라임 놀이는 촉감 발달과 소근육 운동, 정서적 스트레스 해소에 긍정적인 영향을 줍니다. 그러나 제품에 포함된 방부제, 향료, 붕소 화합물 등이 기준치를 초과할 경우 피부 발진이나 알레르기를 유발할 수 있습니다. 따라서 안전한 아이슬라임을 고르기 위해서는 KC 마크 획득 여부와 성분 분석 결과를 면밀히 살펴보는 것이 중요합니다.',
    criteria: [
      '**KC인증 마크와 신고번호**가 상세 페이지 및 제품 패키지에 명확히 표시되어 있는지 꼭 확인하세요.',
      '**붕소(Boron) 함량**이 국내 안전 기준치(어린이 완구 기준) 이하로 안전하게 관리되는 제품인지 성분표를 체크하세요.',
      '**천연 색소나 식품 등급 방부제**를 사용하여 안심하고 손으로 만질 수 있는지 후기와 상세 설명을 비교해보세요.'
    ],
    caution: '**슬라임 놀이 후에는 반드시 흐르는 물에 손을 깨끗이 씻어야 합니다.** 상처가 있는 손으로 만지지 않도록 하고, 놀이 도중 눈을 비비지 않도록 지도해 주세요.',
    close: '아이들의 오감을 자극하는 슬라임 놀이, 꼼꼼하게 따져본 안전한 제품으로 부모와 아이 모두 안심하고 즐거운 놀이 시간을 만들어보세요.',
    sources: [
      ['국가기술표준원 제품안전정보센터', 'https://www.safetykorea.kr/'],
      ['한국소비자원 안전 정보', 'https://www.kca.go.kr/']
    ],
    tags: ['#아이슬라임추천', '#액체괴물안전', '#어린이완구']
  },
  {
    slug: 'butter-slime-diy-guide',
    dataFile: 'coupang-butter-slime.json',
    productType: 'butter_slime',
    category: 'goods',
    badge: '촉감 놀이',
    shortTitle: '버터슬라임',
    keyword: '버터슬라임 추천',
    subKeywords: ['점토 슬라임', '꾸덕한 촉감 슬라임', '손에 안붙는 슬라임'],
    title: '버터슬라임 추천 및 특징 비교 | 꾸덕하고 폭신한 촉감 플레이 가이드',
    description: '부드럽고 폭신한 촉감의 버터슬라임 추천 및 고르는 기준을 정리했습니다. 점토 배합 비율, 향료 자극, 손붙음 없는 텍스처와 인기 제품 정보를 확인하세요.',
    opener: '슬라임 입문자부터 마니아층까지 가장 선호하는 제형 중 하나가 바로 \'버터슬라임\'입니다. 일반 클리어 슬라임보다 끈적임이 덜하고, 흡사 버터를 바르는 듯한 부드럽고 쫄깃한 질감이 특징이죠. 버터슬라임 추천 제품은 손에 덜 붙으면서 바풍(바람풍선)이 잘 만들어지는 비율을 확인해야 합니다.',
    why: '버터슬라임은 클리어 슬라임 베이스에 천연 점토(클레이)나 특수 파우더를 섞어 만듭니다. 점토 비율이 너무 높으면 쉽게 굳거나 뚝뚝 끊어지고, 반대로 너무 낮으면 일반 슬라임처럼 손에 끈적하게 달라붙게 됩니다. 완성도 높은 버터슬라임 추천 제품을 고르기 위해서는 촉감의 지속성, 향료의 강도, 그리고 무독성 재료 사용 여부를 함께 봐야 합니다.',
    criteria: [
      '**클레이와 베이스의 배합 비율**이 우수해 손붙음이 적고 폭신폭신한 촉감이 잘 유지되는지 상세 스펙을 확인하세요.',
      '**무독성 천연 점토**를 사용하여 장시간 만져도 안심할 수 있는 제품인지 성분 구성을 비교해 보세요.',
      '**은은한 향료 배합**으로 놀이 과정에서 두통이나 거부감이 없는 무향 또는 저자극 제품인지 후기를 참고하세요.'
    ],
    caution: '**버터슬라임은 점토 성분이 포함되어 있어 공기 중에 오래 노출되면 굳을 수 있습니다.** 놀이가 끝난 후에는 반드시 전용 밀폐 용기에 담아 그늘진 곳에 보관해 주세요.',
    close: '부드러운 촉감으로 스트레스를 해소해 주는 버터슬라임, 꼼꼼히 검증된 촉감과 성분을 기준으로 나만의 힐링 시간을 채워보세요.',
    sources: [
      ['국가기술표준원 제품안전정보센터', 'https://www.safetykorea.kr/'],
      ['한국소비자원 안전 정보', 'https://www.kca.go.kr/']
    ],
    tags: ['#버터슬라임추천', '#점토슬라임', '#촉감놀이']
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function getProducts(page) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', page.dataFile), 'utf8'));
  const seen = new Set();
  return (data.items || [])
    .filter((product) => product.keyword !== 'Gold box')
    .filter((product) => {
      const key = product.productId || product.productName;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function productImage(product) {
  return product.productImage || '/images/favicon.png';
}

function productUrl(product, page) {
  return product.productUrl || `https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=${page.productType}&pageKey=${encodeURIComponent(page.keyword)}`;
}

function priceLabel(product) {
  return product.priceLabel || (product.productPrice ? `${Number(product.productPrice).toLocaleString('ko-KR')}원` : '가격 확인 필요');
}

function productCards(items, page) {
  return items.map((product, index) => {
    const name = product.productName || `${page.shortTitle} 참고 상품`;
    const url = productUrl(product, page);
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">
                    <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(name)}" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${index + 1}번 참고 상품</span>
                  <h3>${escapeHtml(name)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(priceLabel(product))}</strong></div>
                  <div class="product-detail-specs"><strong>카테고리</strong>: ${escapeHtml(product.categoryName || '완구')} · <strong>추천 특징</strong>: KC 안전 인증 여부와 상세 용량, 촉감을 확인해 보세요.</div>
                  <p class="product-detail-desc">상세 페이지에서 실제 제품 크기, 붕소 등 화학성분 성적서 보유 여부, 제조국, 사용 연령 기준을 반드시 다시 확인하세요.</p>
                  <a class="product-detail-btn" href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function generateArticle(page) {
  const items = getProducts(page);
  const first = items[0] || {};
  const heroImage = productImage(first);
  const canonical = `${site}/blog/${page.slug}.html`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: page.description,
    image: { '@type': 'ImageObject', url: heroImage, width: 657, height: 657 },
    thumbnailUrl: heroImage,
    datePublished: date,
    dateModified: date,
    inLanguage: 'ko-KR',
    mainEntityOfPage: canonical,
    author: { '@type': 'Person', name: '골드픽' },
    publisher: {
      '@type': 'Organization',
      name: '골드픽',
      logo: { '@type': 'ImageObject', url: `${site}/images/favicon.png` }
    },
    keywords: `${page.keyword}, ${page.subKeywords.join(', ')}`
  };

  const formattedCriteria = page.criteria.map(c => `              <li>${c}</li>`).join('\n');
  const formattedSources = page.sources.map(s => `              <li><a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a></li>`).join('\n');

  const firstUrl = productUrl(first, page);
  const firstName = first.productName || `${page.shortTitle} 참고 상품`;

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
  <title>${escapeHtml(page.title)} | 골드픽</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(heroImage)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(heroImage)}">
  <link rel="icon" href="/images/favicon.png">
  <link rel="stylesheet" href="/blog/assets/style.css">
  <script defer src="/blog/assets/blog.js"></script>
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 6)}
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
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="drawer-${page.slug}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="drawer-${page.slug}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/" data-blog-path="/">홈</a>
          <a href="/blog/kids-slime-safety-guide.html" data-blog-path="/blog/kids-slime-safety-guide.html">아이슬라임</a>
          <a href="/blog/butter-slime-diy-guide.html" data-blog-path="/blog/butter-slime-diy-guide.html">버터슬라임</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Toy & Hobby Product Note</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/kids-slime-safety-guide.html" data-blog-path="/blog/kids-slime-safety-guide.html">아이슬라임</a>
        <a href="/blog/butter-slime-diy-guide.html" data-blog-path="/blog/butter-slime-diy-guide.html">버터슬라임</a>
      </nav>
    </header>

    <div class="mobile-top-ad" data-mobile-top-ad aria-label="모바일 상단 쿠팡 광고">
      <div class="article-ad article-ad-frame-block">
        <p class="article-ad-label">추천</p>
        ${mobileTopAdIframe}
        <p class="blog-ad-disclosure">${disclosure}</p>
      </div>
    </div>

    <main class="blog-layout">
      <aside class="blog-sidebar blog-sidebar-left">
        <div class="blog-stack">
          <section class="blog-panel blog-profile">
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>집 안에서 재미와 안전을 지켜주는 놀이용품을 실제 사용 기준으로 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#why">선택 시 주의점 <span>이해</span></a>
              <a href="#criteria">체크 리스트 <span>3가지</span></a>
              <a href="#products">참고 상품 <span>쿠팡</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · ${escapeHtml(page.badge)}</span></div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${escapeHtml(page.shortTitle)} 추천</span><br>
            ${escapeHtml(page.description)}<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.subKeywords.join(' · '))}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.shortTitle)} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(firstUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(firstName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">${escapeHtml(page.shortTitle)} 참고 상품</span>
              <strong>${escapeHtml(firstName)}</strong>
              <p>인기 순위 및 평점이 높은 대표 비교군 상품입니다. 실시간 가격 및 재고는 상세 링크에서 확인해 보세요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(firstUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>${escapeHtml(page.shortTitle)} 추천 제품은 안전 기준과 성분 구성을 잘 맞춰 고르는 편이 좋습니다.</figcaption>
          </figure>

          <div class="article-body">
            <p>${escapeHtml(page.opener)}</p>

            <h2 id="why">${escapeHtml(page.shortTitle)}를 고를 때 주의점</h2>
            <p>${escapeHtml(page.why)}</p>

            <h2 id="criteria">체크해야 할 기준 3가지</h2>
            <ul>
${formattedCriteria}
            </ul>
            <p>${page.caution}</p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2>공식 자료 및 관련 사이트</h2>
            <ul class="article-source-list">
${formattedSources}
            </ul>

            <h2 id="products">${escapeHtml(page.keyword)} 참고 상품</h2>
            <p>아래 상품은 ${dateText} 쿠팡 파트너스 상품 검색 기준입니다. 가격, 배송, 구성은 수시로 바뀔 수 있어 구매 전 상세 페이지에서 다시 확인하세요.</p>
            <div class="article-product-detail-list">
${productCards(items, page)}
            </div>

            <h2>마무리</h2>
            <p>${escapeHtml(page.close)}</p>
          </div>
        </article>
      </section>

      <aside class="blog-sidebar blog-sidebar-right">
        <div class="blog-stack blog-stack-sticky">
          <h2>추천 배너</h2>
          ${rightRailAdIframe}
          <p class="blog-ad-disclosure">${disclosure}</p>
        </div>
      </aside>
    </main>
  </div>
</body>
</html>
`;
}

function indexCard(page) {
  const first = getProducts(page)[0] || {};
  return `          <article class="blog-card" data-blog-category="${page.category}">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(productImage(first))}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" loading="lazy">
                <span class="blog-card-badge">${escapeHtml(page.badge)}</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">${escapeHtml(page.badge)} · ${dateText}</div>
                <h3>${escapeHtml(page.title)}</h3>
                <p>${escapeHtml(page.description)}</p>
                <div class="blog-card-tags">
                  ${page.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('\n                  ')}
                </div>
              </div>
            </a>
          </article>`;
}

function patchIndex() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const hasCrlf = html.includes('\r\n');
  const newline = hasCrlf ? '\r\n' : '\n';

  // Clean old cards & json post entries if they exist
  for (const page of pages) {
    const cardPattern = new RegExp(`\\r?\\n?\\s*<article class="blog-card" data-blog-category="[^"]*${page.productType}[^"]*">[\\s\\S]*?\\r?\\n\\s*</article>`, 'g');
    html = html.replace(cardPattern, '');
    const cardPatternSlug = new RegExp(`\\r?\\n?\\s*<article class="blog-card"[^>]*>\\r?\\n\\s*<a href="/blog/${page.slug}\\.html"[\\s\\S]*?\\r?\\n\\s*</article>`, 'g');
    html = html.replace(cardPatternSlug, '');
    const navPattern = new RegExp(`\\r?\\n\\s*<a href="/blog/${page.slug}\\.html" data-blog-path="/blog/${page.slug}\\.html">[^<]*</a>`, 'g');
    html = html.replace(navPattern, '');
    const jsonPattern = new RegExp(`\\r?\\n?\\s*\\{\\r?\\n\\s*"@type": "BlogPosting",[\\s\\S]*?"url": "https://idont82\\.github\\.io/blog/${page.slug}\\.html",[\\s\\S]*?\\r?\\n\\s*\\},`, 'g');
    html = html.replace(jsonPattern, '');
  }

  // Insert new cards right after the blog-card-list container starts
  let cardsHtml = '';
  for (const page of pages) {
    cardsHtml += indexCard(page) + newline;
  }
  const listStartRegex = /(<div class="blog-card-list">)\r?\n/;
  html = html.replace(listStartRegex, `$1${newline}${cardsHtml}`);

  // Add top nav items in index.html (under `<nav class="blog-top-nav"`)
  const topNavTarget = '<a href="/blog/neck-fan-summer-social-guide.html"';
  const slimeNavItems = `<a href="/blog/kids-slime-safety-guide.html" data-blog-path="/blog/kids-slime-safety-guide.html">아이슬라임</a>${newline}          <a href="/blog/butter-slime-diy-guide.html" data-blog-path="/blog/butter-slime-diy-guide.html">버터슬라임</a>${newline}          `;
  html = html.replaceAll(topNavTarget, slimeNavItems + topNavTarget);

  // Add blogPost JSON-LD elements
  let jsonLdEntries = '';
  for (const page of pages) {
    const first = getProducts(page)[0] || {};
    jsonLdEntries += `        {
          "@type": "BlogPosting",
          "headline": ${JSON.stringify(page.title)},
          "url": "${site}/blog/${page.slug}.html",
          "image": ${JSON.stringify(productImage(first))},
          "datePublished": "${date}"
        },${newline}`;
  }
  const jsonLdStartRegex = /("blogPost": \[\r?\n)/;
  html = html.replace(jsonLdStartRegex, `$1${jsonLdEntries}`);

  // Normalize line endings
  if (hasCrlf) {
    html = html.replace(/\r?\n/g, '\r\n');
  } else {
    html = html.replace(/\r\n/g, '\n');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
}

function patchSitemap() {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const hasCrlf = xml.includes('\r\n');
  const newline = hasCrlf ? '\r\n' : '\n';

  for (const page of pages) {
    const loc = `${site}/blog/${page.slug}.html`;
    if (!xml.includes(loc)) {
      xml = xml.replace('</urlset>', `  <url>${newline}    <loc>${loc}</loc>${newline}    <lastmod>${date}</lastmod>${newline}    <changefreq>weekly</changefreq>${newline}    <priority>0.8</priority>${newline}  </url>${newline}</urlset>`);
    }
  }

  if (hasCrlf) {
    xml = xml.replace(/\r?\n/g, '\r\n');
  } else {
    xml = xml.replace(/\r\n/g, '\n');
  }

  fs.writeFileSync(sitemapPath, xml, 'utf8');
}

// Generate the files
for (const page of pages) {
  let fileContent = generateArticle(page);
  // Normalize file endings of the generated article to match root files
  const targetPath = path.join(root, 'blog', `${page.slug}.html`);
  const indexHtmlContent = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const hasCrlf = indexHtmlContent.includes('\r\n');
  if (hasCrlf) {
    fileContent = fileContent.replace(/\r?\n/g, '\r\n');
  } else {
    fileContent = fileContent.replace(/\r\n/g, '\n');
  }
  fs.writeFileSync(targetPath, fileContent, 'utf8');
  console.log(`Generated: /blog/${page.slug}.html`);
}

patchIndex();
patchSitemap();

console.log('Index and Sitemap updated successfully.');
