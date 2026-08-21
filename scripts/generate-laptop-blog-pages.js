const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLISHED_DATE = '2026-08-21';
const AFFILIATE_DISCLOSURE = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const ROOT_INDEX_START = '<!-- LAPTOP-BLOG-START -->';
const ROOT_INDEX_END = '<!-- LAPTOP-BLOG-END -->';
const BLOG_INDEX_START = '<!-- LAPTOP-BLOG-INDEX-START -->';
const BLOG_INDEX_END = '<!-- LAPTOP-BLOG-INDEX-END -->';
const SITEMAP_START = '<?LAPTOP-SITEMAP-START?>';
const SITEMAP_END = '<?LAPTOP-SITEMAP-END?>';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validatePairList(value, label, slug) {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`${slug} has invalid ${label}`);
  }
  for (const pair of value) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some((item) => !String(item || '').trim())) {
      throw new Error(`${slug} has invalid ${label}`);
    }
  }
}

function validateProduct(product, page, seen) {
  const productId = Number(product.productId);
  if (!Number.isSafeInteger(productId)) {
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
  if (seen.has(productId)) {
    throw new Error(`${page.slug} repeats productId ${productId}`);
  }
  seen.add(productId);
}

function validateInputs(manifest, productDataByFile) {
  if (!Array.isArray(manifest) || manifest.length !== 3) {
    throw new Error('노트북 글은 정확히 3개여야 합니다.');
  }

  const slugs = new Set();
  const seenProductIds = new Set();
  for (const page of manifest) {
    for (const field of [
      'slug', 'productType', 'keyword', 'productData', 'title',
      'description', 'intro', 'summary', 'caution',
    ]) {
      if (!String(page[field] || '').trim()) {
        throw new Error(`${page.slug || 'unknown'} has invalid ${field}`);
      }
    }
    if (slugs.has(page.slug)) {
      throw new Error(`duplicate slug: ${page.slug}`);
    }
    slugs.add(page.slug);
    if (page.productCount !== 3) {
      throw new Error(`${page.slug} 상품 개수는 3개여야 합니다.`);
    }
    if (!Array.isArray(page.criteria) || page.criteria.length !== 3
      || page.criteria.some((item) => !String(item || '').trim())) {
      throw new Error(`${page.slug} has invalid criteria`);
    }
    if (!Array.isArray(page.roleLabels) || page.roleLabels.length !== 3) {
      throw new Error(`${page.slug} has invalid roleLabels`);
    }
    if (!Array.isArray(page.productNotes) || page.productNotes.length !== 3) {
      throw new Error(`${page.slug} has invalid productNotes`);
    }
    for (const note of page.productNotes) {
      if (!note || ['fit', 'specs', 'limitation'].some((field) => !String(note[field] || '').trim())) {
        throw new Error(`${page.slug} has incomplete productNotes`);
      }
    }
    validatePairList(page.faq, 'faq', page.slug);
    validatePairList(page.sources, 'sources', page.slug);

    const productData = productDataByFile[page.productData];
    if (!productData || !Array.isArray(productData.items)) {
      throw new Error(`${page.slug} 상품 데이터가 없습니다.`);
    }
    if (productData.items.length !== 3) {
      throw new Error(`${page.slug} 상품 개수가 3개가 아닙니다.`);
    }
    productData.items.forEach((product) => validateProduct(product, page, seenProductIds));
  }
}

function affiliateAttributes(page, placement) {
  return `target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="${placement}" data-coupang-product-type="${escapeHtml(page.productType)}"`;
}

function renderProductCard(page, product, note, index) {
  const price = Number(product.productPrice).toLocaleString('ko-KR');
  return `
          <article class="laptop-product-card" data-product-id="${Number(product.productId)}">
            <a class="laptop-product-image" href="${escapeHtml(product.productUrl)}" ${affiliateAttributes(page, 'product_card')} aria-label="${escapeHtml(product.productName)} 현재 정보 확인">
              <img src="${escapeHtml(product.productImage)}" alt="${escapeHtml(product.productName)} 상품 이미지" loading="lazy" width="512" height="512">
            </a>
            <div class="laptop-product-content">
              <span class="laptop-role-label">${escapeHtml(page.roleLabels[index])}</span>
              <h3>${index + 1}. ${escapeHtml(product.productName)}</h3>
              <p class="laptop-price">수집 시점 가격 <strong>${price}원</strong></p>
              <dl class="laptop-notes">
                <div><dt>잘 맞는 경우</dt><dd>${escapeHtml(note.fit)}</dd></div>
                <div><dt>제목에서 확인되는 사양</dt><dd>${escapeHtml(note.specs)}</dd></div>
                <div><dt>구매 전 확인</dt><dd>${escapeHtml(note.limitation)}</dd></div>
              </dl>
              <a class="laptop-buy-button" href="${escapeHtml(product.productUrl)}" ${affiliateAttributes(page, 'product_card')}>쿠팡에서 현재 옵션 확인</a>
            </div>
          </article>`;
}

function renderArticle(page, productData, allPages) {
  const primary = productData.items[0];
  const canonical = `https://idont82.github.io/blog/${page.slug}.html`;
  const cards = productData.items.map((product, index) => (
    renderProductCard(page, product, page.productNotes[index], index)
  )).join('');
  const rows = productData.items.map((product, index) => `
                <tr>
                  <th scope="row">${escapeHtml(page.roleLabels[index])}</th>
                  <td>${escapeHtml(product.productName)}</td>
                  <td>${Number(product.productPrice).toLocaleString('ko-KR')}원</td>
                </tr>`).join('');
  const criteria = page.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ');
  const faq = page.faq.map(([question, answer]) => `
            <details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('');
  const sources = page.sources.map(([label, url]) => (
    `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`
  )).join('\n              ');
  const related = allPages.filter((item) => item.slug !== page.slug).map((item) => (
    `<li><a href="/blog/${item.slug}.html">${escapeHtml(item.title)}</a></li>`
  )).join('\n              ');
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
  <link rel="icon" href="/images/favicon.png">
  <link rel="stylesheet" href="/blog/assets/style.css">
  <style>
    body{overflow-x:hidden}.laptop-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #e7e0d6}.laptop-nav a{text-decoration:none;color:#231d18}.laptop-wrap{max-width:1120px;margin:0 auto;padding:30px 20px 84px}.laptop-article{max-width:840px;margin:0 auto;min-width:0}.laptop-kicker{font-weight:800;color:#7c4b23;letter-spacing:.05em}.laptop-article h1{font-size:clamp(2rem,5vw,3.3rem);line-height:1.18;overflow-wrap:anywhere}.laptop-lead{font-size:1.08rem;line-height:1.85;color:#443d37}.laptop-summary{margin:24px 0;padding:22px;border:1px solid #e4cda8;border-radius:18px;background:#fff7e8}.laptop-hero{display:block;margin:24px 0;border-radius:24px;overflow:hidden;background:#f5f2ec}.laptop-hero img{display:block;width:100%;height:min(520px,68vw);object-fit:contain}.laptop-section{margin-top:48px}.laptop-section h2{font-size:1.65rem}.laptop-checklist{padding-left:1.4rem;line-height:1.85}.laptop-table-wrap{overflow-x:auto}.laptop-table{width:100%;min-width:620px;border-collapse:collapse}.laptop-table th,.laptop-table td{padding:14px;border-bottom:1px solid #ddd;text-align:left}.laptop-products{display:grid;gap:24px}.laptop-product-card{display:grid;grid-template-columns:minmax(220px,36%) 1fr;gap:24px;padding:20px;border:1px solid #e6ddcf;border-radius:22px;min-width:0}.laptop-product-image img{width:100%;aspect-ratio:1;object-fit:contain}.laptop-product-content{min-width:0;overflow-wrap:anywhere}.laptop-role-label{display:inline-block;padding:6px 10px;border-radius:999px;background:#3e2d22;color:#fff;font-size:.82rem;font-weight:800}.laptop-price{color:#6e3d18}.laptop-notes div{margin-top:12px}.laptop-notes dt{font-weight:800}.laptop-notes dd{margin:4px 0 0;line-height:1.65}.laptop-buy-button{display:inline-block;margin-top:14px;padding:12px 16px;border-radius:10px;background:#bd5c1c;color:#fff;text-decoration:none;font-weight:800}.laptop-caution{padding:20px;border-left:5px solid #b84c2a;background:#fff4ef}.laptop-faq details{padding:16px 0;border-bottom:1px solid #ddd}.laptop-faq summary{cursor:pointer;font-weight:800}.laptop-disclosure{margin-top:48px;padding:16px;border-radius:12px;background:#f4f4f4;font-size:.9rem}.laptop-footer{margin-top:56px;padding-top:24px;border-top:1px solid #ddd;color:#666}.laptop-mobile-cta{display:none}@media(max-width:680px){.laptop-wrap{padding:20px 16px 96px}.laptop-article h1{font-size:2rem;word-break:break-word}.laptop-product-card{grid-template-columns:1fr}.laptop-product-image img{max-height:330px}.laptop-nav a:last-child{display:none}.laptop-mobile-cta{display:block;position:fixed;z-index:20;left:12px;right:12px;bottom:12px;padding:14px;border-radius:14px;background:#bd5c1c;color:#fff;text-align:center;text-decoration:none;font-weight:800;box-shadow:0 8px 28px #0004}}
  </style>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MRKNJH9Z');</script>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRKNJH9Z" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <header class="laptop-nav"><a href="/">← 홈</a><strong>GOLD PICK</strong><a href="/index.html#blog">구매 가이드</a></header>
  <main class="laptop-wrap">
    <article class="laptop-article blog-article">
      <p class="laptop-kicker">LAPTOP BUYING GUIDE · ${PUBLISHED_DATE.replaceAll('-', '.')}</p>
      <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>
      <p class="laptop-lead">${escapeHtml(page.intro)}</p>
      <div class="laptop-summary article-summary-box"><strong>한눈에 보는 결론</strong><p>${escapeHtml(page.summary)}</p></div>
      <a class="laptop-hero" href="${escapeHtml(primary.productUrl)}" ${affiliateAttributes(page, 'article_hero')} aria-label="대표 상품 현재 정보 확인">
        <img src="${escapeHtml(primary.productImage)}" alt="${escapeHtml(primary.productName)} 대표 이미지" width="512" height="512">
      </a>
      <section class="laptop-section"><h2>${escapeHtml(page.keyword)} 전 확인할 3가지</h2><ol class="laptop-checklist">${criteria}</ol></section>
      <section class="laptop-section"><h2>TOP 3 비교표</h2><div class="laptop-table-wrap"><table class="laptop-table"><thead><tr><th>선택 기준</th><th>상품</th><th>수집 시점 가격</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <section class="laptop-section"><h2>현재 판매 상품으로 비교하기</h2><p>상품 정보 수집 시점: <time datetime="${escapeHtml(productData.verifiedAt)}">${escapeHtml(productData.verifiedAt.slice(0, 10))}</time>. 가격·재고·옵션은 접속 시점에 달라질 수 있습니다.</p><div class="laptop-products">${cards}</div></section>
      <section class="laptop-section laptop-caution"><h2>구매 전 꼭 확인할 점</h2><p>${escapeHtml(page.caution)}</p></section>
      <section class="laptop-section laptop-faq"><h2>자주 묻는 질문</h2>${faq}</section>
      <section class="laptop-section"><h2>참고 자료</h2><ul>${sources}</ul></section>
      <section class="laptop-section"><h2>함께 읽기</h2><ul>${related}</ul></section>
      <p class="laptop-disclosure">${AFFILIATE_DISCLOSURE}</p>
      <footer class="laptop-footer">Gold Pick은 상품명과 공개된 판매 정보를 바탕으로 선택 기준을 정리합니다.</footer>
    </article>
  </main>
  <a class="laptop-mobile-cta" href="${escapeHtml(primary.productUrl)}" ${affiliateAttributes(page, 'mobile_summary_card')}>대표 상품 현재 옵션 확인</a>
  <script src="/blog/assets/blog.js" defer></script>
</body>
</html>
`;
}

function removeMarkerBlock(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) return source;
  const endIndex = source.indexOf(end, startIndex);
  if (endIndex === -1) throw new Error(`${start} 마커가 닫히지 않았습니다.`);
  const before = source.slice(0, startIndex).replace(/[ \t]*(?:\r?\n)?$/, '');
  const after = source.slice(endIndex + end.length).replace(/^[ \t]*(?:\r?\n)?/, '');
  return `${before}\n${after}`.replace(/\n{3,}/g, '\n\n');
}

function updateRootIndex(source, manifest, productDataByFile) {
  const cards = manifest.map((page) => {
    const product = productDataByFile[page.productData].items[0];
    return `          <article class="blog-card" data-blog-category="life laptop">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain"><img class="is-active" src="${escapeHtml(product.productImage)}" alt="${escapeHtml(page.keyword)} 대표 이미지" loading="lazy" width="512" height="512"><span class="blog-card-badge">노트북 추천</span></div>
              <div class="blog-card-body"><div class="blog-card-meta">노트북 구매 가이드 · 2026.08.21</div><h3>${escapeHtml(page.title)}</h3><p>${escapeHtml(page.description)}</p><div class="blog-card-tags"><span>#노트북추천</span><span>#구매가이드</span></div></div>
            </a>
          </article>`;
  }).join('\n');
  const value = `${ROOT_INDEX_START}\n${cards}\n          ${ROOT_INDEX_END}`;
  const clean = removeMarkerBlock(source, ROOT_INDEX_START, ROOT_INDEX_END);
  const anchorMatch = clean.match(/[ \t]*<div class="blog-card-list">/);
  if (!anchorMatch) throw new Error('홈의 blog-card-list를 찾지 못했습니다.');
  const listStart = clean.indexOf(anchorMatch[0]) + anchorMatch[0].length;
  return `${clean.slice(0, listStart)}\n${value}${clean.slice(listStart)}`;
}

function updateBlogIndex(source, manifest) {
  const links = manifest.map((page) => (
    `    <li><a href="/blog/${page.slug}.html">${escapeHtml(page.title)}</a></li>`
  )).join('\n');
  const block = `${BLOG_INDEX_START}\n  <nav aria-label="새 노트북 구매 가이드">\n  <ul>\n${links}\n  </ul>\n  </nav>\n  ${BLOG_INDEX_END}`;
  const clean = removeMarkerBlock(source, BLOG_INDEX_START, BLOG_INDEX_END);
  if (!clean.includes('</body>')) throw new Error('블로그 인덱스 body를 찾지 못했습니다.');
  return clean.replace(/\s*<\/body>/, `\n  ${block}\n</body>`);
}

function updateSitemap(source, manifest) {
  const urls = manifest.map((page) => `  <url>
    <loc>https://idont82.github.io/blog/${page.slug}.html</loc>
    <lastmod>${PUBLISHED_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
  const block = `${SITEMAP_START}\n${urls}\n${SITEMAP_END}\n`;
  const clean = removeMarkerBlock(source, SITEMAP_START, SITEMAP_END);
  if (!clean.includes('</urlset>')) throw new Error('사이트맵의 urlset 닫는 태그를 찾지 못했습니다.');
  return clean.replace(/\s*<\/urlset>/, `\n${block}</urlset>`);
}

function loadInputs(rootDir = ROOT_DIR) {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'laptop-blog-guides.json'), 'utf8'));
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
    content: updateRootIndex(fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8'), manifest, productDataByFile),
  });
  outputs.push({
    path: path.join(rootDir, 'blog', 'index.html'),
    content: updateBlogIndex(fs.readFileSync(path.join(rootDir, 'blog', 'index.html'), 'utf8'), manifest),
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
    console.log(JSON.stringify({ status: 'ok', files: generate() }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  generate,
  renderArticle,
  updateBlogIndex,
  updateRootIndex,
  updateSitemap,
  validateInputs,
};
