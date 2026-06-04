const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-06-02';
const dateText = '2026.06.02';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const adIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const pages = [
  {
    slug: 'lutein-omega3-home-shopping-guide',
    data: 'coupang-lutein-omega3.json',
    productType: 'lutein_omega3',
    category: '건강 정보',
    badge: '홈쇼핑 건강식품',
    title: '루테인 오메가3 홈쇼핑에서 자주 보이면 먼저 볼 기준',
    shortTitle: '루테인 오메가3',
    description: '루테인 오메가3를 홈쇼핑이나 검색으로 보기 전 루테인 함량, EPA·DHA, 캡슐 수, 중복 섭취 여부를 먼저 확인하는 기준입니다.',
    intro: '루테인 오메가3는 눈 건강과 오메가3를 한 번에 챙기는 구성으로 자주 보입니다. 다만 이름보다 중요한 건 루테인 함량과 EPA·DHA 총량입니다.',
    red: '눈 건강이라는 말보다 함량을 먼저',
    blue: '오메가3는 EPA·DHA 총량 확인',
    sections: [
      ['방송 문구보다 라벨을 먼저 봅니다', '루테인은 제품마다 1일 섭취량 기준 함량이 다릅니다. 오메가3도 총량이 아니라 EPA와 DHA가 얼마나 들어 있는지 보는 편이 더 정확합니다.'],
      ['AREDS2 숫자를 그대로 광고처럼 믿지는 않습니다', '미국 National Eye Institute의 AREDS2 자료에서는 루테인 10mg, 지아잔틴 2mg 조합이 언급됩니다. 다만 이 자료는 연령관련 황반변성 연구 맥락이므로, 일반 제품을 질환 치료용처럼 고르면 안 됩니다.'],
      ['이미 먹는 영양제와 겹치는지 봅니다', '종합비타민, 눈 영양제, 오메가3를 이미 먹고 있다면 성분이 겹칠 수 있습니다. 같은 성분을 여러 제품에서 반복해서 먹는 구조는 피하는 편이 좋습니다.'],
      ['꾸준히 먹을 수 있는 캡슐 크기인지 봅니다', '건강식품은 한 번 사는 것보다 매일 이어가는지가 더 중요합니다. 캡슐 크기, 냄새, 1일 섭취 횟수를 먼저 확인하세요.']
    ],
    audience: [
      ['스마트폰·PC 화면을 오래 보는 사람', '눈이 쉽게 뻑뻑하거나 피로하다고 느껴 눈 건강 관련 성분을 찾아보는 경우가 많습니다.'],
      ['오메가3와 눈 영양제를 따로 먹기 번거로운 사람', '루테인과 오메가3를 한 번에 비교하고 싶을 때 이런 복합 제품을 많이 봅니다.'],
      ['부모님 선물용 건강식품을 찾는 사람', '다만 질환 치료 목적이 아니라 라벨의 1일 섭취량과 주의사항을 확인하는 선물 후보로 보는 편이 안전합니다.']
    ],
    science: '미국 NIH ODS의 오메가3 자료는 EPA와 DHA 섭취량을 구분해서 설명하고, National Eye Institute의 AREDS2 자료는 루테인·지아잔틴 조합을 눈 질환 연구 맥락에서 다룹니다. 그래서 루테인 오메가3 제품은 눈 건강 문구만 보지 말고 루테인·지아잔틴 함량과 EPA·DHA 합산량을 함께 보는 방식이 더 실용적입니다.',
    source: [
      ['NIH Office of Dietary Supplements Omega-3 Fact Sheet', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-consumer/'],
      ['National Eye Institute AREDS/AREDS2 Clinical Trials', 'https://www.nei.nih.gov/eye-health-information/clinical-trials/age-related-eye-disease-studies-aredsareds2/about-areds-and-areds2'],
      '식약처 건강기능식품 표시 기준'
    ],
    faq: [
      ['루테인 오메가3는 약인가요?', '아닙니다. 일반적으로 건강기능식품 또는 건강식품으로 보는 영역이며 질환 치료 목적으로 고르면 안 됩니다. 눈 질환이 있거나 치료 중이라면 제품 구매보다 진료 상담이 먼저입니다.'],
      ['언제 먹는 게 좋나요?', '제품별 섭취 방법이 우선입니다. 오메가3는 식사와 함께 먹는 방식이 안내되는 경우가 많습니다.']
    ],
    tags: ['#루테인오메가3', '#눈건강', '#오메가3']
  },
  {
    slug: 'probiotics-home-shopping-guide',
    data: 'coupang-probiotics.json',
    productType: 'probiotics',
    category: '건강 정보',
    badge: '홈쇼핑 건강식품',
    title: '유산균 홈쇼핑 광고 볼 때 먼저 확인할 4가지',
    shortTitle: '유산균',
    description: '유산균을 홈쇼핑에서 볼 때 균수, 균주, 보관 방식, 섭취 편의성을 기준으로 비교하는 생활형 체크리스트입니다.',
    intro: '유산균은 광고 문구가 비슷해서 고르기 어렵습니다. 먼저 균수만 볼 게 아니라 균주, 보관 방식, 매일 먹기 쉬운 포장인지 확인하는 게 좋습니다.',
    red: '균수 하나로 끝내지 말기',
    blue: '보관과 섭취 편의성이 오래 갑니다',
    sections: [
      ['CFU 숫자는 기준 중 하나입니다', 'CFU는 살아 있는 균 수를 보는 지표지만, 무조건 숫자가 크다고 내 생활에 더 맞는 것은 아닙니다. 제품의 보장 균수 표기와 섭취량을 함께 보세요.'],
      ['균주 이름이 구체적인지 봅니다', '락토바실러스, 비피더스처럼 큰 분류만 보는 것보다 제품 설명에서 균주 구성이 얼마나 명확한지 확인하는 편이 좋습니다. 프로바이오틱스는 균주에 따라 연구 근거와 특성이 달라질 수 있습니다.'],
      ['냉장·상온 보관이 생활과 맞는지 봅니다', '출근길, 여행, 아이와 함께 먹는 경우라면 보관 방식이 실제 만족도를 크게 좌우합니다.']
    ],
    audience: [
      ['배변 리듬이 들쭉날쭉하다고 느끼는 사람', '유산균은 장 건강을 떠올리며 많이 찾지만, 개인차가 크기 때문에 제품 라벨과 섭취 방법을 먼저 봐야 합니다.'],
      ['외식·야식이 잦은 사람', '식사 패턴이 불규칙할 때 매일 챙기기 쉬운 스틱형, 캡슐형 제품을 비교하는 경우가 많습니다.'],
      ['가족이 같이 먹을 제품을 찾는 사람', '성인용과 어린이용은 기준이 다를 수 있어 연령 표시와 보관 조건을 확인하는 게 좋습니다.']
    ],
    science: 'NIH ODS의 프로바이오틱스 자료는 모든 프로바이오틱스 제품이 같은 근거를 갖는 것은 아니며, 제품 라벨·균주·보관 조건을 확인해야 한다는 점을 강조합니다. 그래서 유산균은 균수 하나보다 균주, 보장 균수, 보관 방식, 섭취 편의성을 같이 보는 것이 기본입니다.',
    source: [
      ['NIH Office of Dietary Supplements Probiotics Fact Sheet', 'https://ods.od.nih.gov/factsheets/Probiotics-consumer/'],
      '식약처 건강기능식품 표시 기준'
    ],
    faq: [
      ['유산균은 매일 먹어야 하나요?', '제품별 섭취 방법이 우선입니다. 꾸준히 먹기 어렵다면 포장과 맛, 보관 방식이 쉬운 제품부터 보는 게 현실적입니다. 질환 치료 목적의 선택은 전문가 상담을 우선하세요.'],
      ['아이와 같이 먹어도 되나요?', '연령별 제품이 따로 있는 경우가 많습니다. 어린이는 성인용 대신 연령 표시가 맞는 제품을 확인하는 편이 좋습니다.']
    ],
    tags: ['#유산균', '#프로바이오틱스', '#장건강']
  },
  {
    slug: 'omega3-home-shopping-guide',
    data: 'coupang-omega3.json',
    productType: 'omega3',
    category: '건강 정보',
    badge: '홈쇼핑 건강식품',
    title: '오메가3 홈쇼핑 상품 보기 전 EPA DHA 함량부터',
    shortTitle: '오메가3',
    description: '오메가3 제품을 고를 때 총 캡슐 수보다 EPA·DHA 함량, 원료, 섭취 편의성, 중복 섭취를 먼저 확인하는 기준입니다.',
    intro: '오메가3는 홈쇼핑에서 대용량 구성으로 자주 보입니다. 하지만 총 캡슐 수보다 EPA·DHA 함량과 내가 매일 먹을 수 있는 형태인지가 먼저입니다.',
    red: '대용량보다 EPA·DHA',
    blue: '비린 냄새와 캡슐 크기도 기준입니다',
    sections: [
      ['총량보다 EPA·DHA를 봅니다', '오메가3 1000mg이라는 숫자만으로 판단하지 말고, 실제 주요 지방산인 EPA와 DHA가 얼마나 들어 있는지 확인하세요.'],
      ['캡슐 크기와 냄새는 재구매를 좌우합니다', '오메가3는 꾸준히 먹는 제품이라 삼키기 어려운 캡슐이나 냄새가 강한 제품은 오래 이어가기 어렵습니다.'],
      ['혈액 관련 약을 먹는다면 조심합니다', '건강식품이라도 개인 상태에 따라 주의가 필요합니다. 약을 복용 중이면 제품 안내와 전문가 상담을 우선하세요.']
    ],
    audience: [
      ['생선을 자주 먹지 않는 사람', 'EPA·DHA 섭취를 제품으로 보완하려는 사람들이 오메가3를 많이 찾아봅니다.'],
      ['기름진 식사나 외식이 잦은 사람', '식습관이 신경 쓰일 때 오메가3 제품을 비교하는 경우가 많지만, 식단 관리 자체를 대체하는 제품은 아닙니다.'],
      ['부모님 건강식품을 고르는 사람', '선물용으로 볼 때는 대용량 구성보다 캡슐 크기, 냄새, 1일 섭취 기준을 확인하는 편이 현실적입니다.']
    ],
    science: 'NIH ODS의 오메가3 자료는 ALA, EPA, DHA를 구분해서 설명합니다. 구매 전에는 오메가3 몇 mg이라는 광고 문구보다 EPA·DHA 합산량, 1일 섭취 기준, 원료 형태를 같이 보는 게 좋습니다.',
    source: [
      ['NIH Office of Dietary Supplements Omega-3 Fact Sheet', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-consumer/'],
      '식약처 건강기능식품 표시 기준'
    ],
    faq: [
      ['오메가3는 누구나 먹어도 되나요?', '개인 건강 상태와 복용 중인 약에 따라 다릅니다. 특히 질환 관리 목적이거나 혈액 관련 약을 복용 중이라면 전문가 상담이 우선입니다.'],
      ['식물성 오메가3와 어유 오메가3는 같나요?', '원료와 지방산 구성이 다를 수 있습니다. 제품 라벨에서 EPA·DHA 또는 원료 정보를 확인하세요.']
    ],
    tags: ['#오메가3', '#EPA', '#DHA']
  },
  {
    slug: 'dehumidifier-home-shopping-guide',
    data: 'coupang-dehumidifier-current.json',
    productType: 'dehumidifier',
    category: '생활가전',
    badge: '장마철 가전',
    title: '제습기 홈쇼핑 방송 보기 전 용량과 배수 방식 체크',
    shortTitle: '제습기',
    description: '제습기를 홈쇼핑에서 볼 때 제습 용량, 물통 크기, 연속 배수, 소음, 방 크기를 기준으로 비교하는 실사용 체크리스트입니다.',
    intro: '제습기는 장마철에 방송을 보면 바로 사고 싶어지는 제품입니다. 하지만 먼저 볼 건 가격보다 방 크기, 제습 용량, 물통과 배수 방식입니다.',
    red: '방 크기보다 작은 제습기는 답답합니다',
    blue: '물통 비우기 싫다면 연속 배수 확인',
    sections: [
      ['원룸·침실·거실 용도를 나눕니다', '작은 방 보조용과 거실·빨래방용은 필요한 제습량이 다릅니다. 방송에서 대용량이라고 해도 내 공간에 맞는지 먼저 보세요. 한국소비자원 자료도 사용 공간 면적을 고려한 선택을 권합니다.'],
      ['물통 크기와 연속 배수를 봅니다', '제습기는 물통을 자주 비워야 하면 금방 귀찮아집니다. 세탁실이나 욕실 근처라면 연속 배수 지원 여부가 체감 편의성을 크게 바꿉니다.'],
      ['제습효율·소음·전기요금도 같이 봅니다', '밤에 침실에서 쓸 제품이라면 소음이 중요하고, 장마철에 오래 틀 제품이라면 제습효율과 에너지소비량도 중요합니다. 바퀴, 손잡이 같은 이동 편의성도 실제 만족도를 좌우합니다.']
    ],
    audience: [
      ['장마철 빨래 냄새가 신경 쓰이는 사람', '실내 건조를 자주 한다면 제습량과 연속 배수 여부를 먼저 확인하는 편이 좋습니다.'],
      ['원룸·반지하·욕실 습기가 고민인 사람', '공간이 작아도 습기가 잘 빠지지 않으면 체감 불편이 큽니다. 소음과 물통 크기를 같이 봐야 합니다.'],
      ['옷장이나 신발장 곰팡이를 줄이고 싶은 사람', '전체 공간용 제습기와 국소 제습용 제품은 쓰임이 다르므로 목적을 나눠 보는 게 좋습니다.']
    ],
    science: '한국소비자원 시험평가 자료는 제습기 선택 시 제습성능, 제습효율, 소음, 에너지소비량, 가격 등을 비교하는 것이 바람직하다고 정리합니다. 습도가 높으면 곰팡이와 냄새가 생기기 쉽고 빨래 건조 시간도 길어지므로, 장마철에는 성능과 유지비를 함께 보는 편이 현실적입니다.',
    source: [
      ['KDI 경제정보센터 - 제습기 제품별 제습성능·제습효율 차이', 'https://eiec.kdi.re.kr/policy/materialView.do?code=G0600&num=254513'],
      '한국소비자원 제습기 시험·평가 자료'
    ],
    faq: [
      ['제습기와 에어컨 제습은 같은가요?', '목적은 비슷하지만 사용 환경이 다릅니다. 에어컨 제습은 냉방과 함께 쓰기 좋고, 제습기는 빨래방·옷장·장마철 보조용으로 쓰기 편합니다.'],
      ['작은 제습기로 거실도 되나요?', '가능은 하지만 시간이 오래 걸릴 수 있습니다. 넓은 공간은 제습 용량을 넉넉하게 보는 편이 좋습니다.']
    ],
    tags: ['#제습기', '#장마철', '#원룸제습기']
  },
  {
    slug: 'cooling-pad-home-shopping-guide',
    data: 'coupang-cooling-pad-current.json',
    productType: 'cooling_pad',
    category: '여름 침구',
    badge: '여름 홈쇼핑',
    title: '냉감 패드 홈쇼핑에서 보면 원단과 세탁 기준부터',
    shortTitle: '냉감 패드',
    description: '냉감 패드를 고를 때 접촉 냉감 수치, 원단, 미끄럼 방지, 세탁 가능 여부, 침대 사이즈를 먼저 확인하는 기준입니다.',
    intro: '냉감 패드는 여름 홈쇼핑에서 가장 눈에 잘 들어오는 침구입니다. 시원해 보이는 화면보다 원단, 세탁 방식, 침대 사이즈가 먼저입니다.',
    red: '처음 닿는 시원함과 밤새 편안함은 다릅니다',
    blue: '세탁 가능 여부가 오래 쓰는 기준입니다',
    sections: [
      ['접촉 냉감은 첫 느낌을 봅니다', '냉감 패드는 피부에 닿는 순간의 차가운 느낌이 장점입니다. 한국소비자원 냉감 침구 시험에서도 접촉냉감은 제품별 차이가 있는 항목으로 다뤄졌습니다.'],
      ['열조절·흡수성은 오래 누웠을 때 중요합니다', '처음 닿는 느낌만 좋고 땀이 차면 실제 사용감은 떨어집니다. 열조절, 흡수성, 원단 촉감을 같이 보는 편이 좋습니다.'],
      ['세탁과 건조가 쉬운지 봅니다', '땀이 많은 여름 침구는 자주 세탁하게 됩니다. 세탁기·건조기 사용 가능 여부와 제품 표시사항은 반드시 확인할 만한 포인트입니다.']
    ],
    audience: [
      ['몸에 열이 많아 자다가 깨는 사람', '냉감 패드는 피부에 닿는 첫 시원함을 기대하고 찾는 경우가 많습니다. 다만 실내 온도 자체를 낮추는 제품은 아닙니다.'],
      ['에어컨을 밤새 틀기 부담스러운 사람', '냉방을 약하게 쓰면서 침구의 접촉감을 바꾸고 싶은 경우 냉감 패드를 많이 비교합니다.'],
      ['여름 침구를 가볍게 바꾸고 싶은 사람', '이불 전체를 바꾸기 전 패드부터 바꾸면 체감하기 쉽고, 세탁 관리도 비교적 단순합니다.']
    ],
    science: '한국소비자원은 유아용 냉감 패드와 매트 11개 제품을 대상으로 냉감 성능, 안전성, 표시사항 등을 시험·평가했고 접촉냉감, 열조절, 흡수성능이 제품별로 차이가 있다고 설명했습니다. 냉감 원단은 피부와 닿을 때 열이 이동하며 시원하게 느껴지는 원리를 활용하므로, 실내 온도와 땀, 원단 표면 상태에 따라 체감이 달라질 수 있습니다.',
    source: [
      ['대한민국 정책브리핑 - 유아용 냉감침구 11개 제품 비교정보', 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=156721691'],
      '섬유 제품 취급 표시 기준'
    ],
    faq: [
      ['냉감 패드만 쓰면 에어컨이 필요 없나요?', '그렇지는 않습니다. 냉감 패드는 접촉 시원함을 주는 침구라 실내 온도 자체를 낮추지는 않습니다.'],
      ['냉감 패드와 냉감 이불 중 뭐가 먼저인가요?', '등과 허리가 닿는 시간이 길어서 처음이라면 패드부터 체감하기 쉽습니다. 더위를 많이 타면 이불을 추가로 보면 됩니다.']
    ],
    tags: ['#냉감패드', '#여름침구', '#쿨매트']
  }
];

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function products(file) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
  const result = [];
  const seen = new Set();
  for (const item of data.items || []) {
    const key = item.productId || item.productName;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
    if (result.length === 3) {
      break;
    }
  }
  return result;
}

function priceBand(value) {
  const price = Number(value || 0);
  if (!price) {
    return '가격 확인';
  }
  if (price < 10000) {
    return '1만원 이하';
  }
  if (price < 20000) {
    return '1만원대';
  }
  return `${Math.floor(price / 10000)}만원대`;
}

function productCard(page, product, index) {
  const badgeClass = index === 1 ? ' product-detail-badge--orange' : index === 2 ? ' product-detail-badge--blue' : '';
  const name = escapeHtml(product.productName);
  const url = escapeHtml(product.productUrl);
  const image = escapeHtml(product.localImage || product.productImage);

  return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${url}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">
                    <img src="${image}" alt="${name}" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge${badgeClass}">${index + 1}번 참고 상품</span>
                  <h3>${name}</h3>
                  <div class="product-detail-price">현재가 기준 <strong>${priceBand(product.productPrice)}</strong></div>
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: ${escapeHtml(product.categoryName || page.category)} · ${product.isRocket ? '로켓배송 표시' : '배송 조건 확인 필요'}</div>
                  <p class="product-detail-desc">방송이나 검색으로 본 제품과 비교할 때 가격대, 구성, 후기 흐름을 함께 보기 좋은 참고 상품입니다.</p>
                  <div class="product-detail-target"><strong>잘 맞는 상황</strong>: 이미 관심 제품을 정했지만 다른 가격대와 구성을 한 번 더 비교하고 싶을 때</div>
                  <a class="product-detail-btn" href="${url}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">쿠팡에서 구매</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
}

function sourceItem(source) {
  if (Array.isArray(source)) {
    const [label, url] = source;
    return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`;
  }
  return `<li>${escapeHtml(source)}</li>`;
}

function article(page) {
  const items = products(page.data);
  const first = items[0];
  const url = `${site}/blog/${page.slug}.html`;
  const image = first.localImage || first.productImage;
  const absoluteImage = image.startsWith('/') ? `${site}${image}` : image;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: page.description,
    image: { '@type': 'ImageObject', url: absoluteImage, width: 657, height: 657 },
    thumbnailUrl: absoluteImage,
    datePublished: date,
    dateModified: date,
    inLanguage: 'ko-KR',
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: '골드픽' },
    publisher: {
      '@type': 'Organization',
      name: '골드픽',
      logo: { '@type': 'ImageObject', url: `${site}/images/favicon.png` }
    },
    keywords: page.tags.map((tag) => tag.replace('#', '')).join(', ')
  };

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
  <title>${escapeHtml(page.title)} | 골드픽 노트</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${escapeHtml(absoluteImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(absoluteImage)}">
  <meta property="og:image:width" content="657">
  <meta property="og:image:height" content="657">
  <meta property="og:image:alt" content="${escapeHtml(page.shortTitle)} 대표 이미지">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteImage)}">
  <meta name="thumbnail" content="${escapeHtml(absoluteImage)}">
  <link rel="image_src" href="${escapeHtml(absoluteImage)}">
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
        <a class="blog-mobile-brand" href="/blog/index.html">골드픽</a>
        <div class="blog-mobile-title">${escapeHtml(page.shortTitle)}</div>
        <div class="blog-mobile-actions">
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="drawer-${page.slug}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="drawer-${page.slug}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/blog/index.html" data-blog-path="/blog/index.html">홈</a>
          <a href="/blog/lutein-omega3-home-shopping-guide.html" data-blog-path="/blog/lutein-omega3-home-shopping-guide.html">루테인 오메가3</a>
          <a href="/blog/probiotics-home-shopping-guide.html" data-blog-path="/blog/probiotics-home-shopping-guide.html">유산균</a>
          <a href="/blog/omega3-home-shopping-guide.html" data-blog-path="/blog/omega3-home-shopping-guide.html">오메가3</a>
          <a href="/blog/dehumidifier-home-shopping-guide.html" data-blog-path="/blog/dehumidifier-home-shopping-guide.html">제습기</a>
          <a href="/blog/cooling-pad-home-shopping-guide.html" data-blog-path="/blog/cooling-pad-home-shopping-guide.html">냉감 패드</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Home Shopping Pick Note</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)} 구매 전 체크</div>
        <p class="blog-intro">${escapeHtml(page.intro)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/blog/index.html" data-blog-path="/blog/index.html">홈</a>
        <a href="/blog/lutein-omega3-home-shopping-guide.html" data-blog-path="/blog/lutein-omega3-home-shopping-guide.html">루테인 오메가3</a>
        <a href="/blog/probiotics-home-shopping-guide.html" data-blog-path="/blog/probiotics-home-shopping-guide.html">유산균</a>
        <a href="/blog/dehumidifier-home-shopping-guide.html" data-blog-path="/blog/dehumidifier-home-shopping-guide.html">제습기</a>
      </nav>
    </header>

    <div class="mobile-top-ad" data-mobile-top-ad aria-label="모바일 상단 쿠팡 광고">
      <div class="article-ad article-ad-frame-block">
        <p class="article-ad-label">광고</p>
        ${adIframe}
      </div>
    </div>

    <main class="blog-layout">
      <aside class="blog-sidebar blog-sidebar-left">
        <div class="blog-stack">
          <section class="blog-panel blog-profile">
            <img class="blog-avatar" src="${escapeHtml(image)}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" width="72" height="72">
            <div class="blog-profile-meta">
              <strong>골드픽</strong>
              <span>홈쇼핑에서 자주 보이는 상품을 생활 기준으로 다시 정리합니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#summary">먼저 볼 기준 <span>핵심</span></a>
              <a href="#science">자료로 보는 포인트 <span>근거</span></a>
              <a href="#products">최근 참고 상품 <span>구매</span></a>
              <a href="#faq">FAQ <span>질문</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · ${escapeHtml(page.category)}</span></div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box" id="summary">
            <span class="memo-note memo-note--summary">${escapeHtml(page.red)}</span><br>
            ${escapeHtml(page.intro)}<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.blue)}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.shortTitle)} 추천 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(first.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(first.localImage || first.productImage)}" alt="${escapeHtml(first.productName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">최근 많이 보는 참고 상품</span>
              <strong>${escapeHtml(first.productName)}</strong>
              <p>${priceBand(first.productPrice)} · 방송에서 본 제품과 가격대/구성을 비교할 때 먼저 보기 좋습니다.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(first.productUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">쿠팡에서 구매</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>최근 검색·쇼핑 흐름에서 자주 보이는 ${escapeHtml(page.shortTitle)} 상품을 생활 기준으로 다시 정리했습니다.</figcaption>
          </figure>

          <div class="article-body">
            ${page.sections.map(([heading, text], index) => `<h2>${index + 1}. ${escapeHtml(heading)}</h2>
            <p>${escapeHtml(text)}</p>`).join('\n\n            ')}

            <h2>이런 사람이 많이 찾아봅니다</h2>
            <div class="article-choice-grid">
              ${page.audience.map(([title, text]) => `<section class="article-choice-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></section>`).join('\n              ')}
            </div>

            <div class="article-ad article-ad-frame-block">
              <p class="article-ad-label">광고</p>
              ${adIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="science">자료로 보는 선택 포인트</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>근거로 보는 기준</h3>
                <p>${escapeHtml(page.science)}</p>
              </section>
              <section class="article-choice-card">
                <h3>구매 전 한 줄 결론</h3>
                <p><strong>광고 문구보다 1일 기준 함량, 사용 환경, 계속 쓸 수 있는 편의성</strong>을 먼저 보면 실패 확률이 줄어듭니다.</p>
              </section>
            </div>
            <ul class="article-source-list">
              ${page.source.map(sourceItem).join('\n              ')}
            </ul>

            <h2 id="products">최근 많이 찾는 ${escapeHtml(page.shortTitle)} 참고 상품</h2>
            <p>아래 상품은 최근 많이 찾는 흐름을 참고해 비교용으로 정리했습니다. 이미 마음에 둔 제품이 있어도 가격대와 구성 비교용으로 한 번 더 보는 식이 좋습니다.</p>
            <div class="article-product-detail-list">
${items.map((product, index) => productCard(page, product, index)).join('\n')}
            </div>

            <h2 id="faq">자주 묻는 질문</h2>
            <div class="article-choice-grid">
              ${page.faq.map(([question, answer]) => `<section class="article-choice-card"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></section>`).join('\n              ')}
            </div>
          </div>
        </article>
      </section>

      <aside class="blog-sidebar blog-sidebar-right">
        <div class="blog-stack blog-stack-sticky">
          <section class="blog-panel blog-recommend-panel">
            <h2>추천 배너</h2>
            <div class="article-ad article-ad-frame-block">
              ${adIframe}
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

function indexCard(page) {
  const items = products(page.data);
  return `          <article class="blog-card" data-blog-category="${page.productType === 'dehumidifier' || page.productType === 'cooling_pad' ? 'life summer' : 'life'}">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain" data-card-carousel>
                <img class="is-active" src="${escapeHtml(items[0].localImage || items[0].productImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품" loading="lazy">
                ${items[1] ? `<img src="${escapeHtml(items[1].localImage || items[1].productImage)}" alt="${escapeHtml(page.shortTitle)} 비교 상품" loading="lazy">` : ''}
                <span class="blog-card-badge">${escapeHtml(page.badge)}</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">${escapeHtml(page.category)} · ${dateText}</div>
                <h3>${escapeHtml(page.title)}</h3>
                <p>${escapeHtml(page.description)}</p>
                <div class="blog-card-tags">
                  ${page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('\n                  ')}
                </div>
              </div>
            </a>
          </article>`;
}

function patchBlogIndex() {
  const indexPath = path.join(root, 'blog', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  for (const page of pages) {
    html = html.replace(new RegExp(`\\n?\\s*<article class="blog-card" data-blog-category="[^"]*">\\n\\s*<a href="/blog/${page.slug}\\.html"[\\s\\S]*?\\n\\s*</article>`, 'g'), '');
    html = html.replace(new RegExp(`\\n\\s*<a href="/blog/${page.slug}\\.html" data-blog-path="/blog/${page.slug}\\.html">[^<]*<span>NEW</span></a>`, 'g'), '');
    html = html.replace(new RegExp(`\\n\\s*<a href="/blog/${page.slug}\\.html" data-blog-path="/blog/${page.slug}\\.html">[^<]*</a>`, 'g'), '');
  }

  const cards = pages.map(indexCard).join('\n');
  html = html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${cards}\n`);

  const latest = pages.map((page) => `              <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${page.shortTitle} 홈쇼핑 체크 <span>NEW</span></a>`).join('\n');
  html = html.replace('              <a href="/blog/porcine-chondroitin-daily-dosage.html"', `${latest}\n              <a href="/blog/porcine-chondroitin-daily-dosage.html"`);

  const nav = pages.map((page) => `          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${page.shortTitle}</a>`).join('\n');
  html = html.replace('          <a href="/blog/porcine-chondroitin-daily-dosage.html"', `${nav}\n          <a href="/blog/porcine-chondroitin-daily-dosage.html"`);

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
patchBlogIndex();
patchSitemap();

console.log(pages.map((page) => `/blog/${page.slug}.html`).join('\n'));
