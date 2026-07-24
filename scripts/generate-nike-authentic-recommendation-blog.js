const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-24';
const dateText = '2026.07.24';
const slug = 'nike-authentic-sneakers-recommendation-guide';
const pagePath = path.join(root, 'blog', `${slug}.html`);
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const productType = 'nike_authentic_recommendation';
const authenticPattern = /국내\s*매장\s*정품|국내정품|백화점\s*정품|\[정품\]|나이키코리아/;
const carouselSrc = 'https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=';
const mobileAdSrc = 'https://ads-partners.coupang.com/widgets.html?id=992213&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=380&amp;height=50&amp;tsource=';

const picks = [
  {
    rank: '1순위',
    model: '코트 비전',
    file: 'coupang-nike-court-vision.json',
    keyword: /코트\s*비전|코트비전/i,
    reason: '가격대와 코디 범용성이 좋아 데일리 스니커즈로 가장 무난합니다.',
    check: '발등 압박과 흰색 갑피 오염 후기를 먼저 보세요.'
  },
  {
    rank: '2순위',
    model: '레볼루션',
    file: 'coupang-nike-revolution.json',
    keyword: /레볼루션/i,
    reason: '걷기, 출퇴근, 헬스장처럼 편한 착화감이 중요한 용도에 맞습니다.',
    check: '발볼 여유와 장시간 보행 후기를 확인하세요.'
  },
  {
    rank: '3순위',
    model: '에어포스',
    file: 'coupang-nike-air-force-1.json',
    keyword: /에어\s*포스|에어포스/i,
    reason: '오래 인기 있는 클래식 모델이라 코디용, 커플화, 데일리화로 안정적입니다.',
    check: '무게감과 여름 착용감, 반업 후기를 같이 보세요.'
  },
  {
    rank: '4순위',
    model: '덩크 로우',
    file: 'coupang-nike-dunk-low.json',
    keyword: /덩크/i,
    reason: '패션성과 인기성은 좋지만 색상과 옵션별 가격 차이가 큰 편입니다.',
    check: '색상명, 모델 코드, 판매자, 반품 조건을 세밀하게 확인하세요.'
  },
  {
    rank: '5순위',
    model: '에어맥스',
    file: 'coupang-nike-air-max.json',
    keyword: /에어\s*맥스|에어맥스/i,
    reason: '쿠션감 있는 운동화를 찾는다면 후보가 되지만 모델별 착화감 차이가 큽니다.',
    check: '에어 유닛 내구성, 소음, 무게감 후기를 함께 보세요.'
  }
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readProducts(fileName) {
  return JSON.parse(fs.readFileSync(path.join(root, 'data', fileName), 'utf8')).items || [];
}

function selectProduct(pick) {
  const authentic = readProducts(pick.file).filter((item) => authenticPattern.test(item.productName || ''));
  const matched = authentic.find((item) => pick.keyword.test(item.productName || ''));
  const selected = matched || authentic[0];
  if (!selected) {
    throw new Error(`${pick.model} has no product with explicit authentic wording`);
  }
  return selected;
}

function formatPrice(price) {
  if (!Number.isFinite(Number(price))) return '상세 페이지 확인';
  return `${Number(price).toLocaleString('ko-KR')}원대`;
}

const ranked = picks.map((pick) => ({ ...pick, product: selectProduct(pick) }));
const heroImage = ranked[0].product.productImage;
const canonical = `${site}/blog/${slug}.html`;
const title = '나이키 정품 운동화 추천, 쿠팡 정품 표기 후보 중 괜찮은 순서';
const description = '쿠팡 상품명에 정품 표기가 있는 나이키 운동화 후보만 골라 코트 비전, 레볼루션, 에어포스, 덩크 로우, 에어맥스를 추천 순서로 정리했습니다.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description,
  image: { '@type': 'ImageObject', url: heroImage, width: 1200, height: 630 },
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
  keywords: '나이키 정품 운동화 추천, 나이키 국내정품, 나이키 국내매장정품, 나이키 스니커즈 추천'
};

function productCards() {
  return ranked.map((pick) => {
    const product = pick.product;
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(product.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${productType}">
                    <img src="${escapeHtml(product.productImage)}" alt="${escapeHtml(product.productName)}" width="420" height="420" loading="lazy">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${pick.rank} · ${escapeHtml(pick.model)}</span>
                  <h3>${escapeHtml(product.productName)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(formatPrice(product.productPrice))}</strong></div>
                  <div class="product-detail-specs"><strong>추천 이유</strong>: ${escapeHtml(pick.reason)}</div>
                  <p class="product-detail-desc">${escapeHtml(pick.check)} 정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요.</p>
                  <a class="product-detail-btn" href="${escapeHtml(product.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${productType}">정품 표기와 후기 확인하기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function renderArticle() {
  const first = ranked[0].product;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-9914349640032484">
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
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body class="blog-article-page">
  <div class="blog-shell">
    <header class="blog-header">
      <div class="blog-mobile-bar">
        <button type="button" class="blog-mobile-back" data-blog-back aria-label="뒤로 가기">‹</button>
        <a class="blog-mobile-brand" href="/">Goldpick</a>
        <div class="blog-mobile-title">나이키 정품 추천</div>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Nike Authentic Picks</p>
        <div class="blog-title">나이키 정품 운동화 추천</div>
        <p class="blog-intro">${escapeHtml(description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/">홈</a>
        <a href="/blog/${slug}.html">나이키 정품 추천</a>
        <a href="/blog/nike-court-vision-review-popular-guide.html">코트 비전</a>
      </nav>
    </header>

    <div class="mobile-top-ad" data-mobile-top-ad aria-label="모바일 상단 쿠팡 광고">
      <div class="article-ad article-ad-frame-block">
        <p class="article-ad-label">광고</p>
        <iframe src="${mobileAdSrc}" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
      </div>
    </div>

    <main class="blog-layout">
      <aside class="blog-sidebar blog-sidebar-left">
        <div class="blog-stack">
          <section class="blog-panel blog-profile">
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="나이키 정품 운동화 추천 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>쿠팡 상품명 기준 정품 표기 후보만 골라 비교합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#summary">추천 요약 <span>순위</span></a>
              <a href="#criteria">정품 체크 <span>기준</span></a>
              <a href="#products">상품 보기 <span>쿠팡</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>신발 후기 체크</span></div>
          <h1 class="blog-article-title">${escapeHtml(title)}</h1>

          <div class="article-summary-box" id="summary">
            <span class="memo-note memo-note--summary">핵심 요약</span><br>
            쿠팡 상품명에 정품 표기가 있는 후보만 골랐습니다. 실사용 기준으로는 1순위 코트 비전, 2순위 레볼루션, 3순위 에어포스, 4순위 덩크 로우, 5순위 에어맥스 순서로 봅니다.
          </div>

          <section class="mobile-conversion-card" aria-label="나이키 정품 운동화 추천 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(first.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">
              <img src="${escapeHtml(first.productImage)}" alt="${escapeHtml(first.productName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">1순위 추천</span>
              <strong>${escapeHtml(first.productName)}</strong>
              <p>데일리화로 가장 무난한 쪽은 코트 비전입니다. 가격과 코디 범용성이 좋아 첫 후보로 보기 좋습니다.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(first.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${productType}">정품 표기와 후기 보기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="나이키 정품 운동화 추천 대표 상품 이미지" width="657" height="657">
            <figcaption>정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요.</figcaption>
          </figure>

          <div class="article-body">
            <p class="article-lead">나이키 운동화는 인기 모델일수록 판매처, 옵션, 색상, 가격 차이가 큽니다. 그래서 단순히 “나이키”로 검색하기보다 상품명에 정품 표기가 있는 후보만 먼저 좁히고, 그 다음 착화감과 용도를 보는 편이 안전합니다.</p>

            <h2 id="criteria">정품 표기 후보를 고른 기준</h2>
            <p><strong>쿠팡 상품명에 정품 표기가 있는 후보만 골랐습니다.</strong> 이 글에서는 국내매장정품, 국내정품, 백화점 정품, [정품], 나이키코리아 같은 문구가 상품명에 있는 후보만 사용했습니다.</p>
            <p>다만 이 글이 진품을 직접 보증하는 것은 아닙니다. 정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요.</p>

            <div class="article-choice-grid">
              <section class="article-choice-card"><h3>편한 데일리화</h3><p>코트 비전, 레볼루션을 먼저 봅니다.</p></section>
              <section class="article-choice-card"><h3>인기 클래식</h3><p>에어포스와 덩크 로우는 코디용으로 좋습니다.</p></section>
              <section class="article-choice-card"><h3>쿠션감</h3><p>에어맥스는 모델별 착화감 차이를 확인해야 합니다.</p></section>
            </div>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              <iframe src="${carouselSrc}" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="products">나이키 정품 운동화 추천 순서</h2>
            <p>가격, 배송, 옵션, 리뷰 수는 계속 바뀔 수 있습니다. 구매 직전에는 상세 페이지에서 최신 후기와 반품 조건을 같이 확인하세요.</p>
            <div class="product-detail-list">
${productCards()}
            </div>
          </div>
        </article>
      </section>

      <aside class="blog-sidebar blog-sidebar-right">
        <div class="blog-stack">
          <section class="blog-panel">
            <h2>관심 상품</h2>
            <iframe class="blog-ad-frame" src="${carouselSrc}" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
            <p class="blog-ad-disclosure">${disclosure}</p>
          </section>
          <section class="blog-panel">
            <h2>관련 글</h2>
            <div class="blog-link-list">
              <a href="/blog/nike-court-vision-review-popular-guide.html">나이키 코트 비전 후기 <span>정품 표기</span></a>
              <a href="/blog/nike-revolution-review-popular-guide.html">나이키 레볼루션 후기 <span>걷기용</span></a>
              <a href="/blog/nike-dunk-low-review-popular-guide.html">나이키 덩크 로우 후기 <span>인기색상</span></a>
            </div>
          </section>
        </div>
      </aside>
    </main>
  </div>
</body>
</html>
`;
}

function renderIndexCard() {
  return `          <article class="blog-card" data-blog-category="life goods">
            <a href="/blog/${slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img src="${escapeHtml(heroImage)}" alt="나이키 정품 운동화 추천 대표 이미지" loading="lazy">
                <span class="blog-card-badge">나이키 정품 추천</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">신발 후기 체크 · ${dateText}</div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
                <div class="blog-card-tags"><span>#나이키정품</span><span>#국내정품</span><span>#운동화추천</span></div>
              </div>
            </a>
          </article>`;
}

function updateIndex() {
  const filePath = path.join(root, 'index.html');
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(`/blog/${slug}.html`)) return;

  const marker = '          <article class="blog-card" data-blog-category="test life">';
  if (html.includes(marker)) {
    html = html.replace(marker, `${renderIndexCard()}\n${marker}`);
  } else {
    html = html.replace(/(\s*<div class="blog-card-list">\r?\n)/, `$1${renderIndexCard()}\n`);
  }
  fs.writeFileSync(filePath, html, 'utf8');
}

function updateSitemap() {
  const filePath = path.join(root, 'sitemap.xml');
  let xml = fs.readFileSync(filePath, 'utf8');
  if (xml.includes(`${site}/blog/${slug}.html`)) return;

  const entry = `  <url>\n    <loc>${site}/blog/${slug}.html</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml = xml.replace('</urlset>', `${entry}</urlset>`);
  fs.writeFileSync(filePath, xml, 'utf8');
}

fs.writeFileSync(pagePath, renderArticle(), 'utf8');
updateIndex();
updateSitemap();
