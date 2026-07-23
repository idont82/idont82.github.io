const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-23';
const dateText = '2026.07.23';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const carouselSrc = 'https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=';
const mobileAdSrc = 'https://ads-partners.coupang.com/widgets.html?id=992213&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=380&amp;height=50&amp;tsource=';
const authenticNikePattern = /국내\s*매장\s*정품|국내정품|백화점\s*정품|\[정품\]|나이키코리아/;

const pages = [
  {
    slug: 'waterproof-phone-pouch-late-july-guide',
    dataFile: 'coupang-july-waterproof-pouch.json',
    productType: 'late_july_waterproof_pouch',
    title: '방수팩 추천, 7월 말 워터파크 가기 전에 꼭 보는 체크 기준',
    keyword: '방수팩 추천',
    badge: '7월 말 물놀이',
    category: '여름 휴가용품',
    description: '7월 말 워터파크와 계곡 물놀이 전에 방수팩 추천 기준을 방수 등급, 잠금 구조, 터치감, 목걸이 안정감 중심으로 정리했습니다.',
    hero: '/images/waterproof-pouch-top3-thumbnail.png',
    intro: '7월 말에는 워터파크, 계곡, 바다 일정이 한꺼번에 몰립니다. 이때 방수팩은 사진을 찍기 위한 액세서리라기보다 휴대폰, 카드, 차 키를 젖지 않게 나누는 작은 안전장치에 가깝습니다.',
    needs: ['IPX 표기와 이중 잠금 구조 확인', '케이스를 씌운 휴대폰이 들어가는 내부 폭', '목걸이 줄과 손목 스트랩의 고정력'],
    tips: ['사용 전 휴지를 넣고 10분 정도 물 테스트를 해보세요.', '물속 장시간 촬영용으로 과신하지 말고, 물 튀김과 짧은 침수 대응용으로 보세요.', '카드와 휴대폰을 같이 넣을 경우 내부 압착으로 터치감이 떨어질 수 있습니다.'],
    tags: ['#방수팩추천', '#워터파크준비물', '#여름휴가']
  },
  {
    slug: 'cooler-bag-ice-box-late-july-guide',
    dataFile: 'coupang-july-cooler-bag.json',
    productType: 'late_july_cooler_bag',
    title: '보냉백 아이스박스 추천, 7월 말 피크닉과 캠핑에서 덜 녹게 고르는 법',
    keyword: '보냉백 아이스박스 추천',
    badge: '피크닉 보냉',
    category: '여름 휴가용품',
    description: '보냉백 아이스박스 추천 기준을 용량, 단열 두께, 어깨끈, 세척 편의성 중심으로 정리해 7월 말 외출 준비에 맞췄습니다.',
    hero: '/images/cooler-box-budget-top3-thumbnail.png',
    intro: '7월 말 외출에서는 음료 한두 병도 금방 미지근해집니다. 보냉백과 아이스박스는 큰 용량보다 실제 이동 시간, 들고 다닐 사람, 씻기 쉬운 구조가 더 중요합니다.',
    needs: ['도시락과 음료가 함께 들어가는 실제 수납량', '바닥 처짐을 줄이는 보강 구조', '물기와 냄새를 닦기 쉬운 안감'],
    tips: ['반나절 외출은 보냉백, 차량 이동 캠핑은 하드 아이스박스가 편합니다.', '얼음팩을 세워 넣을 수 있는 폭인지 확인하세요.', '어깨끈이 얇으면 내용물이 많을 때 이동 피로가 큽니다.'],
    tags: ['#보냉백추천', '#아이스박스추천', '#피크닉준비물']
  },
  {
    slug: 'car-sunshade-late-july-guide',
    dataFile: 'coupang-july-car-sunshade.json',
    productType: 'late_july_car_sunshade',
    title: '차량용 햇빛가리개 추천, 7월 말 주차 후 실내 열기 줄이는 기준',
    keyword: '차량용 햇빛가리개 추천',
    badge: '차량 폭염',
    category: '여름 차량용품',
    description: '차량용 햇빛가리개 추천 기준을 앞유리 크기, 접이식 구조, 흡착 방식, 보관 편의성 중심으로 정리했습니다.',
    hero: '/images/car-cooling-seat-top3-thumbnail.png',
    intro: '한낮에 차를 세워두면 핸들과 시트가 뜨거워져 바로 운전하기 불편합니다. 차량용 햇빛가리개는 냉방을 대신하지는 않지만, 직사광선을 먼저 막아 탑승 직후의 부담을 줄여줍니다.',
    needs: ['차종 앞유리 폭과 높이에 맞는 사이즈', '우산형, 접이식, 롤형 중 보관 방식 선택', '대시보드와 내비게이션을 가리는 실제 커버 범위'],
    tips: ['SUV와 경차는 같은 제품도 빈틈이 다르게 생깁니다.', '흡착판 방식은 여름 열기에 떨어질 수 있어 후기 확인이 필요합니다.', '매일 접고 펼 제품이라면 보관 파우치가 있는 편이 편합니다.'],
    tags: ['#차량용햇빛가리개', '#여름차량용품', '#폭염대비']
  },
  {
    slug: 'food-waste-odor-control-late-july-guide',
    dataFile: 'coupang-july-food-waste-odor.json',
    productType: 'late_july_food_waste_odor',
    title: '음식물쓰레기 냄새 차단 제품, 7월 말 주방 냄새 줄이는 현실 기준',
    keyword: '음식물쓰레기 냄새 차단',
    badge: '여름 주방',
    category: '생활용품',
    description: '음식물쓰레기 냄새 차단 제품을 밀폐력, 세척 편의성, 탈취 방식, 보관 위치 기준으로 비교하는 글입니다.',
    hero: '/images/coupang-kitchen-best-top10-thumbnail.png',
    intro: '7월 말 주방 냄새는 음식물쓰레기를 오래 두지 않는 것이 기본입니다. 그래도 매번 바로 버리기 어렵다면 밀폐통, 탈취제, 전용 봉투처럼 냄새가 퍼지는 시간을 늦추는 제품이 도움이 됩니다.',
    needs: ['뚜껑 패킹과 잠금 구조의 밀폐력', '물때가 남지 않는 분리 세척 구조', '싱크대 아래나 베란다에 맞는 크기'],
    tips: ['탈취제만으로 냄새를 없애기보다 밀폐와 배출 주기를 같이 잡아야 합니다.', '국물 많은 음식물은 물기를 먼저 줄이면 냄새와 벌레 부담이 줄어듭니다.', '통 내부가 복잡하면 여름에는 세척 피로가 커집니다.'],
    tags: ['#음식물쓰레기냄새', '#주방냄새차단', '#여름생활용품']
  },
  {
    slug: 'mold-remover-moisture-absorber-late-july-guide',
    dataFile: 'coupang-july-mold-dehumidifier.json',
    productType: 'late_july_mold_dehumidifier',
    title: '장마철 제습제 곰팡이 제거제 추천, 7월 말 집안 습기 관리 기준',
    keyword: '장마철 제습제 곰팡이 제거제',
    badge: '장마 습기',
    category: '장마 생활용품',
    description: '장마철 제습제 곰팡이 제거제 추천 기준을 공간별 습기, 욕실 곰팡이, 옷장 관리, 환기 루틴 중심으로 정리했습니다.',
    hero: '/images/moisture-absorber-top3-thumbnail.png',
    intro: '7월 말에는 비가 그친 뒤에도 옷장, 신발장, 욕실 줄눈에 습기가 남습니다. 제습제와 곰팡이 제거제는 같은 용도가 아니므로 공간별로 나눠 고르는 편이 안전합니다.',
    needs: ['옷장, 신발장, 욕실처럼 공간을 나눠 선택', '젤형, 걸이형, 통형 제습제의 교체 주기', '곰팡이 제거제의 사용 가능 표면과 환기 조건'],
    tips: ['곰팡이 제거제는 혼합 사용을 피하고 표기된 환기 조건을 지켜야 합니다.', '제습제는 물이 찬 뒤 방치하면 효과가 떨어집니다.', '욕실은 제품 사용보다 건조와 환기 루틴이 같이 가야 합니다.'],
    tags: ['#장마철제습제', '#곰팡이제거제', '#습기관리']
  },
  {
    slug: 'nike-air-force-1-review-popular-guide',
    dataFile: 'coupang-nike-air-force-1.json',
    productType: 'nike_air_force_1_review',
    title: '나이키 에어포스 1 후기 많은 제품 볼 때, 사이즈와 착화감 먼저 보는 법',
    keyword: '나이키 에어포스 1 후기',
    badge: '나이키 인기화',
    category: '신발 후기 체크',
    intro: '에어포스 1은 데일리 코디용으로 찾는 사람이 많아 후기량이 많은 편입니다. 다만 인기 모델일수록 색상, 소재, 판매처가 다양해 같은 이름이라도 착화감과 사이즈 선택이 달라질 수 있습니다.',
    needs: ['정사이즈와 반업 후기를 함께 확인', '가죽 주름과 무게감에 대한 최신 후기', '화이트 계열은 오염 관리 난이도'],
    tips: ['후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요.', '발볼이 넓다면 같은 모델의 남성, 여성, 키즈 표기를 구분하세요.', '가격보다 판매자, 배송, 반품 조건을 같이 보세요.'],
    tags: ['#나이키에어포스1', '#나이키운동화후기', '#스니커즈추천']
  },
  {
    slug: 'nike-air-max-review-popular-guide',
    dataFile: 'coupang-nike-air-max.json',
    productType: 'nike_air_max_review',
    title: '나이키 에어맥스 후기 많은 제품 고를 때, 쿠션감과 무게감 체크',
    keyword: '나이키 에어맥스 후기',
    badge: '쿠션 운동화',
    category: '신발 후기 체크',
    intro: '에어맥스 라인은 쿠션감 때문에 찾는 사람이 많지만 모델별로 실루엣과 무게감 차이가 큽니다. 오래 걷는 용도인지, 코디용인지에 따라 봐야 할 후기가 달라집니다.',
    needs: ['뒤꿈치 쿠션감과 발목 안정감', '장시간 보행 시 무게감 후기', '갑피 통풍과 여름 착용감'],
    tips: ['후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요.', '에어 유닛이 있는 모델은 소음, 내구성 후기를 같이 보세요.', '운동용과 패션용을 구분해 선택하는 편이 좋습니다.'],
    tags: ['#나이키에어맥스', '#나이키운동화후기', '#쿠션운동화']
  },
  {
    slug: 'nike-court-vision-review-popular-guide',
    dataFile: 'coupang-nike-court-vision.json',
    productType: 'nike_court_vision_review',
    title: '나이키 코트 비전 후기 많은 제품, 데일리화로 보기 전 체크할 점',
    keyword: '나이키 코트 비전 후기',
    badge: '데일리 스니커즈',
    category: '신발 후기 체크',
    intro: '코트 비전은 깔끔한 농구화형 디자인 때문에 데일리화 후보로 자주 올라옵니다. 비슷한 흰색 스니커즈가 많아 후기에서는 사이즈, 무게, 발등 압박을 우선 봐야 합니다.',
    needs: ['발등 압박과 끈 조절 여유', '밑창 접지와 실내외 착용감', '흰색 갑피의 오염 관리 후기'],
    tips: ['후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요.', '발등이 높은 편이면 착화 사진 후기를 꼭 보세요.', '데일리화는 디자인보다 하루 착용 피로가 더 중요합니다.'],
    tags: ['#나이키코트비전', '#데일리운동화', '#나이키후기']
  },
  {
    slug: 'nike-revolution-review-popular-guide',
    dataFile: 'coupang-nike-revolution.json',
    productType: 'nike_revolution_review',
    title: '나이키 레볼루션 후기 많은 러닝화, 출퇴근 걷기용으로 볼 기준',
    keyword: '나이키 레볼루션 후기',
    badge: '러닝 입문',
    category: '신발 후기 체크',
    intro: '레볼루션은 러닝 입문, 걷기, 출퇴근용으로 찾는 사람이 많습니다. 전문 러닝화처럼 보기보다 가벼움, 통풍, 가격대의 균형을 보는 편이 현실적입니다.',
    needs: ['가벼운 착화감과 갑피 통풍', '발볼 여유와 앞코 공간', '비 오는 날 미끄럼 후기'],
    tips: ['후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요.', '러닝 기록용보다 일상 걷기용인지 먼저 정하세요.', '쿠션이 너무 말랑하면 오래 걸을 때 피로가 다르게 느껴질 수 있습니다.'],
    tags: ['#나이키레볼루션', '#러닝화후기', '#걷기운동화']
  },
  {
    slug: 'nike-dunk-low-review-popular-guide',
    dataFile: 'coupang-nike-dunk-low.json',
    productType: 'nike_dunk_low_review',
    title: '나이키 덩크 로우 후기 많은 색상 볼 때, 정품과 사이즈 체크 기준',
    keyword: '나이키 덩크 로우 후기',
    badge: '인기 스니커즈',
    category: '신발 후기 체크',
    intro: '덩크 로우는 색상과 발매 버전이 많아 후기량이 많은 제품을 보더라도 옵션 확인이 중요합니다. 사진만 보고 고르기보다 색상명, 사이즈 표기, 판매 조건을 같이 봐야 합니다.',
    needs: ['색상명과 모델 코드 확인', '발볼과 발등 기준 사이즈 후기', '판매자, 배송, 반품 조건'],
    tips: ['후기 많은 편인지 확인할 때는 상세 페이지의 리뷰 수와 최신 후기를 다시 확인하세요.', '인기 색상은 옵션별 가격 차이가 큽니다.', '정품 여부는 상세 정보와 구매자 후기를 함께 확인하세요.'],
    tags: ['#나이키덩크로우', '#나이키스니커즈', '#운동화후기']
  }
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function isNikePage(page) {
  return page.slug.startsWith('nike-');
}

function hasAuthenticNikeWording(productName) {
  return authenticNikePattern.test(String(productName || ''));
}

function readProducts(fileName, page) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', fileName), 'utf8'));
  const seen = new Set();
  const products = (data.items || [])
    .filter((item) => item.productUrl && item.productImage)
    .filter((item) => !isNikePage(page) || hasAuthenticNikeWording(item.productName))
    .filter((item) => {
      const key = item.productId || item.productUrl;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  if (isNikePage(page) && products.length === 0) {
    throw new Error(`${page.slug} has no Nike products with explicit authentic wording`);
  }

  return products;
}

function formatPrice(price) {
  if (!Number.isFinite(Number(price))) return '상세 페이지 확인';
  return `${Number(price).toLocaleString('ko-KR')}원대`;
}

function productLabel(page, index) {
  if (page.slug.startsWith('nike-')) {
    return `${page.keyword.replace(' 후기', '')} 인기 후보 ${index + 1}`;
  }
  return `${page.keyword} 후보 ${index + 1}`;
}

function productCards(page, products) {
  return products.map((product, index) => {
    const label = productLabel(page, index);
    const displayName = isNikePage(page) ? product.productName : label;
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(product.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">
                    <img src="${escapeHtml(product.productImage)}" alt="${escapeHtml(label)}" width="420" height="420" loading="lazy">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${index + 1}번 후보</span>
                  <h3>${escapeHtml(displayName)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(formatPrice(product.productPrice))}</strong></div>
                  <div class="product-detail-specs"><strong>먼저 볼 점</strong>: ${isNikePage(page) ? '상품명에 정품 표기가 있는 후보입니다. 상세 페이지에서 판매자, 배송, 최신 후기, 교환 조건을 다시 확인하세요.' : '상세 페이지에서 옵션, 배송, 최신 후기, 교환 조건을 같이 확인하세요.'}</div>
                  <p class="product-detail-desc">${escapeHtml(page.tips[index % page.tips.length])}</p>
                  <a class="product-detail-btn" href="${escapeHtml(product.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">현재 가격과 후기 보기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function renderPage(page) {
  const products = readProducts(page.dataFile, page);
  const first = products[0] || {};
  const heroImage = first.productImage || page.hero || '/blog/images/blog-home-og.jpg';
  const canonical = `${site}/blog/${page.slug}.html`;
  const description = page.description || `${page.keyword}를 찾는 분들을 위해 쿠팡 상품명에 정품 표기가 있는 후보 중심으로 사이즈, 착화감, 가격, 배송 조건을 정리했습니다.`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description,
    image: { '@type': 'ImageObject', url: heroImage.startsWith('/') ? `${site}${heroImage}` : heroImage, width: 1200, height: 630 },
    thumbnailUrl: heroImage.startsWith('/') ? `${site}${heroImage}` : heroImage,
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
    keywords: [page.keyword, ...page.tags.map((tag) => tag.replace('#', ''))].join(', ')
  };

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-9914349640032484">
  <title>${escapeHtml(page.title)} | 골드픽</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(heroImage.startsWith('/') ? `${site}${heroImage}` : heroImage)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(heroImage.startsWith('/') ? `${site}${heroImage}` : heroImage)}">
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
        <div class="blog-mobile-title">${escapeHtml(page.keyword)}</div>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">${escapeHtml(page.category)}</p>
        <div class="blog-title">${escapeHtml(page.keyword)}</div>
        <p class="blog-intro">${escapeHtml(description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/">홈</a>
        <a href="/blog/${page.slug}.html">${escapeHtml(page.badge)}</a>
        <a href="/blog/mbti-16-vs-64-personality-types.html">성격 테스트</a>
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
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.keyword)} 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>7월 말 수요가 높은 상품을 후기 체크 기준으로 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#why">왜 지금 필요한가 <span>상황</span></a>
              <a href="#criteria">고르는 기준 <span>체크</span></a>
              <a href="#products">후보 보기 <span>쿠팡</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>${escapeHtml(page.category)}</span></div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${escapeHtml(page.badge)}</span><br>
            ${escapeHtml(page.intro)}
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.keyword)} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(first.productUrl || '#')}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.keyword)} 상품 이미지" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">후기 체크 후보</span>
              <strong>${escapeHtml(isNikePage(page) ? first.productName : productLabel(page, 0))}</strong>
              <p>${escapeHtml(page.tips[0])}</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(first.productUrl || '#')}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">후기와 가격 보기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.keyword)} 대표 상품 이미지" width="657" height="657">
            <figcaption>검색 결과와 후기는 시점에 따라 달라질 수 있으므로 구매 전 상세 페이지에서 최신 정보를 확인하세요.</figcaption>
          </figure>

          <div class="article-body">
            <p class="article-lead">${escapeHtml(page.intro)}</p>

            <h2 id="why">${escapeHtml(page.keyword)}를 지금 보는 이유</h2>
            <p>7월 말은 폭염, 장마 뒤 습기, 휴가 이동이 겹치는 시기입니다. 이때는 단순히 저렴한 상품보다 실제 사용 상황에서 불편을 줄여주는지 확인하는 편이 실패 확률을 낮춥니다.</p>
            ${isNikePage(page) ? '<p><strong>쿠팡 상품명에 정품 표기가 있는 후보만 골랐습니다.</strong> 정품 표기는 상품명과 상세 페이지 기준이며, 구매 전 판매자와 상세 정보를 다시 확인하세요.</p>' : ''}

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              <iframe src="${carouselSrc}" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="criteria">고르기 전에 볼 기준</h2>
            <div class="article-choice-grid">
${page.needs.map((need) => `              <section class="article-choice-card"><h3>체크 포인트</h3><p>${escapeHtml(need)}</p></section>`).join('\n')}
            </div>
            <ul>
${page.tips.map((tip) => `              <li>${escapeHtml(tip)}</li>`).join('\n')}
            </ul>

            <h2 id="products">${escapeHtml(page.keyword)} 후보 보기</h2>
            <p>아래 후보는 2026년 7월 23일 쿠팡 파트너스 검색 결과를 바탕으로 연결했습니다. ${isNikePage(page) ? '나이키 상품은 상품명에 정품 표기가 있는 후보만 남겼습니다. ' : ''}가격, 배송, 옵션, 리뷰 수는 계속 바뀔 수 있습니다.</p>
            <div class="product-detail-list">
${productCards(page, products)}
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
            <h2>관련 태그</h2>
            <div class="blog-tag-list">${page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          </section>
        </div>
      </aside>
    </main>
  </div>
</body>
</html>
`;
}

function renderIndexCard(page) {
  const products = readProducts(page.dataFile, page);
  const heroImage = products[0]?.productImage || page.hero || '/blog/images/blog-home-og.jpg';
  return `          <article class="blog-card" data-blog-category="life summer goods">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.keyword)} 대표 이미지" loading="lazy">
                <span class="blog-card-badge">${escapeHtml(page.badge)}</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">${escapeHtml(page.category)} · ${dateText}</div>
                <h3>${escapeHtml(page.title)}</h3>
                <p>${escapeHtml(page.description || page.intro)}</p>
                <div class="blog-card-tags">${page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
              </div>
            </a>
          </article>`;
}

function updateIndex() {
  const filePath = path.join(root, 'index.html');
  let html = fs.readFileSync(filePath, 'utf8');
  for (const page of pages) {
    const cardPattern = new RegExp(`\\s*<article class="blog-card" data-blog-category="life summer goods">\\s*<a href="/blog/${page.slug}\\.html"[\\s\\S]*?\\s*</article>\\r?\\n`, 'g');
    html = html.replace(cardPattern, '\n');
  }

  const cards = pages.map(renderIndexCard).join('\n');
  const mbtiCard = '          <article class="blog-card" data-blog-category="test life">';
  if (html.includes(mbtiCard)) {
    html = html.replace(mbtiCard, `${cards}\n${mbtiCard}`);
  } else {
    html = html.replace(/(\s*<div class="blog-card-list">\r?\n)/, `$1${cards}\n`);
  }
  fs.writeFileSync(filePath, html, 'utf8');
}

function updateSitemap() {
  const filePath = path.join(root, 'sitemap.xml');
  let xml = fs.readFileSync(filePath, 'utf8');
  const entries = pages
    .filter((page) => !xml.includes(`${site}/blog/${page.slug}.html`))
    .map((page) => `  <url>\n    <loc>${site}/blog/${page.slug}.html</loc>\n    <lastmod>${date}</lastmod>\n    <priority>0.7</priority>\n  </url>`)
    .join('\n');
  if (!entries) return;

  xml = xml.replace('</urlset>', `${entries}\n</urlset>`);
  fs.writeFileSync(filePath, xml, 'utf8');
}

function main() {
  for (const page of pages) {
    fs.writeFileSync(path.join(root, 'blog', `${page.slug}.html`), renderPage(page), 'utf8');
  }
  updateIndex();
  updateSitemap();
}

main();
