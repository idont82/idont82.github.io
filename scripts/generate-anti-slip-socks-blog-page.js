const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-07';
const dateText = '2026.07.07';
const slug = 'anti-slip-socks-home-guide';
const dataFile = 'coupang-anti-slip-socks.json';
const productType = 'anti_slip_socks';
const keyword = '미끄럼 방지 양말 추천';
const shortTitle = '미끄럼 방지 양말';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function products() {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', dataFile), 'utf8'));
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
    .slice(0, 4);
}

function productImage(product) {
  return product.productImage || '/images/favicon.png';
}

function productUrl(product) {
  return product.productUrl || `https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=${productType}&pageKey=${encodeURIComponent(keyword)}`;
}

function priceLabel(product) {
  return product.priceLabel || (product.productPrice ? `${Number(product.productPrice).toLocaleString('ko-KR')}원` : '가격 확인 필요');
}

function productCards(items) {
  return items.map((product, index) => {
    const name = product.productName || `${shortTitle} 참고 상품`;
    const url = productUrl(product);
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${productType}">
                    <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(name)}" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${index + 1}번 참고 상품</span>
                  <h3>${escapeHtml(name)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(priceLabel(product))}</strong></div>
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: 발바닥 실리콘 면적, 사이즈, 발목 조임, 세탁 후 미끄럼 방지 유지 여부를 함께 보세요.</div>
                  <p class="product-detail-desc">어르신, 아이, 임산부, 실내 운동용은 필요한 기준이 다릅니다. 상품명보다 실제 신는 사람의 발 크기와 생활 공간을 먼저 맞춰보세요.</p>
                  <a class="product-detail-btn" href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${productType}">현재 가격 확인하기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function article() {
  const items = products();
  const first = items[0] || {};
  const heroImage = productImage(first);
  const canonical = `${site}/blog/${slug}.html`;
  const title = '미끄럼 방지 양말 추천, 부모님·아이 실내용으로 고를 때 보는 기준';
  const description = '미끄럼 방지 양말 추천을 찾는 분들을 위해 발바닥 실리콘, 사이즈, 발목 조임, 세탁 내구성, 어르신·아이·임산부 사용 기준을 정리했습니다.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
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
    keywords: '미끄럼 방지 양말 추천, 논슬립 양말, 어르신 양말, 아동 미끄럼방지 양말'
  };
  const mobileUrl = productUrl(first);
  const mobileName = first.productName || `${shortTitle} 참고 상품`;

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
  <title>${escapeHtml(title)} | 골드픽</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(heroImage)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
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
        <div class="blog-mobile-title">${shortTitle}</div>
        <div class="blog-mobile-actions">
          <button type="button" class="blog-mobile-icon" data-share-page aria-label="이 페이지 공유">↗</button>
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="drawer-${slug}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="drawer-${slug}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/" data-blog-path="/">홈</a>
          <a href="/blog/anti-slip-socks-home-guide.html" data-blog-path="/blog/anti-slip-socks-home-guide.html">미끄럼 방지 양말</a>
          <a href="/blog/rainy-commute-essentials-guide.html" data-blog-path="/blog/rainy-commute-essentials-guide.html">장마 출근</a>
          <a href="/blog/mosquito-repellent-summer-social-guide.html" data-blog-path="/blog/mosquito-repellent-summer-social-guide.html">모기 기피제</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Home Safety Product Note</p>
        <div class="blog-title">${shortTitle}</div>
        <p class="blog-intro">${escapeHtml(description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/anti-slip-socks-home-guide.html" data-blog-path="/blog/anti-slip-socks-home-guide.html">미끄럼 방지 양말</a>
        <a href="/blog/neck-fan-summer-social-guide.html" data-blog-path="/blog/neck-fan-summer-social-guide.html">넥밴드 선풍기</a>
        <a href="/blog/rainy-season-home-dehumidifying-guide.html" data-blog-path="/blog/rainy-season-home-dehumidifying-guide.html">장마 제습</a>
      </nav>
    </header>

    <div class="mobile-top-ad" data-mobile-top-ad aria-label="모바일 상단 쿠팡 광고">
      <div class="article-ad article-ad-frame-block">
        <p class="article-ad-label">광고</p>
        ${mobileTopAdIframe}
      </div>
    </div>

    <main class="blog-layout">
      <aside class="blog-sidebar blog-sidebar-left">
        <div class="blog-stack">
          <section class="blog-panel blog-profile">
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="${shortTitle} 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>집 안에서 반복해서 쓰는 생활용품을 실제 사용 기준으로 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#title-options">제목 후보 <span>3개</span></a>
              <a href="#why">필요한 이유 <span>실내</span></a>
              <a href="#criteria">고르는 법 <span>3가지</span></a>
              <a href="#products">참고 상품 <span>쿠팡</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · 생활용품</span></div>
          <h1 class="blog-article-title">${escapeHtml(title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${keyword}</span><br>
            부모님, 아이, 임산부, 실내 운동용처럼 신는 사람이 달라지면 봐야 할 기준도 달라집니다.<br>
            <span class="memo-note memo-note--summary memo-note--blue">발바닥 실리콘 · 사이즈 · 세탁 내구성</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${shortTitle} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(mobileName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">논슬립 양말 참고 상품</span>
              <strong>${escapeHtml(mobileName)}</strong>
              <p>${keyword} 검색에서 비교 출발점으로 볼 만한 상품입니다. 가격과 구성은 구매 전 다시 확인하세요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${shortTitle} 대표 상품 이미지" width="657" height="657">
            <figcaption>미끄럼 방지 양말은 실내 바닥 재질과 신는 사람의 발 상태에 맞춰 고르는 편이 좋습니다.</figcaption>
          </figure>

          <div class="article-body">
            <section id="title-options">
              <h2>제목 후보 3개</h2>
              <ul>
                <li>미끄럼 방지 양말 추천, 부모님·아이 실내용으로 고를 때 보는 기준</li>
                <li>논슬립 양말 고르는 법, 발바닥 실리콘만 보면 부족해요</li>
                <li>미끄럼 방지 양말 추천 전 사이즈·세탁·발목 조임 확인하기</li>
              </ul>
            </section>

            <p class="article-lead">집 안에서 양말을 신고 걷다가 미끄러운 느낌이 들면 생각보다 신경이 쓰여요. 특히 부모님이나 아이가 있다면 작은 미끄러짐도 마음에 걸리죠. 미끄럼 방지 양말 추천을 볼 때는 예쁜 색보다 발바닥 접지, 사이즈, 세탁 후 유지력을 먼저 보는 게 좋아요.</p>

            <h2 id="why">미끄럼 방지 양말 추천을 볼 때 왜 기준이 필요할까요?</h2>
            <p>미끄럼 방지 양말은 발바닥에 실리콘이나 고무 패턴을 더해 바닥과의 마찰을 높이는 제품이에요. 하지만 바닥이 젖어 있거나, 양말 사이즈가 크거나, 발바닥 패턴이 빨리 닳으면 기대한 만큼 안정감이 나오지 않을 수 있습니다. 그래서 미끄럼 방지 양말 추천 제품은 신는 사람과 바닥 환경을 함께 보고 골라야 해요.</p>

            <h2 id="criteria">속지 않고 고르는 기준 3가지</h2>
            <ul>
              <li>발바닥 실리콘이 앞꿈치와 뒤꿈치까지 충분히 분포되어 있는지 확인하세요.</li>
              <li>사이즈가 크면 양말 안에서 발이 밀릴 수 있어요. 어르신용, 아동용, 성인 공용 사이즈를 구분해서 보세요.</li>
              <li>세탁 후 실리콘이 떨어지거나 원단이 늘어나면 접지감이 줄어들 수 있으니 세탁 방식과 후기까지 확인하세요.</li>
            </ul>
            <p><strong>미끄럼 방지 양말이 낙상 예방을 보장하는 제품은 아니에요.</strong> 바닥 물기 제거, 조명, 문턱 정리, 적절한 신발이나 슬리퍼 선택과 함께 보는 보조 생활용품으로 이해하는 게 안전합니다.</p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2>누가 신느냐에 따라 선택 기준이 달라요</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>부모님·어르신용</h3>
                <p>발목 조임이 너무 강하지 않고, 신고 벗기 쉬운지 보세요. 바닥 패턴은 넓게 분포된 제품이 안정감을 주기 쉽습니다.</p>
              </section>
              <section class="article-choice-card">
                <h3>아이·키즈카페용</h3>
                <p>사이즈가 딱 맞고 세탁이 쉬운 구성이 좋습니다. 이름표나 색상 구분이 쉬운지도 은근히 중요해요.</p>
              </section>
            </div>

            <h2>참고한 공식 정보</h2>
            <p>낙상은 양말 하나만으로 해결되는 문제가 아니기 때문에, 공식 자료의 낙상 위험 요인과 실내 환경 관리 원칙을 바탕으로 표현을 보수적으로 정리했습니다.</p>
            <ul class="article-source-list">
              <li><a href="https://www.cdc.gov/falls/" target="_blank" rel="noopener">CDC Falls Prevention</a></li>
              <li><a href="https://www.nia.nih.gov/health/falls-and-falls-prevention" target="_blank" rel="noopener">National Institute on Aging: Falls and Falls Prevention</a></li>
            </ul>

            <h2 id="products">${keyword} 참고 상품</h2>
            <p>아래 상품은 2026년 7월 7일 쿠팡 파트너스 상품 검색 기준입니다. 가격, 배송, 구성은 수시로 바뀔 수 있어 구매 전 상세 페이지에서 다시 확인하세요.</p>
            <div class="article-product-detail-list">
${productCards(items)}
            </div>

            <h2>마무리</h2>
            <p>미끄럼 방지 양말 추천 제품을 고르는 마음은 결국 집 안에서 조금 더 편하게 걷고 싶다는 마음이에요. 과장된 효과보다 신는 사람에게 잘 맞는 사이즈와 발바닥 접지, 세탁 내구성을 차분히 확인해보세요.</p>
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

function indexCard() {
  const first = products()[0] || {};
  return `          <article class="blog-card" data-blog-category="life">
            <a href="/blog/${slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(productImage(first))}" alt="${shortTitle} 대표 이미지" loading="lazy">
                <span class="blog-card-badge">생활 안전</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">생활용품 · ${dateText}</div>
                <h3>미끄럼 방지 양말 추천, 부모님·아이 실내용으로 고를 때 보는 기준</h3>
                <p>발바닥 실리콘, 사이즈, 발목 조임, 세탁 내구성 기준으로 논슬립 양말을 정리했습니다.</p>
                <div class="blog-card-tags">
                  <span>#미끄럼방지양말추천</span>
                  <span>#논슬립양말</span>
                  <span>#어르신양말</span>
                </div>
              </div>
            </a>
          </article>`;
}

function patchIndex() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const cardPattern = new RegExp(`\\n?\\s*<article class="blog-card" data-blog-category="life">\\n\\s*<a href="/blog/${slug}\\.html"[\\s\\S]*?\\n\\s*</article>`, 'g');
  html = html.replace(cardPattern, '');
  const navPattern = new RegExp(`\\n\\s*<a href="/blog/${slug}\\.html" data-blog-path="/blog/${slug}\\.html">[^<]*</a>`, 'g');
  html = html.replace(navPattern, '');
  const jsonPattern = new RegExp(`\\n?\\s*\\{\\n\\s*"@type": "BlogPosting",[\\s\\S]*?"url": "https://idont82\\.github\\.io/blog/${slug}\\.html",[\\s\\S]*?\\n\\s*\\},`, 'g');
  html = html.replace(jsonPattern, '');

  const anchor = '          <article class="blog-card" data-blog-category="life">\n            <a href="/blog/neck-fan-summer-social-guide.html"';
  html = html.includes(anchor)
    ? html.replace(anchor, `${indexCard()}\n${anchor}`)
    : html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${indexCard()}\n`);

  html = html.replace('          <a href="/blog/neck-fan-summer-social-guide.html"', `          <a href="/blog/${slug}.html" data-blog-path="/blog/${slug}.html">미끄럼 방지 양말</a>\n          <a href="/blog/neck-fan-summer-social-guide.html"`);

  const first = products()[0] || {};
  const blogPostItem = `        {
          "@type": "BlogPosting",
          "headline": "미끄럼 방지 양말 추천, 부모님·아이 실내용으로 고를 때 보는 기준",
          "url": "${site}/blog/${slug}.html",
          "image": ${JSON.stringify(productImage(first))},
          "datePublished": "${date}"
        },`;
  html = html.replace('      "blogPost": [\n', `      "blogPost": [\n${blogPostItem}\n`);
  fs.writeFileSync(indexPath, html, 'utf8');
}

function patchSitemap() {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const loc = `${site}/blog/${slug}.html`;
  if (!xml.includes(loc)) {
    xml = xml.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
  }
  fs.writeFileSync(sitemapPath, xml, 'utf8');
}

fs.writeFileSync(path.join(root, 'blog', `${slug}.html`), article(), 'utf8');
patchIndex();
patchSitemap();

console.log(`/blog/${slug}.html`);
