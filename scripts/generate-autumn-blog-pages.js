const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLISHED_DATE = '2026-08-18';
const AFFILIATE_DISCLOSURE = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const INDEX_START = '<!-- AUTUMN-BLOG-START -->';
const INDEX_END = '<!-- AUTUMN-BLOG-END -->';
const SITEMAP_START = '<?AUTUMN-SITEMAP-START?>';
const SITEMAP_END = '<?AUTUMN-SITEMAP-END?>';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validatePairList(value, label, slug) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${slug} has invalid ${label}`);
  }
  for (const pair of value) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some((item) => !String(item || '').trim())) {
      throw new Error(`${slug} has invalid ${label}`);
    }
  }
}

function validateProduct(product, page, seen) {
  if (!Number.isSafeInteger(Number(product.productId))) {
    throw new Error(`${page.slug} has invalid productId`);
  }
  if (!String(product.productName || '').trim()
    || !Number.isFinite(Number(product.productPrice))
    || Number(product.productPrice) <= 0) {
    throw new Error(`${page.slug} has incomplete product`);
  }
  if (!/^https:\/\/ads-partners\.coupang\.com\//.test(product.productImage || '')) {
    throw new Error(`${page.slug} has invalid image`);
  }
  if (!/^https:\/\/(?:link|www|ads-partners)\.coupang\.com\//.test(product.productUrl || '')) {
    throw new Error(`${page.slug} has invalid affiliate URL`);
  }
  const productId = Number(product.productId);
  if (seen.has(productId)) {
    throw new Error(`${page.slug} repeats productId ${productId}`);
  }
  seen.add(productId);
}

function validateInputs(manifest, productDataByFile) {
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error('가을 글 편집 데이터가 비어 있습니다.');
  }

  const slugs = new Set();
  for (const page of manifest) {
    const stringFields = [
      'slug', 'productType', 'keyword', 'productData', 'title',
      'description', 'intro', 'caution',
    ];
    for (const field of stringFields) {
      if (!String(page[field] || '').trim()) {
        throw new Error(`${page.slug || 'unknown'} has invalid ${field}`);
      }
    }
    if (slugs.has(page.slug)) {
      throw new Error(`duplicate slug: ${page.slug}`);
    }
    slugs.add(page.slug);
    if (!Number.isSafeInteger(page.productCount) || page.productCount < 1) {
      throw new Error(`${page.slug} has invalid productCount`);
    }
    if (!Array.isArray(page.criteria) || page.criteria.length !== 3) {
      throw new Error(`${page.slug} has invalid criteria`);
    }
    if (!Array.isArray(page.roleLabels) || page.roleLabels.length !== page.productCount) {
      throw new Error(`${page.slug} 상품 개수와 역할 개수가 다릅니다.`);
    }
    validatePairList(page.faq, 'faq', page.slug);
    validatePairList(page.sources, 'sources', page.slug);

    const productData = productDataByFile[page.productData];
    if (!productData || !Array.isArray(productData.items)) {
      throw new Error(`${page.slug} 상품 데이터가 없습니다.`);
    }
    if (productData.items.length !== page.productCount) {
      throw new Error(`${page.slug} 상품 개수가 ${page.productCount}개가 아닙니다.`);
    }
    const seen = new Set();
    productData.items.forEach((product) => validateProduct(product, page, seen));
  }
}

function affiliateAttributes(page, placement) {
  return `target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="${placement}" data-coupang-product-type="${escapeHtml(page.productType)}"`;
}

function renderProductCard(page, product, index) {
  const label = page.roleLabels[index];
  const formattedPrice = Number(product.productPrice).toLocaleString('ko-KR');
  return `
        <article class="autumn-product-card" data-product-id="${Number(product.productId)}">
          <a class="autumn-product-image-link" href="${escapeHtml(product.productUrl)}" ${affiliateAttributes(page, 'product_card')} aria-label="${escapeHtml(product.productName)} 상품 보기">
            <img src="${escapeHtml(product.productImage)}" alt="${escapeHtml(product.productName)} 상품 이미지" loading="lazy" width="512" height="512">
          </a>
          <div class="autumn-product-content">
            <span class="autumn-role-label">${escapeHtml(label)}</span>
            <h3>${index + 1}. ${escapeHtml(product.productName)}</h3>
            <p>검색 확인가 <strong>${formattedPrice}원</strong> · 가격과 재고는 접속 시점에 달라질 수 있습니다.</p>
            <a class="autumn-buy-button" href="${escapeHtml(product.productUrl)}" ${affiliateAttributes(page, 'product_card')}>쿠팡에서 현재 정보 확인</a>
          </div>
        </article>`;
}

function renderArticle(page, productData, allPages) {
  const primary = productData.items[0];
  const canonical = `https://idont82.github.io/blog/${page.slug}.html`;
  const criteria = page.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n            ');
  const cards = productData.items.map((product, index) => renderProductCard(page, product, index)).join('');
  const comparisonRows = productData.items.map((product, index) => `
              <tr>
                <th scope="row">${escapeHtml(page.roleLabels[index])}</th>
                <td>${escapeHtml(product.productName)}</td>
                <td>${Number(product.productPrice).toLocaleString('ko-KR')}원</td>
              </tr>`).join('');
  const faq = page.faq.map(([question, answer]) => `
          <details>
            <summary>${escapeHtml(question)}</summary>
            <p>${escapeHtml(answer)}</p>
          </details>`).join('');
  const sources = page.sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join('\n            ');
  const related = allPages.filter((item) => item.slug !== page.slug).slice(0, 3)
    .map((item) => `<li><a href="/blog/${item.slug}.html">${escapeHtml(item.title)}</a></li>`).join('\n            ');
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: page.description,
    image: [primary.productImage],
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: 'Gold Pick' },
    publisher: { '@type': 'Organization', name: 'Gold Pick' },
  }).replaceAll('<', '\\u003c');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <title>${escapeHtml(page.title)} | Gold Pick</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(primary.productImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/blog/assets/style.css">
  <style>
    body{overflow-x:hidden}.autumn-wrap{max-width:1120px;margin:0 auto;padding:28px 20px 72px}.autumn-article{max-width:820px;margin:0 auto;background:#fff;min-width:0}.autumn-kicker{color:#a34a22;font-weight:800;letter-spacing:.04em}.autumn-article h1{font-size:clamp(2rem,5vw,3.35rem);line-height:1.18;margin:.5rem 0 1rem;overflow-wrap:anywhere}.autumn-lead{font-size:1.08rem;line-height:1.85;color:#424242;overflow-wrap:anywhere}.autumn-summary{margin:24px 0;padding:22px;border-radius:18px;background:#fff4df;border:1px solid #efcf9d;overflow-wrap:anywhere}.autumn-hero{display:block;margin:24px 0;border-radius:24px;overflow:hidden;background:#f3eee6}.autumn-hero img{display:block;width:100%;height:min(520px,68vw);object-fit:contain}.autumn-section{margin-top:48px;min-width:0}.autumn-section h2{font-size:1.65rem;overflow-wrap:anywhere}.autumn-checklist{padding-left:1.4rem;line-height:1.85}.autumn-table-wrap{overflow-x:auto}.autumn-table{width:100%;border-collapse:collapse;min-width:600px}.autumn-table th,.autumn-table td{padding:14px;border-bottom:1px solid #ddd;text-align:left}.autumn-products{display:grid;gap:22px}.autumn-product-card{display:grid;grid-template-columns:minmax(220px,38%) 1fr;gap:24px;border:1px solid #eadfce;border-radius:22px;padding:20px;background:#fff;min-width:0}.autumn-product-content{min-width:0;overflow-wrap:anywhere}.autumn-product-image-link img{width:100%;aspect-ratio:1;object-fit:contain}.autumn-role-label{display:inline-block;background:#532e1d;color:#fff;border-radius:999px;padding:6px 10px;font-size:.82rem;font-weight:700}.autumn-buy-button{display:inline-block;margin-top:12px;padding:12px 16px;border-radius:10px;background:#d95d24;color:#fff;text-decoration:none;font-weight:800}.autumn-caution{padding:20px;border-left:5px solid #b84c2a;background:#fff4ef}.autumn-faq details{border-bottom:1px solid #ddd;padding:16px 0}.autumn-faq summary{cursor:pointer;font-weight:750}.autumn-disclosure{margin-top:48px;padding:16px;border-radius:12px;background:#f5f5f5;font-size:.9rem}.autumn-footer{margin-top:56px;padding:26px 0;border-top:1px solid #ddd;color:#666}.autumn-mobile-cta{display:none}.autumn-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #eee}.autumn-nav a{text-decoration:none;color:#221b17}.autumn-nav strong{font-size:1.2rem}@media(max-width:680px){.autumn-wrap{padding:20px 16px 90px}.autumn-article h1{font-size:2rem;word-break:break-word}.autumn-product-card{grid-template-columns:1fr}.autumn-product-image-link img{max-height:330px}.autumn-nav{padding:14px 16px}.autumn-nav a:last-child{display:none}.autumn-mobile-cta{display:block;position:fixed;z-index:20;left:12px;right:12px;bottom:12px;padding:14px;border-radius:14px;background:#d95d24;color:white;text-align:center;text-decoration:none;font-weight:800;box-shadow:0 8px 28px #0004}}
  </style>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MRKNJH9Z');</script>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRKNJH9Z" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <header class="autumn-nav"><a href="/">← 홈</a><strong>GOLD PICK</strong><a href="/index.html#blog">구매 가이드</a></header>
  <main class="autumn-wrap">
    <article class="autumn-article">
      <p class="autumn-kicker">AUTUMN BUYING GUIDE · ${PUBLISHED_DATE.replaceAll('-', '.')}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="autumn-lead">${escapeHtml(page.intro)}</p>
      <div class="autumn-summary"><strong>먼저 볼 기준</strong><p>${escapeHtml(page.criteria[0])} ${escapeHtml(page.criteria[1])}</p></div>
      <a class="autumn-hero" href="${escapeHtml(primary.productUrl)}" ${affiliateAttributes(page, 'article_hero')} aria-label="대표 상품 확인">
        <img src="${escapeHtml(primary.productImage)}" alt="${escapeHtml(primary.productName)} 대표 이미지" width="512" height="512">
      </a>
      <section class="autumn-section">
        <h2>${escapeHtml(page.keyword)} 전 확인할 3가지</h2>
        <ol class="autumn-checklist">
          ${criteria}
        </ol>
      </section>
      <section class="autumn-section">
        <h2>${page.productCount > 1 ? '용도별 상품 비교' : '대표 상품 핵심 정보'}</h2>
        <div class="autumn-table-wrap">
          <table class="autumn-table">
            <thead><tr><th>역할</th><th>상품</th><th>검색 확인가</th></tr></thead>
            <tbody>${comparisonRows}
            </tbody>
          </table>
        </div>
      </section>
      <section class="autumn-section">
        <h2>실제 상품으로 비교하기</h2>
        <p>상품 정보 확인 시각: <time datetime="${escapeHtml(productData.verifiedAt)}">${escapeHtml(productData.verifiedAt.slice(0, 10))}</time>. 가격·배송·옵션은 쿠팡 페이지에서 다시 확인하세요.</p>
        <div class="autumn-products">${cards}
        </div>
      </section>
      <section class="autumn-section autumn-caution">
        <h2>구매 전 주의</h2>
        <p>${escapeHtml(page.caution)}</p>
      </section>
      <section class="autumn-section autumn-faq">
        <h2>자주 묻는 질문</h2>${faq}
      </section>
      <section class="autumn-section">
        <h2>참고 자료</h2>
        <ul>
          ${sources}
        </ul>
      </section>
      <section class="autumn-section">
        <h2>함께 읽기</h2>
        <ul>
          ${related}
        </ul>
      </section>
      <p class="autumn-disclosure">${AFFILIATE_DISCLOSURE}</p>
      <footer class="autumn-footer">Gold Pick은 공식 자료와 실제 판매 정보를 구분해 확인하는 구매 가이드입니다.</footer>
    </article>
  </main>
  <a class="autumn-mobile-cta" href="${escapeHtml(primary.productUrl)}" ${affiliateAttributes(page, 'mobile_summary_card')}>대표 상품 현재 정보 확인</a>
  <script src="/blog/assets/blog.js" defer></script>
</body>
</html>
`;
}

function removeMarkerBlock(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) {
    return source;
  }
  const endIndex = source.indexOf(end, startIndex);
  if (endIndex === -1) {
    throw new Error(`${start} 마커가 닫히지 않았습니다.`);
  }
  const before = source.slice(0, startIndex).replace(/[ \t]*(?:\r?\n)?$/, '');
  const after = source.slice(endIndex + end.length).replace(/^[ \t]*(?:\r?\n)?/, '');
  return `${before}\n${after}`.replace(/\n{3,}/g, '\n\n');
}

function updateIndex(source, manifest, productDataByFile) {
  const cards = manifest.map((page) => {
    const product = productDataByFile[page.productData].items[0];
    return `          <article class="blog-card" data-blog-category="life autumn">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(product.productImage)}" alt="${escapeHtml(page.keyword)} 대표 이미지" loading="lazy" width="512" height="512">
                <span class="blog-card-badge">가을 추천</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">가을 구매 가이드 · 2026.08.18</div>
                <h3>${escapeHtml(page.title)}</h3>
                <p>${escapeHtml(page.description)}</p>
                <div class="blog-card-tags"><span>#가을추천</span><span>#구매가이드</span></div>
              </div>
            </a>
          </article>`;
  }).join('\n');
  const value = `${INDEX_START}\n${cards}\n          ${INDEX_END}`;
  const clean = removeMarkerBlock(source, INDEX_START, INDEX_END);
  const anchorMatch = clean.match(/[ \t]*<div class="blog-card-list">/);
  if (!anchorMatch) {
    throw new Error('홈의 blog-card-list를 찾지 못했습니다.');
  }
  const listStart = clean.indexOf(anchorMatch[0]) + anchorMatch[0].length;
  const listTail = clean.slice(listStart);
  const closingMatch = listTail.match(/        <\/div>\r?\n      <\/section>/);
  const realClosing = closingMatch ? listStart + closingMatch.index : -1;
  const fallbackClosing = clean.indexOf('</div>', listStart);
  const closingIndex = realClosing === -1 ? fallbackClosing : realClosing;
  if (closingIndex === -1) {
    throw new Error('홈의 blog-card-list 닫는 태그를 찾지 못했습니다.');
  }
  return `${clean.slice(0, closingIndex)}${value}\n${clean.slice(closingIndex)}`;
}

function updateSitemap(source, manifest) {
  const urls = manifest.map((page) => `  <url>
    <loc>https://idont82.github.io/blog/${page.slug}.html</loc>
    <lastmod>${PUBLISHED_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
  const value = `${SITEMAP_START}\n${urls}\n${SITEMAP_END}\n`;
  const legacyClean = removeMarkerBlock(
    source,
    '<!-- AUTUMN-SITEMAP-START -->',
    '<!-- AUTUMN-SITEMAP-END -->',
  );
  const clean = removeMarkerBlock(legacyClean, SITEMAP_START, SITEMAP_END);
  if (!clean.includes('</urlset>')) {
    throw new Error('사이트맵의 urlset 닫는 태그를 찾지 못했습니다.');
  }
  return clean.replace(/\s*<\/urlset>/, `\n${value}</urlset>`);
}

function loadInputs(rootDir = ROOT_DIR) {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'autumn-blog-guides.json'), 'utf8'));
  const productDataByFile = {};
  for (const page of manifest) {
    productDataByFile[page.productData] = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'data', page.productData), 'utf8'),
    );
  }
  return { manifest, productDataByFile };
}

function generate(rootDir = ROOT_DIR) {
  const { manifest, productDataByFile } = loadInputs(rootDir);
  validateInputs(manifest, productDataByFile);

  const outputs = manifest.map((page) => ({
    path: path.join(rootDir, 'blog', `${page.slug}.html`),
    content: renderArticle(page, productDataByFile[page.productData], manifest),
  }));
  outputs.push({
    path: path.join(rootDir, 'index.html'),
    content: updateIndex(fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8'), manifest, productDataByFile),
  });
  outputs.push({
    path: path.join(rootDir, 'sitemap.xml'),
    content: updateSitemap(fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8'), manifest),
  });

  for (const output of outputs) {
    fs.writeFileSync(output.path, output.content, 'utf8');
  }
  return outputs.map((output) => path.relative(rootDir, output.path));
}

if (require.main === module) {
  try {
    const files = generate();
    console.log(JSON.stringify({ status: 'ok', files }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  generate,
  renderArticle,
  updateIndex,
  updateSitemap,
  validateInputs,
};
