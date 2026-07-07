const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-07';
const dateText = '2026.07.07';
const slug = 'claw-machine-popular-plush-buying-guide';
const productType = 'claw_popular_plush';
const keyword = '인형뽑기 인기 인형 구매';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const productGroups = [
  {
    label: '산리오',
    data: 'coupang-claw-plush-sanrio.json',
    pattern: /산리오|Sanrio|쿠로미|시나모롤|마이멜로디|폼폼푸린/i,
    note: '쿠로미, 시나모롤, 마이멜로디처럼 뽑기방에서 자주 보이는 캐릭터군입니다.'
  },
  {
    label: '치이카와·먼작귀',
    data: 'coupang-claw-plush-chiikawa.json',
    pattern: /치이카와|먼작귀|하치와레|우사기|Chiikawa/i,
    note: '작은 키링형과 미니 봉제인형을 같이 비교하면 체감 가격을 보기 쉽습니다.'
  },
  {
    label: '포켓몬',
    data: 'coupang-claw-plush-pokemon.json',
    pattern: /포켓몬|포켓몬스터|피카츄|꼬부기|잠만보|레쿠쟈/i,
    note: '캐릭터마다 크기와 가격 차이가 크기 때문에 상세 페이지의 사이즈를 꼭 봐야 합니다.'
  },
  {
    label: '카피바라',
    data: 'coupang-claw-plush-capybara.json',
    pattern: /카피바라|capybara/i,
    note: '요즘 뽑기방에서 체감 노출이 높은 동물형 인형으로, 바디필로우형도 같이 뜹니다.'
  },
  {
    label: '몰랑이',
    data: 'coupang-claw-plush-molang.json',
    pattern: /몰랑|Molang/i,
    note: '말랑한 토끼형 캐릭터라 아이 선물이나 책상 장식용으로 보기 좋습니다.'
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readGroup(group) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', group.data), 'utf8'));
  const items = (data.items || []).filter((product) => product.keyword !== 'Gold box');
  const matched = items.find((product) => group.pattern.test(product.productName || ''));
  return matched || items[0] || {};
}

function products() {
  return productGroups.map((group) => ({
    ...readGroup(group),
    groupLabel: group.label,
    groupNote: group.note
  })).filter((product) => product.productName);
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
    const name = product.productName || `${product.groupLabel} 인형 참고 상품`;
    const url = productUrl(product);
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${productType}">
                    <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(name)}" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${index + 1}번 · ${escapeHtml(product.groupLabel)}</span>
                  <h3>${escapeHtml(name)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(priceLabel(product))}</strong></div>
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: ${escapeHtml(product.groupNote)}</div>
                  <p class="product-detail-desc">뽑기방 경품과 온라인 판매 상품은 크기, 소재, 라이선스 표기가 다를 수 있습니다. 상세 페이지의 정품 여부, 라이선스 표기, 사이즈를 확인하세요.</p>
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
  const title = '인형뽑기 인기 인형 구매, 산리오·치이카와·포켓몬 직접 사면 얼마일까';
  const description = '인형뽑기 인기 인형 구매를 고민하는 분들을 위해 산리오, 치이카와, 포켓몬, 카피바라, 몰랑이 인형을 직접 살 때 보는 가격·크기·정품 여부 기준을 정리했습니다.';
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
    keywords: '인형뽑기 인기 인형 구매, 산리오 인형, 치이카와 인형, 포켓몬 인형, 카피바라 인형, 몰랑이 인형'
  };
  const mobileUrl = productUrl(first);
  const mobileName = first.productName || '인형뽑기 인기 인형 참고 상품';

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
        <div class="blog-mobile-title">인기 인형 직접 구매</div>
        <div class="blog-mobile-actions">
          <button type="button" class="blog-mobile-icon" data-share-page aria-label="이 페이지 공유">↗</button>
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="drawer-${slug}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="drawer-${slug}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/" data-blog-path="/">홈</a>
          <a href="/blog/claw-machine-popular-plush-buying-guide.html" data-blog-path="/blog/claw-machine-popular-plush-buying-guide.html">인기 인형 구매</a>
          <a href="/blog/seoul-claw-machine-guide.html" data-blog-path="/blog/seoul-claw-machine-guide.html">서울 인형뽑기</a>
          <a href="/blog/jongro-claw-tour.html" data-blog-path="/blog/jongro-claw-tour.html">종로 뽑기 투어</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Claw Machine Plush Buying Note</p>
        <div class="blog-title">인형뽑기 인기 인형 직접 구매</div>
        <p class="blog-intro">${escapeHtml(description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/seoul-claw-machine-guide.html" data-blog-path="/blog/seoul-claw-machine-guide.html">서울 인형뽑기</a>
        <a href="/blog/jongro-claw-tour.html" data-blog-path="/blog/jongro-claw-tour.html">종로</a>
        <a href="/blog/yeonsinnae-claw-tour.html" data-blog-path="/blog/yeonsinnae-claw-tour.html">연신내</a>
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
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="인형뽑기 인기 인형 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>뽑기방에서 보고 갖고 싶어진 인형을 직접 살 때의 기준을 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#title-options">제목 후보 <span>3개</span></a>
              <a href="#why">직접 구매 기준 <span>비교</span></a>
              <a href="#criteria">고르는 법 <span>3가지</span></a>
              <a href="#products">캐릭터별 상품 <span>5종</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · 인형뽑기 굿즈</span></div>
          <h1 class="blog-article-title">${escapeHtml(title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${keyword}</span><br>
            뽑기방에서 몇 번 시도할지, 온라인에서 바로 살지 고민된다면 크기와 정품 여부, 배송비를 먼저 비교해보세요.<br>
            <span class="memo-note memo-note--summary memo-note--blue">산리오 · 치이카와 · 포켓몬 · 카피바라 · 몰랑이</span>
          </div>

          <section class="mobile-conversion-card" aria-label="인형뽑기 인기 인형 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(mobileName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">인형뽑기 인기 인형 참고 상품</span>
              <strong>${escapeHtml(mobileName)}</strong>
              <p>뽑기방에서 본 인형과 온라인 판매 상품은 크기와 구성 차이가 있을 수 있어요. 상세 페이지 기준으로 비교하세요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="인형뽑기 인기 인형 대표 상품 이미지" width="657" height="657">
            <figcaption>뽑기방 경품과 온라인 인형은 같은 캐릭터라도 크기, 소재, 라이선스 표기가 다를 수 있습니다.</figcaption>
          </figure>

          <div class="article-body">
            <section id="title-options">
              <h2>제목 후보 3개</h2>
              <ul>
                <li>인형뽑기 인기 인형 구매, 산리오·치이카와·포켓몬 직접 사면 얼마일까</li>
                <li>뽑기방에서 못 뽑은 인형, 직접 구매할 때 보는 가격과 크기 기준</li>
                <li>인형뽑기 인기 인형 구매 전 정품 여부와 사이즈 확인하기</li>
              </ul>
            </section>

            <p class="article-lead">뽑기방에서 마음에 드는 인형을 보면 “한 번만 더”가 쉽게 나와요. 그런데 몇 번 실패하고 나면 차라리 직접 사는 게 낫지 않을까 생각하게 됩니다. 인형뽑기 인기 인형 구매는 뽑는 재미와 갖고 싶은 마음을 나눠서 보는 게 좋아요.</p>

            <h2 id="why">직접 구매가 나을 때도 있어요</h2>
            <p>산리오, 치이카와, 포켓몬, 카피바라, 몰랑이처럼 인기 캐릭터 인형은 뽑기방에서도 자주 보이고 온라인에서도 쉽게 검색됩니다. 다만 뽑기방 경품은 매장마다 크기와 퀄리티가 다르고, 온라인 상품은 상세 페이지의 라이선스 표기와 소재 정보가 중요해요. 인형뽑기 인기 인형 구매를 고민한다면 내가 원하는 게 “뽑는 재미”인지 “그 인형 자체”인지 먼저 정리해보세요.</p>

            <h2 id="criteria">직접 구매 전 보는 기준 3가지</h2>
            <ul>
              <li>정품 여부와 라이선스 표기를 확인하세요. 상세 페이지, 판매자 정보, 리뷰 사진을 함께 보는 편이 안전합니다.</li>
              <li>크기는 사진보다 cm 표기를 보세요. 키링형, 25cm, 40cm, 바디필로우형은 체감이 완전히 다릅니다.</li>
              <li>뽑기 비용과 온라인 가격을 비교할 때는 배송비와 실패 확률까지 같이 생각하세요.</li>
            </ul>
            <p><strong>온라인 상품은 라이선스 표기와 판매자 정보를 함께 확인해야 합니다.</strong> 상품명에 캐릭터명이 있어도 상세 페이지의 제조사, 수입사, KC 표시, 리뷰 사진을 차분히 비교해보세요.</p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2>뽑기방에서 많이 보이는 인형군</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>캐릭터형</h3>
                <p>산리오, 치이카와, 포켓몬처럼 팬층이 있는 캐릭터는 작은 키링부터 대형 인형까지 가격 차이가 큽니다.</p>
              </section>
              <section class="article-choice-card">
                <h3>동물·말랑형</h3>
                <p>카피바라, 몰랑이처럼 귀여운 실루엣이 강한 인형은 크기와 촉감, 세탁 가능 여부를 같이 보세요.</p>
              </section>
            </div>

            <h2 id="products">인형뽑기 인기 인형 구매 참고 상품</h2>
            <p>아래 상품은 2026년 7월 7일 쿠팡 파트너스 상품 검색 기준입니다. 가격, 배송, 구성은 바뀔 수 있으니 구매 전 상세 페이지에서 다시 확인하세요.</p>
            <div class="article-product-detail-list">
${productCards(items)}
            </div>

            <h2>마무리</h2>
            <p>뽑기방에서 직접 뽑는 재미는 분명히 있어요. 다만 특정 인형이 꼭 갖고 싶은 목적이라면 직접 구매 가격과 크기, 정품 여부를 한 번 비교해보는 것도 합리적입니다.</p>
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
  return `          <article class="blog-card" data-blog-category="goods claw">
            <a href="/blog/${slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(productImage(first))}" alt="인형뽑기 인기 인형 대표 이미지" loading="lazy">
                <span class="blog-card-badge">인기 인형 구매</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">인형뽑기 굿즈 · ${dateText}</div>
                <h3>인형뽑기 인기 인형 구매, 산리오·치이카와·포켓몬 직접 사면 얼마일까</h3>
                <p>뽑기방에서 자주 보이는 인기 인형을 직접 살 때 가격, 크기, 정품 여부 기준으로 비교했습니다.</p>
                <div class="blog-card-tags">
                  <span>#인형뽑기인기인형</span>
                  <span>#산리오인형</span>
                  <span>#치이카와인형</span>
                </div>
              </div>
            </a>
          </article>`;
}

function patchIndex() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const cardPattern = new RegExp(`\\n?\\s*<article class="blog-card" data-blog-category="[^"]*">\\n\\s*<a href="/blog/${slug}\\.html"[\\s\\S]*?\\n\\s*</article>`, 'g');
  html = html.replace(cardPattern, '');
  const navPattern = new RegExp(`\\n\\s*<a href="/blog/${slug}\\.html" data-blog-path="/blog/${slug}\\.html">[^<]*</a>`, 'g');
  html = html.replace(navPattern, '');
  const jsonPattern = new RegExp(`\\n?\\s*\\{\\n\\s*"@type": "BlogPosting",[\\s\\S]*?"url": "https://idont82\\.github\\.io/blog/${slug}\\.html",[\\s\\S]*?\\n\\s*\\},`, 'g');
  html = html.replace(jsonPattern, '');

  const anchor = '          <article class="blog-card" data-blog-category="life">\n            <a href="/blog/water-500ml-vs-2l-guide.html"';
  html = html.includes(anchor)
    ? html.replace(anchor, `${indexCard()}\n\n${anchor}`)
    : html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${indexCard()}\n`);

  html = html.replace('          <a href="/blog/jongro-claw-tour.html"', `          <a href="/blog/${slug}.html" data-blog-path="/blog/${slug}.html">인기 인형 구매</a>\n          <a href="/blog/jongro-claw-tour.html"`);

  const first = products()[0] || {};
  const blogPostItem = `        {
          "@type": "BlogPosting",
          "headline": "인형뽑기 인기 인형 구매, 산리오·치이카와·포켓몬 직접 사면 얼마일까",
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
