const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-06';
const dateText = '2026.07.06';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const pages = [
  {
    slug: 'neck-fan-summer-social-guide',
    data: 'coupang-social-neck-fan.json',
    productType: 'social_neck_fan',
    category: '소셜 계절템',
    badge: '폭염 외출템',
    shortTitle: '넥밴드 선풍기',
    keyword: '넥밴드 선풍기 추천',
    subKeywords: ['목걸이 선풍기', '휴대용 냉각 선풍기', '여름 출퇴근 필수템'],
    titles: [
      '넥밴드 선풍기 추천, 유튜브 쇼츠에서 보이던 목선풍기 고르는 기준',
      '넥밴드 선풍기 추천 전 배터리·소음·냉각패드부터 보세요',
      '인스타 여름 필수템 넥밴드 선풍기, 출퇴근용으로 괜찮을까'
    ],
    description: '유튜브 쇼츠와 인스타 릴스에서 자주 보이는 넥밴드 선풍기 추천 제품을 고르기 전 배터리, 무게, 소음, 냉각패드 기준을 정리했습니다.',
    opener: '요즘 유튜브 쇼츠나 Instagram 릴스를 보다 보면 목에 거는 선풍기가 자주 보이죠. 영상에서는 시원해 보이지만 실제 출퇴근길에 쓰면 무게, 소음, 머리카락 말림 같은 현실 문제가 바로 느껴져요. 넥밴드 선풍기 추천 글은 바람 세기보다 매일 목에 걸 수 있는지부터 봐야 해요.',
    why: '넥밴드 선풍기는 손을 쓰지 않아도 되는 점이 장점이에요. 대신 얼굴 가까이에서 작동하므로 소음과 바람 방향이 체감에 크게 영향을 줍니다. 냉각패드형은 처음에는 시원하지만 피부에 닿는 면적과 무게가 늘 수 있어요. 넥밴드 선풍기 추천 제품을 볼 때는 배터리 시간, 무게, 송풍구 위치를 함께 비교해야 합니다.',
    criteria: [
      '무게는 300g 안팎인지, 목 뒤쪽이 과하게 눌리지 않는 구조인지 확인하세요.',
      '소음은 실내 사무실보다 지하철, 버스, 야외처럼 실제 사용할 공간 기준으로 생각해야 해요.',
      '냉각패드형은 피부에 직접 닿으므로 땀, 금속 접촉감, 장시간 사용 안내를 함께 확인하세요.'
    ],
    caution: '**폭염에는 휴대용 선풍기만 믿고 오래 버티면 위험할 수 있어요.** 어지럼, 두통, 구역감이 있으면 그늘이나 실내로 이동하고 수분을 보충하는 게 먼저입니다.',
    close: '넥밴드 선풍기 추천 제품은 영상처럼 멋져 보이는 것보다 내 목에 오래 걸어도 불편하지 않은지가 핵심이에요. 출근길 20분을 덜 지치게 만드는 용도로 차분히 골라보세요.',
    sources: [
      ['질병관리청 폭염 건강수칙', 'https://www.kdca.go.kr/'],
      ['기상청 날씨누리', 'https://www.weather.go.kr/']
    ],
    tags: ['#넥밴드선풍기추천', '#목걸이선풍기', '#여름필수템']
  },
  {
    slug: 'cooling-tshirt-summer-social-guide',
    data: 'coupang-social-cooling-shirt.json',
    productType: 'social_cooling_tshirt',
    category: '소셜 계절템',
    badge: '냉감 의류',
    shortTitle: '냉감 티셔츠',
    keyword: '냉감 티셔츠 추천',
    subKeywords: ['쿨티셔츠', '여름 기능성 티셔츠', 'UV 차단 티셔츠'],
    titles: [
      '냉감 티셔츠 추천, 인스타 여름 코디템 보기 전 체크할 기준',
      '냉감 티셔츠 추천 전 소재·비침·세탁 변형부터 보세요',
      '유튜브 여름 필수템 냉감 티셔츠, 진짜 시원하게 입으려면'
    ],
    description: '인스타 여름 코디와 유튜브 여름 필수템으로 자주 보이는 냉감 티셔츠 추천 기준을 소재, 핏, 비침, 세탁 내구성 중심으로 정리했습니다.',
    opener: '여름 코디 영상에서 냉감 티셔츠가 시원해 보이면 하나쯤 사고 싶어져요. 그런데 막상 입어보면 몸에 달라붙거나, 비침이 있거나, 세탁 후 목이 늘어나는 경우가 있습니다. 냉감 티셔츠 추천은 시원하다는 말보다 하루 종일 입기 편한지를 먼저 봐야 해요.',
    why: '냉감 티셔츠는 보통 땀을 빨리 말리는 흡습속건 소재, 얇은 조직, 통풍 구조로 시원함을 느끼게 합니다. 하지만 얇을수록 비침과 내구성 문제가 생길 수 있고, 너무 타이트하면 땀이 마르기 전에 달라붙어요. 냉감 티셔츠 추천 제품을 고를 때는 소재명, 중량감, 세탁 방식, 핏을 함께 확인하는 편이 좋습니다.',
    criteria: [
      '운동용이면 흡습속건과 신축성을, 출근용이면 비침과 목 늘어남을 먼저 보세요.',
      '1+1 구성은 가격은 좋지만 색상, 사이즈 교환 조건, 세탁 후 변형 후기를 같이 봐야 해요.',
      'UV 차단 문구가 있다면 실제 표기 방식과 긴팔·후드 구조가 내 활동에 맞는지 확인하세요.'
    ],
    caution: '**냉감 의류가 체온 관리를 완전히 대신하지는 못해요.** 폭염에는 그늘, 수분 보충, 휴식이 함께 필요합니다.',
    close: '냉감 티셔츠 추천 글을 보는 이유는 결국 여름 하루를 덜 끈적하게 보내기 위해서예요. 영상 속 핏보다 내 생활의 땀, 세탁, 활동량을 기준으로 고르면 실패가 줄어듭니다.',
    sources: [
      ['질병관리청 폭염 건강수칙', 'https://www.kdca.go.kr/'],
      ['한국소비자원', 'https://www.kca.go.kr/']
    ],
    tags: ['#냉감티셔츠추천', '#쿨티셔츠', '#여름코디']
  },
  {
    slug: 'uv-umbrella-summer-social-guide',
    data: 'coupang-social-uv-umbrella.json',
    productType: 'social_uv_umbrella',
    category: '소셜 계절템',
    badge: '자외선 차단',
    shortTitle: '양산',
    keyword: '양산 추천',
    subKeywords: ['자외선 차단 양산', '암막 양산', '초경량 양우산'],
    titles: [
      '양산 추천, 인스타 여행템으로 보이던 자외선 차단 우산 고르는 기준',
      '양산 추천 전 UV 차단·암막·무게를 먼저 확인하세요',
      '유튜브 여름 외출템 양산, 가볍다고 무조건 좋은 건 아닙니다'
    ],
    description: '인스타 여행템과 유튜브 여름 외출템으로 자주 보이는 양산 추천 기준을 UV 차단, 암막, 무게, 접이식 구조 중심으로 정리했습니다.',
    opener: '햇빛이 강한 날에는 양산 하나만 있어도 체감이 달라져요. 인스타 여행 사진처럼 예쁜 것도 좋지만, 매일 들고 다니려면 가볍고 빨리 접히고 가방에 들어가야 합니다. 양산 추천은 디자인보다 실제 외출 동선에 맞는지가 먼저예요.',
    why: '양산은 햇빛을 직접 막아줘서 얼굴과 팔에 닿는 열감을 줄이는 데 도움이 됩니다. 다만 UV 차단, 암막 코팅, 우산 겸용 여부, 접었을 때 길이에 따라 사용감이 크게 달라져요. 양산 추천 제품을 볼 때는 차단율 문구만 보지 말고, 펼쳤을 때 지름과 손잡이 그립, 접이식 내구성을 함께 봐야 합니다.',
    criteria: [
      '가방에 매일 넣을 제품이면 접었을 때 길이와 무게가 가장 중요합니다.',
      '장마철 겸용으로 쓰려면 방수 가능 여부와 젖은 뒤 말리기 쉬운 구조인지 확인하세요.',
      '암막 코팅 제품은 안쪽 코팅 벗겨짐 후기와 살대 내구성을 함께 보는 편이 좋아요.'
    ],
    caution: '**양산을 써도 자외선이 완전히 사라지는 것은 아니에요.** 장시간 야외 활동에서는 선크림, 모자, 수분 보충을 함께 챙기는 편이 좋습니다.',
    close: '양산 추천 제품은 여행 사진용 소품이 아니라 여름 외출 피로를 줄여주는 생활템이에요. 가벼움, 차단감, 튼튼함의 균형을 보고 고르면 오래 들고 다닐 수 있습니다.',
    sources: [
      ['기상청 자외선지수', 'https://www.weather.go.kr/'],
      ['식품의약품안전처 자외선 차단제 정보', 'https://www.mfds.go.kr/']
    ],
    tags: ['#양산추천', '#자외선차단양산', '#여름외출템']
  },
  {
    slug: 'mosquito-repellent-summer-social-guide',
    data: 'coupang-social-mosquito-repellent.json',
    productType: 'social_mosquito_repellent',
    category: '소셜 계절템',
    badge: '모기 기피',
    shortTitle: '모기 기피제',
    keyword: '모기 기피제 추천',
    subKeywords: ['모기 스프레이', '야외활동 모기기피제', '어린이 모기기피제'],
    titles: [
      '모기 기피제 추천, 캠핑 릴스 보고 사기 전 꼭 볼 기준',
      '모기 기피제 추천 전 성분·사용 시간·어린이 사용 가능 여부 확인하기',
      '인스타 여름 캠핑템 모기 기피제, 스프레이와 미스트 차이는?'
    ],
    description: '인스타 캠핑 릴스와 유튜브 여름 야외활동 영상에서 자주 보이는 모기 기피제 추천 기준을 성분, 사용 시간, 피부 자극, 어린이 사용 기준으로 정리했습니다.',
    opener: '캠핑이나 야외 피크닉 영상은 좋아 보이는데, 현실에서는 모기 한두 마리 때문에 분위기가 금방 깨져요. 그래서 모기 기피제 추천을 찾게 되지만, 아무 제품이나 피부에 뿌리기는 조심스럽죠. 특히 어린이와 함께 쓰려면 사용 가능 연령과 사용 시간을 먼저 봐야 해요.',
    why: '모기 기피제는 모기를 죽이는 제품이 아니라 피부나 옷 주변에 접근을 줄이는 제품으로 이해하는 편이 좋아요. 스프레이, 미스트, 롤온처럼 형태가 다르고 성분에 따라 사용 가능 부위와 시간이 달라질 수 있습니다. 모기 기피제 추천 제품을 볼 때는 향보다 성분, 지속 시간, 어린이 사용 안내를 먼저 확인해야 합니다.',
    criteria: [
      '피부에 직접 쓰는 제품은 성분명, 사용 가능 연령, 얼굴 사용 가능 여부를 꼭 확인하세요.',
      '야외활동 시간이 길다면 한 번 사용 시간이 얼마나 되는지 보고, 덧바를 수 있는지 확인하세요.',
      '피부 자극이 걱정되면 넓게 뿌리기 전 작은 부위에 먼저 확인하고, 상처 부위에는 쓰지 않는 편이 좋아요.'
    ],
    caution: '**모기 기피제는 감염 예방을 보장하는 제품이 아니에요.** 긴 옷, 모기장, 고인 물 제거 같은 생활 관리와 함께 쓰는 보조 수단으로 봐야 합니다.',
    close: '모기 기피제 추천 제품은 향이 좋고 예쁜 패키지보다 우리 가족 피부와 야외 활동 시간에 맞는지가 더 중요해요. 여름 야외 시간이 덜 신경 쓰이도록 차분히 골라보세요.',
    sources: [
      ['질병관리청 감염병 정보', 'https://www.kdca.go.kr/'],
      ['식품의약품안전처 의약외품 정보', 'https://www.mfds.go.kr/']
    ],
    tags: ['#모기기피제추천', '#모기스프레이', '#캠핑필수템']
  },
  {
    slug: 'waterpark-waterproof-kit-social-guide',
    data: 'coupang-social-waterpark-kit.json',
    productType: 'social_waterpark_kit',
    category: '소셜 계절템',
    badge: '워터파크',
    shortTitle: '워터파크 준비물',
    keyword: '워터파크 준비물 추천',
    subKeywords: ['방수팩', '아쿠아슈즈', '물놀이 준비물'],
    titles: [
      '워터파크 준비물 추천, 인스타 물놀이 사진 전에 챙길 5가지',
      '워터파크 준비물 추천 전 방수팩·아쿠아슈즈부터 확인하세요',
      '유튜브 물놀이 필수템 워터파크 준비물, 빠뜨리면 불편한 것들'
    ],
    description: '인스타 물놀이 사진과 유튜브 워터파크 브이로그에서 자주 보이는 워터파크 준비물 추천 기준을 방수팩, 아쿠아슈즈, 수건, 여벌 동선으로 정리했습니다.',
    opener: '워터파크 영상은 보기만 해도 시원하지만, 현장에서는 젖은 짐과 미끄러운 바닥 때문에 작은 준비물이 크게 느껴져요. 특히 휴대폰 방수팩이나 아쿠아슈즈를 빠뜨리면 하루 종일 신경이 쓰입니다. 워터파크 준비물 추천은 사진보다 동선을 편하게 만드는 쪽으로 봐야 해요.',
    why: '워터파크에서는 물에 젖는 물건, 젖으면 안 되는 물건, 바로 갈아입을 물건이 계속 섞입니다. 방수팩은 휴대폰과 카드 보관을 돕고, 아쿠아슈즈는 뜨거운 바닥과 미끄러운 구간에서 발을 보호하는 데 도움이 돼요. 워터파크 준비물 추천 제품을 고를 때는 방수 등급, 착화감, 말리는 속도, 분리 보관을 함께 봐야 합니다.',
    criteria: [
      '방수팩은 IPX 표기와 잠금 구조를 확인하고, 사용 전 집에서 휴지 테스트를 해보는 편이 좋아요.',
      '아쿠아슈즈는 밑창 미끄럼 방지와 배수 구멍, 발등 조임 구조를 같이 보세요.',
      '젖은 옷과 마른 옷을 나눌 지퍼백이나 파우치를 준비하면 귀가길이 훨씬 편합니다.'
    ],
    caution: '**방수팩은 영구 방수를 보장하지 않아요.** 물속에서 오래 누르거나 잠금이 덜 닫히면 침수될 수 있으니 귀중품은 최소화하는 편이 좋습니다.',
    close: '워터파크 준비물 추천은 많이 챙기는 싸움이 아니라 젖은 물건을 덜 번거롭게 관리하는 싸움이에요. 방수, 미끄럼, 갈아입기 동선만 잡아도 하루가 훨씬 편해집니다.',
    sources: [
      ['한국소비자원', 'https://www.kca.go.kr/'],
      ['국민재난안전포털 물놀이 안전', 'https://www.safekorea.go.kr/']
    ],
    tags: ['#워터파크준비물추천', '#방수팩', '#아쿠아슈즈']
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
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', fileName), 'utf8'));
  const seen = new Set();
  return (data.items || [])
    .filter((product) => product.keyword !== 'Gold box')
    .filter((product) => !/강아지|반려|애완|펫카소/.test(product.productName || ''))
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

function productUrl(product, page) {
  return product.productUrl || `https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=${page.productType}&pageKey=${encodeURIComponent(page.keyword)}`;
}

function priceLabel(product) {
  return product.priceLabel || (product.productPrice ? `${Number(product.productPrice).toLocaleString('ko-KR')}원` : '가격 확인 필요');
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
                  <span class="product-detail-badge">${index + 1}번 소셜 참고템</span>
                  <h3>${escapeHtml(name)}</h3>
                  <div class="product-detail-price">검색 시점 기준 <strong>${escapeHtml(priceLabel(product))}</strong></div>
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: 영상 노출보다 ${escapeHtml(page.shortTitle)}을 실제로 쓰는 장소, 시간, 관리 편의를 먼저 보세요.</div>
                  <p class="product-detail-desc">소셜 영상에서 보이는 사용감은 짧게 편집된 경우가 많으니, 후기와 상세 스펙을 함께 확인하는 비교용으로 보세요.</p>
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
  const mobileName = first.productName || `${page.shortTitle} 참고 상품`;
  const mobileUrl = productUrl(first, page);

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
          <a href="/blog/neck-fan-summer-social-guide.html" data-blog-path="/blog/neck-fan-summer-social-guide.html">넥밴드 선풍기</a>
          <a href="/blog/cooling-tshirt-summer-social-guide.html" data-blog-path="/blog/cooling-tshirt-summer-social-guide.html">냉감 티셔츠</a>
          <a href="/blog/uv-umbrella-summer-social-guide.html" data-blog-path="/blog/uv-umbrella-summer-social-guide.html">양산</a>
          <a href="/blog/mosquito-repellent-summer-social-guide.html" data-blog-path="/blog/mosquito-repellent-summer-social-guide.html">모기 기피제</a>
          <a href="/blog/waterpark-waterproof-kit-social-guide.html" data-blog-path="/blog/waterpark-waterproof-kit-social-guide.html">워터파크 준비물</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">YouTube & Instagram Seasonal Note</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/neck-fan-summer-social-guide.html" data-blog-path="/blog/neck-fan-summer-social-guide.html">넥밴드 선풍기</a>
        <a href="/blog/cooling-tshirt-summer-social-guide.html" data-blog-path="/blog/cooling-tshirt-summer-social-guide.html">냉감 티셔츠</a>
        <a href="/blog/uv-umbrella-summer-social-guide.html" data-blog-path="/blog/uv-umbrella-summer-social-guide.html">양산</a>
        <a href="/blog/mosquito-repellent-summer-social-guide.html" data-blog-path="/blog/mosquito-repellent-summer-social-guide.html">모기 기피제</a>
        <a href="/blog/waterpark-waterproof-kit-social-guide.html" data-blog-path="/blog/waterpark-waterproof-kit-social-guide.html">워터파크 준비물</a>
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
              <span>YouTube와 Instagram에서 자주 보이는 계절템을 실제 사용 기준으로 다시 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#title-options">제목 후보 <span>3개</span></a>
              <a href="#why">필요한 이유 <span>상황</span></a>
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
            유튜브와 인스타에서 짧게 보이는 상품일수록 실제 사용 시간, 관리 편의, 내 생활 동선이 더 중요해요.<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.subKeywords[0])}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.shortTitle)} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(mobileName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">소셜 계절템 참고 상품</span>
              <strong>${escapeHtml(mobileName)}</strong>
              <p>${escapeHtml(page.keyword)} 검색에서 비교 출발점으로 볼 만한 상품입니다. 가격과 구성은 구매 전 다시 확인하세요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>소셜 영상 속 사용감보다 내 생활에서 반복해서 쓰기 쉬운지가 더 중요합니다.</figcaption>
          </figure>

          <div class="article-body">
            <section id="title-options">
              <h2>제목 후보 3개</h2>
              <ul>
                ${page.titles.map((title) => `<li>${escapeHtml(title)}</li>`).join('\n                ')}
              </ul>
            </section>

            <p class="article-lead">${escapeHtml(page.opener)}</p>

            <h2 id="why">${escapeHtml(page.keyword)}이 왜 뜨는 걸까요?</h2>
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

            <h2>YouTube·Instagram 영상과 실제 구매는 다르게 봐야 해요</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>영상에서 좋아 보이는 지점</h3>
                <p>짧은 장면에서는 디자인, 첫 사용감, 포장 상태가 먼저 눈에 들어와요. 그래서 충동구매가 쉽게 일어납니다.</p>
              </section>
              <section class="article-choice-card">
                <h3>구매 전에 봐야 하는 지점</h3>
                <p>반복 사용, 세척과 보관, 피부나 몸에 닿는 불편함, 가족과 함께 쓸 때의 조건을 같이 확인해야 오래 만족해요.</p>
              </section>
            </div>

            <h2>참고한 공식 정보</h2>
            <p>계절 상품은 날씨, 자외선, 폭염, 야외활동 안전과 연결되므로 공식 정보를 함께 확인하고 표현을 보수적으로 정리했습니다.</p>
            <ul class="article-source-list">
                ${sourceList(page)}
            </ul>

            <h2 id="products">${escapeHtml(page.keyword)} 참고 상품</h2>
            <p>아래 상품은 2026년 7월 6일 쿠팡 파트너스 상품 검색 기준입니다. 가격, 배송, 구성은 수시로 바뀔 수 있어 구매 전 상세 페이지에서 다시 확인하세요.</p>
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
  return `          <article class="blog-card" data-blog-category="life">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(productImage(first))}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" loading="lazy">
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
  const anchor = '          <article class="blog-card" data-blog-category="life">\n            <a href="/blog/rainy-commute-essentials-guide.html"';
  html = html.includes(anchor)
    ? html.replace(anchor, `${cards}\n${anchor}`)
    : html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${cards}\n`);

  const navLinks = pages.map((page) => `          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${page.shortTitle}</a>`).join('\n');
  html = html.replace('          <a href="/blog/rainy-commute-essentials-guide.html"', `${navLinks}\n          <a href="/blog/rainy-commute-essentials-guide.html"`);

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
