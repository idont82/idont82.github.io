const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-02';
const dateText = '2026.07.02';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const pages = [
  {
    slug: 'rainy-commute-essentials-guide',
    data: 'coupang-news-rainy-commute.json',
    productType: 'rainy_commute',
    category: '뉴스 연계 생활용품',
    badge: '장마 출근',
    shortTitle: '장마 출근 준비물',
    keyword: '장마 출근 준비물',
    subKeywords: ['폭우 대비 용품', '레인부츠 우산 방수팩', '직장인 장마 준비'],
    titles: [
      '장마 출근 준비물, 폭우 뉴스 보고 바로 챙길 5가지 기준',
      '출근길 젖은 신발이 걱정될 때 보는 장마 출근 준비물',
      '장마 출근 준비물 추천 전 우산·신발·가방 방수부터 확인하세요'
    ],
    description: '폭우와 장마 뉴스가 잦을 때 직장인이 챙기면 좋은 장마 출근 준비물을 우산, 신발 방수, 가방 방수, 휴대성 기준으로 정리했습니다.',
    opener: '아침에 창밖이 어두우면 출근 전부터 마음이 무거워지죠. 우산 하나만 들고 나갔다가 신발과 가방까지 젖으면 하루가 길어져요. 그래서 장마 출근 준비물은 예쁜 디자인보다 실제로 덜 젖고, 덜 번거롭고, 회사에 도착해서 정리하기 쉬운지가 먼저예요.',
    why: '폭우가 반복되는 시기에는 이동 시간이 짧아도 젖는 부위가 달라져요. 우산은 머리와 어깨를 막아주지만 발등, 바짓단, 가방 바닥은 따로 대비해야 합니다. 장마 출근 준비물을 고를 때는 큰 우산 하나보다 신발 방수, 가방 방수, 젖은 물건 보관까지 나눠 보는 편이 실패가 적어요.',
    criteria: [
      '우산은 지름보다 접었을 때 길이와 무게를 먼저 보세요. 매일 들고 다니기 무거우면 결국 안 챙기게 됩니다.',
      '레인부츠가 부담스럽다면 신발 방수커버처럼 회사 도착 후 벗어 정리할 수 있는 제품도 현실적이에요.',
      '노트북이나 서류를 들고 다니면 가방 방수커버나 방수 파우치가 우산보다 더 중요할 때가 있어요.'
    ],
    caution: '**침수된 길이나 물살이 있는 도로는 용품으로 해결할 문제가 아니에요.** 신발이 젖는 불편함보다 안전이 먼저라서, 우회하거나 대중교통 운행 정보를 확인하는 편이 좋습니다.',
    close: '장마 출근 준비물은 거창한 장비가 아니라 내 아침을 덜 지치게 만드는 작은 장치에 가까워요. 올여름에는 젖은 신발로 하루를 버티는 일이 조금 줄어들었으면 해요.',
    sources: [
      ['기상청 날씨누리', 'https://www.weather.go.kr/'],
      ['행정안전부 국민재난안전포털', 'https://www.safekorea.go.kr/']
    ],
    tags: ['#장마출근준비물', '#폭우대비용품', '#레인부츠']
  },
  {
    slug: 'rainy-season-home-dehumidifying-guide',
    data: 'coupang-news-rainy-dehumidify.json',
    productType: 'rainy_dehumidifying',
    category: '뉴스 연계 생활용품',
    badge: '장마 제습',
    shortTitle: '장마철 제습',
    keyword: '장마철 제습기 추천',
    subKeywords: ['빨래 냄새 제거', '옷장 제습제', '원룸 습기 관리'],
    titles: [
      '장마철 제습기 추천, 집이 눅눅해질 때 먼저 볼 기준',
      '빨래 냄새가 올라온다면 장마철 제습기 추천 전 체크할 것',
      '장마철 제습기 추천보다 중요한 방 크기·물통·소음 기준'
    ],
    description: '장마철 제습기 추천을 찾는 분들을 위해 원룸, 욕실, 옷장, 빨래 건조 상황별로 제습기와 제습제를 고르는 기준을 정리했습니다.',
    opener: '비가 며칠만 이어져도 집 안 공기가 무거워져요. 빨래는 마른 것 같은데 냄새가 남고, 옷장 문을 열 때 눅눅한 느낌이 올라오면 괜히 기운도 빠지죠. 장마철 제습기 추천 글을 보기 전에는 우리 집에서 습기가 어디에 쌓이는지 먼저 보는 게 좋아요.',
    why: '제습은 방 전체의 습도를 낮추는 방식과 옷장·신발장처럼 좁은 공간을 관리하는 방식이 달라요. 원룸 빨래 건조에는 제습기 물통 용량과 연속 배수 여부가 중요하고, 옷장이나 서랍에는 제습제가 더 간단할 수 있습니다. 장마철 제습기 추천 제품을 볼 때도 방 크기, 소음, 전기 사용량을 같이 비교해야 해요.',
    criteria: [
      '원룸이나 침실용은 하루 제습량과 물통 용량을 같이 보세요. 물통이 너무 작으면 자주 비워야 해서 번거롭습니다.',
      '빨래 건조가 목적이면 송풍 방향, 연속 배수, 이동 바퀴처럼 실제 사용 편의가 중요해요.',
      '옷장·신발장·욕실장처럼 좁은 공간은 전기식 제습기보다 제습제 여러 개가 더 효율적일 수 있어요.'
    ],
    caution: '**곰팡이가 이미 넓게 번졌다면 제습만으로 끝나지 않을 수 있어요.** 청소, 환기, 누수 확인을 함께 해야 다시 생기는 일을 줄일 수 있습니다.',
    close: '장마철 제습기 추천은 비싼 제품을 고르는 일이 아니라 우리 집 습기 지점을 정확히 찾는 일에서 시작해요. 눅눅한 집이 조금 보송해지면 하루의 피로도 확실히 덜해집니다.',
    sources: [
      ['기상청 날씨누리', 'https://www.weather.go.kr/'],
      ['한국소비자원', 'https://www.kca.go.kr/']
    ],
    tags: ['#장마철제습기추천', '#빨래냄새제거', '#제습제']
  },
  {
    slug: 'school-zone-safety-goods-guide',
    data: 'coupang-news-school-safety.json',
    productType: 'school_zone_safety',
    category: '뉴스 연계 육아용품',
    badge: '등하굣길 안전',
    shortTitle: '등하굣길 안전용품',
    keyword: '어린이 등하굣길 안전용품',
    subKeywords: ['초등학생 안전용품', '반사 키링', '어린이 호루라기'],
    titles: [
      '어린이 등하굣길 안전용품, 학교 앞 뉴스 볼 때 체크할 것',
      '초등학생 가방에 붙이기 좋은 어린이 등하굣길 안전용품 기준',
      '어린이 등하굣길 안전용품 추천 전 반사·소리·위치 확인하기'
    ],
    description: '학교 앞 안전 이슈가 걱정될 때 가방에 부담 없이 더할 수 있는 어린이 등하굣길 안전용품을 반사재, 호루라기, 사용 습관 기준으로 정리했습니다.',
    opener: '학교 앞 뉴스가 나오면 부모 마음은 금방 불안해져요. 아이에게 겁을 주고 싶지는 않지만, 혼자 걷는 길이 조금 더 눈에 띄고 도움을 요청하기 쉬웠으면 하는 마음이 들죠. 어린이 등하굣길 안전용품은 아이가 매일 부담 없이 쓰는지가 가장 중요해요.',
    why: '안전용품은 아이가 실제로 착용하고 사용할 수 있어야 의미가 있어요. 반사 키링은 비 오는 날이나 흐린 날 가방을 더 잘 보이게 만들고, 호루라기는 큰 소리로 도움을 요청하기 어려운 상황에서 보조가 될 수 있습니다. 어린이 등하굣길 안전용품을 고를 때는 기능보다 아이가 거부감 없이 달고 다닐 디자인과 무게를 먼저 봐야 해요.',
    criteria: [
      '가방에 다는 제품은 너무 크거나 무겁지 않은지 확인하세요. 불편하면 아이가 빼놓고 다닐 수 있어요.',
      '반사 키링은 자동차 불빛에 잘 보이는 위치, 특히 가방 옆면이나 아래쪽에 달기 쉬운 구조가 좋습니다.',
      '호루라기나 알림용품은 부모가 먼저 사용법을 알려주고, 장난으로 반복 사용하지 않도록 약속을 정해야 해요.'
    ],
    caution: '**안전용품이 보호자의 지도와 안전한 통학로 선택을 대신할 수는 없어요.** 아이와 실제 길을 걸으며 위험한 골목, 횡단보도, 기다릴 장소를 함께 확인하는 과정이 필요합니다.',
    close: '어린이 등하굣길 안전용품은 불안을 키우기 위한 물건이 아니라 아이가 도움을 요청할 수 있는 작은 선택지를 늘리는 도구예요. 오늘 한 번 가방 위치부터 같이 봐주세요.',
    sources: [
      ['도로교통공단', 'https://www.koroad.or.kr/'],
      ['행정안전부 국민재난안전포털', 'https://www.safekorea.go.kr/']
    ],
    tags: ['#어린이등하굣길안전용품', '#초등학생안전용품', '#반사키링']
  },
  {
    slug: 'long-period-comfort-goods-guide',
    data: 'coupang-news-period-comfort.json',
    productType: 'period_comfort',
    category: '뉴스 연계 여성용품',
    badge: '여성 건강',
    shortTitle: '생리 기간 편의용품',
    keyword: '생리 오래할 때',
    subKeywords: ['오버나이트 생리대', '생리 기간 외출', '생리통 온열찜질'],
    titles: [
      '생리 오래할 때, 제품보다 먼저 확인해야 할 몸의 신호',
      '생리 오래할 때 외출과 수면을 덜 불안하게 하는 편의용품',
      '생리 오래할 때 오버나이트 생리대 고르기 전 체크할 기준'
    ],
    description: '생리 오래할 때 불안한 분들을 위해 진료가 필요한 신호와 외출·수면을 덜 불편하게 만드는 오버나이트 생리대, 온열용품 선택 기준을 정리했습니다.',
    opener: '생리가 예상보다 길어지면 몸도 마음도 지쳐요. 혹시 문제가 있는 건 아닐까 걱정되면서도 당장 출근, 등교, 약속은 이어져서 더 난감하죠. 생리 오래할 때는 편의용품을 고르기 전에 내 몸의 신호를 먼저 확인해줘야 해요.',
    why: '생리 기간과 양은 사람마다 다르지만, 평소와 확연히 다르게 길어지거나 양이 많아지면 생활용품만으로 넘기지 않는 편이 좋습니다. 외출이나 수면 중 불안을 줄이는 데는 오버나이트 생리대, 입는 형태의 제품, 온열찜질팩이 도움이 될 수 있어요. 다만 생리 오래할 때 검색으로 제품만 바꾸는 것보다 증상 변화를 기록하는 습관이 더 중요합니다.',
    criteria: [
      '수면용은 길이만 보지 말고 샘 방지 구조와 피부에 닿는 소재를 같이 보세요.',
      '외출용은 파우치에 들어가는 부피, 교체 주기, 냄새 밀폐가 가능한 봉투까지 같이 준비하면 마음이 편해져요.',
      '온열용품은 직접 피부에 오래 붙이지 말고, 저온화상 주의 문구와 사용 시간을 꼭 확인하세요.'
    ],
    caution: '**생리 오래할 때 과다출혈, 심한 통증, 어지럼, 큰 혈괴, 임신 가능성이 있으면 제품 구매보다 진료가 먼저예요.** 이 글은 생활 편의를 돕는 기준이지 진단이나 치료 조언이 아닙니다.',
    close: '생리 오래할 때 필요한 건 참으라는 말이 아니라 몸을 덜 불안하게 돌볼 수 있는 준비예요. 편의용품은 보조로 두고, 평소와 다른 신호가 있으면 꼭 진료를 우선해 주세요.',
    sources: [
      ['질병관리청 국가건강정보포털', 'https://health.kdca.go.kr/'],
      ['Mayo Clinic Heavy menstrual bleeding', 'https://www.mayoclinic.org/diseases-conditions/menorrhagia/symptoms-causes/syc-20352829']
    ],
    tags: ['#생리오래할때', '#오버나이트생리대', '#여성건강']
  },
  {
    slug: 'soccer-watch-party-essentials-guide',
    data: 'coupang-news-soccer-watch.json',
    productType: 'soccer_watch_party',
    category: '뉴스 연계 집관용품',
    badge: '축구 집관',
    shortTitle: '축구 집관 준비물',
    keyword: '축구 집관 준비물',
    subKeywords: ['월드컵 집관', '미니빔 프로젝터', '스포츠 응원용품'],
    titles: [
      '축구 집관 준비물, 방송 뉴스 보고 경기 전 챙길 기준',
      '월드컵 집관을 크게 보고 싶다면 축구 집관 준비물부터 확인하세요',
      '축구 집관 준비물 추천 전 화면·소리·간식 동선을 먼저 보세요'
    ],
    description: '축구 중계와 방송 뉴스가 많아질 때 집에서 경기를 편하게 보려는 분들을 위해 축구 집관 준비물을 화면, 소리, 좌석, 간식 동선 기준으로 정리했습니다.',
    opener: '큰 경기 중계가 잡히면 집에서도 괜히 분위기를 내고 싶어져요. 그런데 막상 경기 시작 직전에 화면 연결이 안 되거나 소리가 작거나, 간식 동선이 엉키면 집중이 흐트러집니다. 축구 집관 준비물은 비싼 장비보다 경기 시작 전에 바로 쓸 수 있는지가 먼저예요.',
    why: '집관은 TV나 프로젝터 하나로 끝나지 않아요. 화면 크기, 스피커 위치, 가족이나 이웃에게 방해되지 않는 볼륨, 앉는 자리, 간식 테이블까지 한 번에 맞아야 편합니다. 축구 집관 준비물을 고를 때는 미니빔 프로젝터처럼 눈에 띄는 제품도 좋지만, 연결 방식과 방 밝기를 먼저 확인해야 해요.',
    criteria: [
      '미니빔은 밝기, 자동 초점, HDMI나 무선 미러링 지원 여부를 먼저 보세요.',
      '스피커나 사운드바는 출력보다 늦은 밤에 낮은 볼륨으로도 대사가 또렷한지가 중요합니다.',
      '간식과 음료는 소파 옆 작은 테이블이나 쿨러백처럼 중간에 일어나지 않아도 되는 동선으로 준비하세요.'
    ],
    caution: '**공동주택에서는 늦은 시간 함성과 저음이 생각보다 크게 전달될 수 있어요.** 경기 분위기도 좋지만, 볼륨과 바닥 진동은 미리 조절하는 편이 좋습니다.',
    close: '축구 집관 준비물은 경기를 더 크게 소비하기 위한 물건이 아니라, 같이 보는 사람들의 시간을 덜 번거롭게 만드는 준비예요. 시작 30분 전 연결만 확인해도 집관 만족도가 달라집니다.',
    sources: [
      ['FIFA', 'https://www.fifa.com/'],
      ['KBS 스포츠', 'https://sports.kbs.co.kr/']
    ],
    tags: ['#축구집관준비물', '#월드컵집관', '#미니빔프로젝터']
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readProducts(fileName) {
  const filePath = path.join(root, 'data', fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return (data.items || [])
    .filter((product) => product.keyword !== 'Gold box')
    .filter((product) => !/강아지|펫카소|반려|애완/.test(product.productName || ''))
    .slice(0, 4);
}

function priceLabel(product) {
  return product.priceLabel || (product.productPrice ? `${Number(product.productPrice).toLocaleString('ko-KR')}원` : '가격 확인 필요');
}

function productUrl(product, page) {
  if (product && product.productUrl) {
    return product.productUrl;
  }
  return `https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=${page.productType}&pageKey=${encodeURIComponent(page.keyword)}`;
}

function productImage(product) {
  return product.productImage || '/images/favicon.png';
}

function sourceList(page) {
  return page.sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join('\n                ');
}

function productCards(page, products) {
  return products.map((product, index) => {
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
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: ${escapeHtml(page.shortTitle)} 상황에 맞는 구성, 크기, 보관 편의성을 함께 보세요.</div>
                  <p class="product-detail-desc">뉴스를 보고 급하게 사기보다, 본문 기준에 맞춰 내 생활 동선에 맞는지 확인하는 용도로 보세요.</p>
                  <a class="product-detail-btn" href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function article(page) {
  const products = readProducts(page.data);
  const first = products[0] || {};
  const heroImage = productImage(first);
  const canonical = `${site}/blog/${page.slug}.html`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.titles[0],
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
    keywords: [page.keyword, ...page.subKeywords].join(', ')
  };
  const mobileUrl = productUrl(first, page);
  const mobileName = first.productName || `${page.shortTitle} 참고 상품`;

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
  <title>${escapeHtml(page.titles[0])} | 골드픽</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.titles[0])}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(heroImage)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.titles[0])}">
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
          <a href="/blog/rainy-commute-essentials-guide.html" data-blog-path="/blog/rainy-commute-essentials-guide.html">장마 출근</a>
          <a href="/blog/rainy-season-home-dehumidifying-guide.html" data-blog-path="/blog/rainy-season-home-dehumidifying-guide.html">장마 제습</a>
          <a href="/blog/school-zone-safety-goods-guide.html" data-blog-path="/blog/school-zone-safety-goods-guide.html">등하굣길 안전</a>
          <a href="/blog/long-period-comfort-goods-guide.html" data-blog-path="/blog/long-period-comfort-goods-guide.html">생리 기간</a>
          <a href="/blog/soccer-watch-party-essentials-guide.html" data-blog-path="/blog/soccer-watch-party-essentials-guide.html">축구 집관</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">News Trend Product Note</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/rainy-commute-essentials-guide.html" data-blog-path="/blog/rainy-commute-essentials-guide.html">장마 출근</a>
        <a href="/blog/rainy-season-home-dehumidifying-guide.html" data-blog-path="/blog/rainy-season-home-dehumidifying-guide.html">장마 제습</a>
        <a href="/blog/school-zone-safety-goods-guide.html" data-blog-path="/blog/school-zone-safety-goods-guide.html">등하굣길 안전</a>
        <a href="/blog/long-period-comfort-goods-guide.html" data-blog-path="/blog/long-period-comfort-goods-guide.html">생리 기간</a>
        <a href="/blog/soccer-watch-party-essentials-guide.html" data-blog-path="/blog/soccer-watch-party-essentials-guide.html">축구 집관</a>
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
            <img class="blog-avatar" src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>뉴스에서 떠오른 생활 고민을 제품 선택 기준으로 차분하게 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#title-options">제목 후보 <span>3개</span></a>
              <a href="#why">왜 필요한가 <span>상황 분석</span></a>
              <a href="#criteria">고르는 법 <span>3가지</span></a>
              <a href="#products">참고 상품 <span>쿠팡</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · ${escapeHtml(page.category)}</span></div>
          <h1 class="blog-article-title">${escapeHtml(page.titles[0])}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${escapeHtml(page.keyword)}</span><br>
            뉴스에서 같은 고민을 봤다면, 바로 결제하기보다 내 생활에서 실제로 불편한 지점을 먼저 확인해보세요.<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.subKeywords[0])}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.shortTitle)} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(mobileName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">${escapeHtml(page.shortTitle)} 참고 상품</span>
              <strong>${escapeHtml(mobileName)}</strong>
              <p>${escapeHtml(page.keyword)}을 찾는 분들이 비교 출발점으로 볼 만한 상품입니다. 가격과 구성은 구매 전 다시 확인하세요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>${escapeHtml(page.keyword)}은 뉴스 이슈보다 내 생활 상황에 맞는 기준으로 고르는 편이 좋습니다.</figcaption>
          </figure>

          <div class="article-body">
            <section id="title-options">
              <h2>제목 후보 3개</h2>
              <ul>
                ${page.titles.map((title) => `<li>${escapeHtml(title)}</li>`).join('\n                ')}
              </ul>
            </section>

            <p class="article-lead">${escapeHtml(page.opener)}</p>

            <h2 id="why">${escapeHtml(page.keyword)}이 왜 필요할까요?</h2>
            <p>${escapeHtml(page.why)}</p>

            <h2 id="criteria">속지 않고 고르는 기준 3가지</h2>
            <ul>
              ${page.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ul>
            <p>${page.caution}</p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2>제품을 볼 때는 뉴스보다 내 상황을 먼저 보세요</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>바로 사도 되는 경우</h3>
                <p>이미 같은 불편을 반복해서 겪고 있고, 보관할 공간과 사용할 사람이 분명하다면 작은 제품부터 비교해볼 만해요.</p>
              </section>
              <section class="article-choice-card">
                <h3>조금 더 봐야 하는 경우</h3>
                <p>뉴스를 보고 불안해서 찾는 중이라면 가격보다 사용 빈도, 가족 동의, 관리 편의성을 먼저 확인하는 게 좋아요.</p>
              </section>
            </div>

            <h2>참고한 공식 정보</h2>
            <p>시의성 있는 뉴스 이슈와 연결되는 글이라 공식 기관과 관련 사이트를 함께 확인했습니다. 제품은 생활 편의를 돕는 참고용으로만 보세요.</p>
            <ul class="article-source-list">
                ${sourceList(page)}
            </ul>

            <h2 id="products">${escapeHtml(page.keyword)} 참고 상품</h2>
            <p>아래 상품은 2026년 7월 2일 쿠팡 파트너스 상품 검색 기준입니다. 가격, 배송, 구성은 수시로 바뀔 수 있어 구매 전 상세 페이지에서 다시 확인하세요.</p>
            <div class="article-product-detail-list">
${productCards(page, products)}
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
  const first = readProducts(page.data)[0] || {};
  const image = productImage(first);
  return `          <article class="blog-card" data-blog-category="life">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(image)}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" loading="lazy">
                <span class="blog-card-badge">${escapeHtml(page.badge)}</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">${escapeHtml(page.category)} · ${dateText}</div>
                <h3>${escapeHtml(page.titles[0])}</h3>
                <p>${escapeHtml(page.description)}</p>
                <div class="blog-card-tags">
                  ${page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('\n                  ')}
                </div>
              </div>
            </a>
          </article>`;
}

function patchIndex() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  for (const page of pages) {
    const cardPattern = new RegExp(`\\n?\\s*<article class="blog-card" data-blog-category="life">\\n\\s*<a href="/blog/${page.slug}\\.html"[\\s\\S]*?\\n\\s*</article>`, 'g');
    html = html.replace(cardPattern, '');
    const navPattern = new RegExp(`\\n\\s*<a href="/blog/${page.slug}\\.html" data-blog-path="/blog/${page.slug}\\.html">[^<]*</a>`, 'g');
    html = html.replace(navPattern, '');
    const jsonPattern = new RegExp(`\\n?\\s*\\{\\n\\s*"@type": "BlogPosting",[\\s\\S]*?"url": "https://idont82\\.github\\.io/blog/${page.slug}\\.html",[\\s\\S]*?\\n\\s*\\},`, 'g');
    html = html.replace(jsonPattern, '');
  }

  const cards = pages.map(indexCard).join('\n');
  const healthCardAnchor = '          <article class="blog-card" data-blog-category="life">\n            <a href="/blog/bnr17-diet-probiotics-home-shopping-guide.html"';
  html = html.includes(healthCardAnchor)
    ? html.replace(healthCardAnchor, `${cards}\n${healthCardAnchor}`)
    : html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${cards}\n`);

  const navLinks = pages.map((page) => `          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${page.shortTitle}</a>`).join('\n');
  html = html.replace('          <a href="/blog/bnr17-diet-probiotics-home-shopping-guide.html"', `${navLinks}\n          <a href="/blog/bnr17-diet-probiotics-home-shopping-guide.html"`);

  const blogPostItems = pages.map((page) => {
    const first = readProducts(page.data)[0] || {};
    return `        {
          "@type": "BlogPosting",
          "headline": ${JSON.stringify(page.titles[0])},
          "url": "${site}/blog/${page.slug}.html",
          "image": ${JSON.stringify(productImage(first))},
          "datePublished": "${date}"
        },`;
  }).join('\n');
  html = html.replace('      "blogPost": [\n', `      "blogPost": [\n${blogPostItems}\n`);

  fs.writeFileSync(indexPath, html, 'utf8');
}

function patchSitemap() {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  for (const page of pages) {
    const loc = `${site}/blog/${page.slug}.html`;
    if (!xml.includes(loc)) {
      xml = xml.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
    }
  }
  fs.writeFileSync(sitemapPath, xml, 'utf8');
}

for (const page of pages) {
  fs.writeFileSync(path.join(root, 'blog', `${page.slug}.html`), article(page), 'utf8');
}
patchIndex();
patchSitemap();

console.log(pages.map((page) => `/blog/${page.slug}.html`).join('\n'));
