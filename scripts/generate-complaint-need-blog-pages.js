const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-07-08';
const dateText = '2026.07.08';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const pages = [
  {
    slug: 'quiet-dehumidifier-review-complaints-guide',
    data: 'coupang-complaint-quiet-dehumidifier.json',
    productType: 'complaint_quiet_dehumidifier',
    keyword: '저소음 제습기 추천',
    shortTitle: '저소음 제습기',
    title: '저소음 제습기 추천, 후기 불만에서 보이는 소음·물통·발열 기준',
    description: '저소음 제습기 추천을 찾는 분들을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 소음, 물통, 발열 불만을 기준으로 선택법을 정리했습니다.',
    complaints: ['소음이 생각보다 커서 밤에 쓰기 어렵다', '물통이 작아 자주 비워야 한다', '작동 중 발열과 전기요금이 걱정된다'],
    needs: ['침실이나 원룸에서도 부담 적은 운전음', '배수 호스나 넉넉한 물통 구성', '제습량과 소비전력의 균형'],
    criteria: ['사용 공간 면적보다 제습량을 한 단계 여유 있게 보세요.', '연속배수 가능 여부와 물통 용량을 함께 확인하세요.', '저소음 모드가 있어도 실제 dB 표기와 리뷰의 생활 소음을 같이 보세요.'],
    caution: '제습기는 습도를 낮추는 제품이지 곰팡이 문제를 단번에 해결하는 제품은 아니에요. 환기, 누수 점검, 세탁물 간격 확보도 함께 봐야 합니다.',
    exclude: /옷장|탈취제|제습제|물먹는|필터/i,
  },
  {
    slug: 'non-slip-cooling-pad-review-complaints-guide',
    data: 'coupang-complaint-non-slip-cooling-pad.json',
    productType: 'complaint_non_slip_cooling_pad',
    keyword: '밀림 적은 냉감패드 추천',
    shortTitle: '밀림 적은 냉감패드',
    title: '밀림 적은 냉감패드 추천, 후기 불만의 밀림·보풀·시원하지 않음 줄이는 법',
    description: '밀림 적은 냉감패드 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 밀림, 보풀, 시원하지 않다는 불만을 선택 기준으로 바꿔 정리했습니다.',
    complaints: ['자다가 패드가 밀려서 침대가 흐트러진다', '세탁 후 보풀이나 올 풀림이 생긴다', '처음만 차갑고 금방 시원하지 않다'],
    needs: ['고정밴드나 미끄럼 방지 처리가 있는 구조', '세탁 후에도 표면감이 유지되는 원단', '몸에 달라붙지 않는 통기성과 냉감 원사'],
    criteria: ['고정밴드, 논슬립 뒷면, 매트리스 두께 호환을 먼저 보세요.', 'Q-MAX 수치보다 세탁 가능 방식과 원단 짜임을 같이 확인하세요.', '땀이 많은 편이면 두께가 너무 얇은 제품보다 통기층이 있는 구성을 보세요.'],
    caution: '냉감패드는 에어컨처럼 실내 온도를 낮추지는 않아요. 더운 방에서는 선풍기나 제습과 함께 써야 체감이 낫습니다.',
    exclude: /이불|담요|베개|커버만|강아지|반려/i,
  },
  {
    slug: 'lightweight-power-bank-review-complaints-guide',
    data: 'coupang-complaint-lightweight-power-bank.json',
    productType: 'complaint_lightweight_power_bank',
    keyword: '가벼운 보조배터리 추천',
    shortTitle: '가벼운 보조배터리',
    title: '가벼운 보조배터리 추천, 무겁고 충전속도 느리다는 후기 불만 기준',
    description: '가벼운 보조배터리 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 무게, 충전속도, 발열 불만을 기준으로 고르는 법을 정리했습니다.',
    complaints: ['가방에 넣으면 생각보다 무겁다', '고속충전이라고 했는데 체감 충전속도가 느리다', '충전 중 발열이 신경 쓰인다'],
    needs: ['매일 들고 다닐 수 있는 10000mAh 전후 무게', '휴대폰 규격에 맞는 PD·QC 출력', '케이블 일체형과 안전 인증 확인'],
    criteria: ['용량만 보지 말고 g 단위 무게를 먼저 보세요.', '내 휴대폰이 지원하는 최대 충전 규격과 출력 W를 맞춰보세요.', '케이블 일체형은 편하지만 단선 시 불편할 수 있어 교체 가능성도 생각하세요.'],
    caution: '보조배터리는 사용 환경에 따라 발열이 생길 수 있습니다. 이불 속, 직사광선, 밀폐된 가방 안 충전은 피하는 편이 안전해요.',
    exclude: /케이스|충전기만|거치대|선풍기/i,
  },
  {
    slug: 'leakproof-tumbler-review-complaints-guide',
    data: 'coupang-complaint-leakproof-tumbler.json',
    productType: 'complaint_leakproof_tumbler',
    keyword: '누수 방지 텀블러 추천',
    shortTitle: '누수 방지 텀블러',
    title: '누수 방지 텀블러 추천, 새는 후기와 세척 불편을 줄이는 선택 기준',
    description: '누수 방지 텀블러 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 누수, 세척, 냄새 불만을 고객 니즈로 바꿔 정리했습니다.',
    complaints: ['가방 안에서 음료가 새서 난감하다', '빨대와 뚜껑 틈 세척이 어렵다', '고무 패킹이나 내부 냄새가 남는다'],
    needs: ['잠금 구조와 패킹이 안정적인 뚜껑', '분리세척 가능한 빨대·패킹 구성', '스테인리스 내부와 넓은 입구'],
    criteria: ['완전 밀폐형인지, 빨대형인지 사용 상황에 맞춰 고르세요.', '패킹과 빨대가 분리되는지 상세 이미지를 확인하세요.', '차량 컵홀더에 넣을 계획이면 하단 지름을 꼭 보세요.'],
    caution: '빨대형 텀블러는 구조상 뒤집어 보관하면 새기 쉽습니다. 이동용이라면 잠금형 뚜껑을 우선으로 보세요.',
    exclude: /뚜껑만|빨대만|파우치|세척솔/i,
  },
  {
    slug: 'easy-clean-air-circulator-review-complaints-guide',
    data: 'coupang-complaint-easy-clean-air-circulator.json',
    productType: 'complaint_easy_clean_air_circulator',
    keyword: '분리세척 서큘레이터 추천',
    shortTitle: '분리세척 서큘레이터',
    title: '분리세척 서큘레이터 추천, 청소 어렵고 소음 크다는 후기 불만 기준',
    description: '분리세척 서큘레이터 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 청소, 소음, 바람 세기 불만을 기준으로 정리했습니다.',
    complaints: ['먼지가 끼는데 앞망 분리가 어렵다', '잘 때 쓰기에는 소음이 거슬린다', '바람이 멀리 가지 않거나 너무 직선적이다'],
    needs: ['공구 없이 앞망을 분리할 수 있는 구조', 'BLDC 모터와 세밀한 풍량 단계', '상하좌우 회전과 공기순환 각도'],
    criteria: ['앞망·날개 분리 방식이 상세페이지에 명확한지 보세요.', '수면용이면 최저 단계 소음과 표시등 밝기도 확인하세요.', '에어컨 보조용이면 직진성보다 회전 범위와 풍량 단계를 보세요.'],
    caution: '서큘레이터는 실내 공기를 섞어주는 제품입니다. 실내 온도를 직접 낮추는 제품은 아니므로 냉방기와 함께 쓰는 목적을 분명히 잡는 게 좋아요.',
    exclude: /선풍기망|커버|날개만|부품/i,
  },
  {
    slug: 'windproof-uv-umbrella-review-complaints-guide',
    data: 'coupang-complaint-windproof-uv-umbrella.json',
    productType: 'complaint_windproof_uv_umbrella',
    keyword: '튼튼한 양우산 추천',
    shortTitle: '튼튼한 양우산',
    title: '튼튼한 양우산 추천, 뒤집힘·무게·차단 후기 불만 줄이는 기준',
    description: '튼튼한 양우산 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 뒤집힘, 무게, 자외선 차단 불만을 기준으로 정리했습니다.',
    complaints: ['바람 불면 우산이 쉽게 뒤집힌다', '자동 우산은 편하지만 무겁다', '차단된다고 했는데 햇빛이 비친다'],
    needs: ['살대 수와 프레임 강도가 안정적인 구조', '가방에 넣기 좋은 접이 길이와 무게', '암막 코팅과 UV 차단 표기'],
    criteria: ['살대 수만 보지 말고 소재와 연결부 마감도 함께 보세요.', '매일 휴대용이면 자동 기능보다 무게와 접은 길이가 우선일 수 있어요.', '양산 겸용이면 안쪽 암막 코팅과 겉감 방수 여부를 같이 보세요.'],
    caution: '강풍에서는 어떤 우산도 안전을 보장하지 못합니다. 바람이 강한 날에는 우산보다 우비나 실내 이동을 우선으로 생각하세요.',
    exclude: /거치대|커버|장우산꽂이/i,
  },
  {
    slug: 'breathable-diaper-review-complaints-guide',
    data: 'coupang-complaint-breathable-diaper.json',
    productType: 'complaint_breathable_diaper',
    keyword: '통기성 기저귀 추천',
    shortTitle: '통기성 기저귀',
    title: '통기성 기저귀 추천, 발진·샘·답답함 후기 불만을 줄이는 기준',
    description: '통기성 기저귀 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 발진, 샘, 통기 불만을 기준으로 제품 선택법을 정리했습니다.',
    complaints: ['오래 착용하면 발진이 걱정된다', '밤새 쓰면 옆으로 샌다', '두껍고 답답해 보여 통기가 아쉽다'],
    needs: ['피부에 닿는 면의 부드러움과 통기성', '밤 사용을 버티는 흡수량과 샘 방지 라인', '체형에 맞는 사이즈와 밴드 탄성'],
    criteria: ['몸무게 기준만 보지 말고 허벅지와 허리 체형을 함께 보세요.', '밤기저귀용인지 낮 활동용인지 사용 시간을 먼저 나누세요.', '피부가 예민하면 향료, 표면 소재, 교체 주기까지 함께 관리하세요.'],
    caution: '발진이 반복되거나 진물이 나면 제품 교체만으로 버티지 말고 진료를 먼저 고려해야 합니다.',
    exclude: /나시|의류|물티슈|크림|패드 30매/i,
  },
  {
    slug: 'odorless-mosquito-repellent-review-complaints-guide',
    data: 'coupang-complaint-odorless-mosquito-repellent.json',
    productType: 'complaint_odorless_mosquito_repellent',
    keyword: '무향 모기기피제 추천',
    shortTitle: '무향 모기기피제',
    title: '무향 모기기피제 추천, 냄새·지속시간·아이 사용 후기 불만 기준',
    description: '무향 모기기피제 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 냄새, 지속시간, 아이 사용 불만을 기준으로 정리했습니다.',
    complaints: ['향이 강해서 머리가 아프거나 아이가 싫어한다', '금방 날아가 다시 뿌려야 한다', '피부에 직접 써도 되는지 불안하다'],
    needs: ['향이 약하거나 무향에 가까운 제형', '사용 가능 연령과 지속시간 안내', '피부 사용 부위와 재도포 기준'],
    criteria: ['성분명과 사용 가능 연령을 먼저 확인하세요.', '캠핑처럼 긴 야외 활동이면 재도포 간격을 챙기세요.', '아이와 함께 쓰면 손, 눈가, 입 주변 사용 제한을 꼭 확인하세요.'],
    caution: '모기기피제는 감염 예방을 보장하는 제품이 아닙니다. 긴 옷, 방충망, 고인 물 제거 같은 생활 관리와 함께 써야 해요.',
    exclude: /전기|훈증|트랩|랜턴|살충/i,
  },
  {
    slug: 'quick-dry-aqua-shoes-review-complaints-guide',
    data: 'coupang-complaint-quick-dry-aqua-shoes.json',
    productType: 'complaint_quick_dry_aqua_shoes',
    keyword: '미끄럼 방지 아쿠아슈즈 추천',
    shortTitle: '미끄럼 방지 아쿠아슈즈',
    title: '미끄럼 방지 아쿠아슈즈 추천, 미끄럼·건조·쓸림 후기 불만 기준',
    description: '미끄럼 방지 아쿠아슈즈 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 미끄럼, 건조, 발 쓸림 불만을 기준으로 정리했습니다.',
    complaints: ['물놀이장 바닥에서 생각보다 미끄럽다', '젖은 뒤 잘 마르지 않아 냄새가 난다', '발등이나 뒤꿈치가 쓸린다'],
    needs: ['바닥 접지 패턴과 배수 구멍', '빠르게 마르는 메쉬 또는 니트 소재', '발을 감싸되 조이지 않는 핏'],
    criteria: ['바닥 패턴과 밑창 두께를 상세 이미지로 확인하세요.', '해변용인지 워터파크용인지 바닥 환경에 맞춰 고르세요.', '발볼이 넓거나 발등이 높다면 조절 스트랩이 있는 구성을 보세요.'],
    caution: '아쿠아슈즈도 젖은 타일이나 이끼 낀 바닥에서는 미끄러질 수 있습니다. 물가에서는 뛰지 않는 습관이 먼저예요.',
    exclude: /양말|깔창|가방/i,
  },
  {
    slug: 'supportive-seat-cushion-review-complaints-guide',
    data: 'coupang-complaint-supportive-seat-cushion.json',
    productType: 'complaint_supportive_seat_cushion',
    keyword: '허리 편한 방석 추천',
    shortTitle: '허리 편한 방석',
    title: '허리 편한 방석 추천, 꺼짐·미끄러짐·냄새 후기 불만 기준',
    description: '허리 편한 방석 추천을 위해 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 꺼짐, 미끄러짐, 냄새 불만을 기준으로 선택법을 정리했습니다.',
    complaints: ['며칠 쓰니 쿠션이 꺼지는 느낌이 든다', '의자 위에서 방석이 자꾸 미끄러진다', '처음 개봉했을 때 냄새가 난다'],
    needs: ['복원력이 있는 메모리폼이나 젤 구조', '논슬립 바닥과 의자 크기 호환', '커버 분리세탁과 환기 가능한 소재'],
    criteria: ['두께보다 복원력과 체중 지지 범위를 먼저 보세요.', '의자 좌판 크기와 방석 가로세로 치수를 비교하세요.', '냄새에 민감하면 커버 세탁 가능 여부와 소재 안내를 확인하세요.'],
    caution: '허리 통증이 심하거나 다리 저림이 동반되면 방석만으로 버티지 말고 자세, 의자 높이, 진료 필요성까지 함께 봐야 합니다.',
    exclude: /의자체어|학생의자|커버만|발받침/i,
  },
];

const externalSources = {
  'quiet-dehumidifier-review-complaints-guide': [
    ['WIRED 제습기 리뷰: 소음, 배수, 필터 관리 언급', 'https://www.wired.com/review/frigidaire-35-pint-dehumidifier'],
    ['Ideal Home 제습기 리뷰: 모드별 소음과 이동성 언급', 'https://www.idealhome.co.uk/house-manual/air-quality/meaco-dd8l-pro-desiccant-dehumidifier-review'],
    ['Good Housekeeping 제습기 가이드: 용량, 배수, 내구성 기준', 'https://www.goodhousekeeping.com/appliances/g71230706/best-basement-dehumidifiers/'],
  ],
  'non-slip-cooling-pad-review-complaints-guide': [
    ['Tom\'s Guide 냉감 토퍼 리뷰: 열감, 커버 세탁, 고정 스트랩 언급', 'https://www.tomsguide.com/wellness/mattresses/tempur-pedic-tempur-adapt-cooling-mattress-topper'],
  ],
  'lightweight-power-bank-review-complaints-guide': [
    ['TechRadar 보조배터리 리콜 기사: 과열 위험과 모델 확인 필요성', 'https://www.techradar.com/phones/phone-accessories/belkin-is-recalling-thousands-of-charging-banks-and-stands-due-to-a-fire-risk-heres-how-to-check-your-model'],
    ['The Sun 보조배터리 구매 주의: 과장 용량, 출력, 발열 보호 기능', 'https://www.thesun.ie/tech/15004891/battery-power-banks-fake-counterfeit-prove-fires/'],
  ],
  'leakproof-tumbler-review-complaints-guide': [
    ['Good Housekeeping 텀블러 리뷰: 누수와 뚜껑 세척 난이도 언급', 'https://www.goodhousekeeping.com/home-products/a65888222/stanley-quencher-tumbler-review/'],
    ['Food & Wine 텀블러 세척 도구 기사: 냄새, 곰팡이, 작은 부품 세척 문제', 'https://www.foodandwine.com/water-bottle-tumbler-cleaning-tool-deals-amazon-11743787'],
    ['Serious Eats 텀블러 리뷰: 누수 방지, 세척, 냄새 잔류 문제 언급', 'https://www.seriouseats.com/owala-smoothsip-slider-ceramic-travel-mug-tested-review-11994442'],
  ],
  'easy-clean-air-circulator-review-complaints-guide': [
    ['TechRadar 서큘레이터 리뷰: 소음 측정과 풍량 언급', 'https://www.techradar.com/home/air-quality/levoit-circulair-pedestal-fan-review'],
    ['The Verge 서큘레이터 리뷰: 소음, 배터리, 공기순환 범위 언급', 'https://www.theverge.com/tech/952855/switchbot-standing-circulator-fan-review'],
    ['WIRED 타워팬 리뷰: 청소 가능한 먼지망, 소음, 바람 방향 언급', 'https://www.wired.com/review/shark-turboblade'],
  ],
  'windproof-uv-umbrella-review-complaints-guide': [
    ['WSJ Buyside 우산 리뷰: 강풍, 무게, 접은 길이, 건조 속도 언급', 'https://www.wsj.com/buyside/travel/travel-gear/blunt-metro-umbrella-review'],
  ],
  'breathable-diaper-review-complaints-guide': [
    ['Verywell Family 기저귀 리뷰: 핏, 샘, 발진 불만 언급', 'https://www.verywellfamily.com/huggies-little-movers-slip-on-diapers-289916'],
    ['Wikipedia diaper dermatitis: 기저귀 발진 원인과 관리 개요', 'https://en.wikipedia.org/wiki/Irritant_diaper_dermatitis'],
  ],
  'odorless-mosquito-repellent-review-complaints-guide': [
    ['Verywell Health 모기기피제 자료: 향, 지속시간, 성분별 차이 언급', 'https://www.verywellhealth.com/natural-mosquito-repellents-88853'],
  ],
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readProducts(page) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', page.data), 'utf8'));
  const seen = new Set();
  return (data.items || [])
    .filter((product) => product.keyword !== 'Gold box')
    .filter((product) => !page.exclude || !page.exclude.test(product.productName || ''))
    .filter((product) => {
      const key = product.productId || product.productName;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function productImage(product) {
  return product.productImage || '/images/favicon.png';
}

function productUrl(product, page) {
  return product.productUrl || `https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=${page.productType}&pageKey=${encodeURIComponent(page.keyword)}`;
}

function priceLabel(product) {
  if (typeof product.productPrice !== 'number') {
    return '가격 확인';
  }
  return `${product.productPrice.toLocaleString('ko-KR')}원`;
}

function imageObject(product) {
  const url = productImage(product);
  if (url.startsWith('http')) {
    return {
      '@type': 'ImageObject',
      url,
      width: 657,
      height: 657,
    };
  }
  return `${site}${url}`;
}

function sourceSection(page) {
  const sources = externalSources[page.slug] || [];
  if (!sources.length) {
    return '';
  }

  return `
            <h2>참고한 공개 웹 후기와 자료</h2>
            <p>아래 자료는 불만 유형을 일반화할 때 참고한 공개 웹 리뷰와 안전 정보입니다. 특정 상품의 성능을 보장하는 근거가 아니라, 구매 전 확인할 포인트를 정리하기 위한 참고 자료로 봐주세요.</p>
            <ul>
              ${sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join('\n              ')}
            </ul>`;
}

function pageHtml(page) {
  const products = readProducts(page);
  const hero = products[0] || {};
  const heroImage = productImage(hero);
  const heroName = hero.productName || page.shortTitle;
  const heroUrl = productUrl(hero, page);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: page.description,
    image: imageObject(hero),
    thumbnailUrl: heroImage,
    datePublished: date,
    dateModified: date,
    inLanguage: 'ko-KR',
    mainEntityOfPage: `${site}/blog/${page.slug}.html`,
    author: {
      '@type': 'Person',
      name: '골드픽',
    },
    publisher: {
      '@type': 'Organization',
      name: '골드픽',
      logo: {
        '@type': 'ImageObject',
        url: `${site}/images/favicon.png`,
      },
    },
    keywords: [page.keyword, ...page.complaints, ...page.needs].join(', '),
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
  <title>${escapeHtml(page.title)} | 골드픽</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${site}/blog/${page.slug}.html">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${site}/blog/${page.slug}.html">
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
${JSON.stringify(jsonLd, null, 2)}
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
          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${escapeHtml(page.shortTitle)}</a>
          <a href="/blog/quiet-dehumidifier-review-complaints-guide.html" data-blog-path="/blog/quiet-dehumidifier-review-complaints-guide.html">불만 기반 추천</a>
          <a href="/blog/water-500ml-vs-2l-guide.html" data-blog-path="/blog/water-500ml-vs-2l-guide.html">생활 비교</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Review Complaint Needs Guide</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)}</div>
        <p class="blog-intro">${escapeHtml(page.description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/quiet-dehumidifier-review-complaints-guide.html" data-blog-path="/blog/quiet-dehumidifier-review-complaints-guide.html">불만 기반 추천</a>
        <a href="/blog/claw-machine-popular-plush-buying-guide.html" data-blog-path="/blog/claw-machine-popular-plush-buying-guide.html">인기 인형</a>
        <a href="/blog/water-500ml-vs-2l-guide.html" data-blog-path="/blog/water-500ml-vs-2l-guide.html">생활 비교</a>
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
              <span>후기 불만을 구매 기준으로 바꿔 보는 생활 상품 노트입니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#complaints">불만 정리 <span>후기</span></a>
              <a href="#needs">고객 니즈 <span>해석</span></a>
              <a href="#criteria">선택 기준 <span>3가지</span></a>
              <a href="#products">추천 후보 <span>상품</span></a>
            </div>
          </section>
        </div>
      </aside>

      <section class="blog-main">
        <article class="blog-article-shell">
          <div class="blog-article-meta"><span>${dateText}</span><span>카테고리 · 불만 기반 상품 추천</span></div>
          <h1 class="blog-article-title">${escapeHtml(page.title)}</h1>

          <div class="article-summary-box">
            <span class="memo-note memo-note--summary">${escapeHtml(page.keyword)}</span><br>
            쿠팡 상품 정보와 공개 웹 후기에서 반복되는 불만 유형을 기준으로, 고객 니즈에 맞는 선택 기준을 정리했습니다.<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.complaints.join(' · '))}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.keyword)} 참고 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(heroUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(heroName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">${escapeHtml(page.shortTitle)} 참고 상품</span>
              <strong>${escapeHtml(heroName)}</strong>
              <p>후기 불만을 줄이려면 가격보다 먼저 사용 환경과 불편 포인트가 맞는지 확인해야 해요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(heroUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>추천 후보는 실제 상품 정보와 후기에서 반복되는 불만을 함께 보고 비교하는 용도입니다.</figcaption>
          </figure>

          <div class="article-body">
            <p class="article-lead">상품 후기를 읽다 보면 별점보다 더 중요한 신호가 있어요. 바로 사람들이 반복해서 남기는 불편함입니다. ${escapeHtml(page.keyword)}을 찾을 때도 “좋다”는 말보다 어떤 부분에서 불만이 생겼는지를 먼저 보면 실패 확률을 줄일 수 있어요.</p>

            <h2 id="complaints">후기에서 자주 보이는 불만</h2>
            <p>이 글은 쿠팡 상품 정보와 공개 웹 후기에서 반복되는 불만 유형을 바탕으로 정리했습니다. 특정 상품을 단정적으로 평가하기보다, 같은 카테고리에서 자주 나오는 불편을 구매 전 체크리스트로 바꾸는 데 목적이 있어요.</p>
            <ul>
              ${page.complaints.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ul>

            <h2 id="needs">고객 니즈로 바꾸면 이렇게 봐야 해요</h2>
            <p>불만을 뒤집어 보면 제품을 고를 때 진짜 필요한 조건이 보입니다. ${escapeHtml(page.keyword)}은 광고 문구보다 내 생활 환경에서 불편을 줄여주는지를 기준으로 비교하는 편이 좋아요.</p>
            <div class="article-choice-grid">
              ${page.needs.map((need) => `<section class="article-choice-card"><h3>고객 니즈</h3><p>${escapeHtml(need)}</p></section>`).join('\n              ')}
            </div>

            <h2 id="criteria">선택 기준 3가지</h2>
            <ul>
              ${page.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ul>
            <p><strong>${escapeHtml(page.caution)}</strong></p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2 id="products">${escapeHtml(page.keyword)} 참고 상품</h2>
            <p>아래 상품은 2026년 7월 8일 쿠팡 파트너스 검색 결과를 바탕으로 추린 후보입니다. 가격, 배송, 구성은 바뀔 수 있으니 구매 전 상세 페이지에서 다시 확인하세요.</p>
            <div class="article-product-detail-list">
              ${products.map((product, index) => `
              <section class="article-product-detail-card">
                <a href="${escapeHtml(productUrl(product, page))}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">
                  <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.productName)}" width="180" height="180" loading="lazy">
                </a>
                <div>
                  <span class="memo-note">후보 ${index + 1}</span>
                  <h3>${escapeHtml(product.productName)}</h3>
                  <p>${escapeHtml(priceLabel(product))} · ${product.isRocket ? '로켓배송 표시' : '배송 조건 확인 필요'} · ${product.isFreeShipping ? '무료배송 표시' : '배송비 확인 필요'}</p>
                  <p>후기 불만을 줄이려면 상세 페이지의 규격, 소재, 구성품, 사용 제한을 한 번 더 확인해보세요.</p>
                  <a class="product-detail-btn" href="${escapeHtml(productUrl(product, page))}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">현재 가격 확인하기</a>
                </div>
              </section>`).join('\n')}
            </div>

            ${sourceSection(page)}

            <h2>마무리</h2>
            <p>${escapeHtml(page.keyword)}을 고를 때는 “인기 상품”이라는 말만 믿기보다, 반복되는 불만이 내 상황에서도 문제가 될지 먼저 생각해보세요. 불만을 기준으로 보면 필요한 기능과 포기해도 되는 기능이 훨씬 선명해집니다.</p>
            <p>내 돈을 쓰는 일이라면 조금 천천히 비교해도 괜찮아요. 오늘의 선택이 내일의 불편을 줄여주는 쪽이면 충분히 좋은 구매입니다.</p>
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
  const product = readProducts(page)[0] || {};
  return `          <article class="blog-card" data-blog-category="life goods complaints">
            <a href="/blog/${page.slug}.html" class="blog-card-link">
              <div class="blog-card-media blog-card-media--contain">
                <img class="is-active" src="${escapeHtml(productImage(product))}" alt="${escapeHtml(page.shortTitle)} 대표 이미지" loading="lazy">
                <span class="blog-card-badge">불만 기반 추천</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">고객 니즈 상품 · ${dateText}</div>
                <h3>${escapeHtml(page.title)}</h3>
                <p>후기에서 자주 보이는 불만을 고객 니즈로 바꿔 선택 기준과 참고 상품을 정리했습니다.</p>
                <div class="blog-card-tags">
                  <span>#후기불만</span>
                  <span>#고객니즈</span>
                  <span>#${escapeHtml(page.shortTitle.replaceAll(' ', ''))}</span>
                </div>
              </div>
            </a>
          </article>`;
}

function patchIndex() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const page of pages) {
    const cardPattern = new RegExp(`\\r?\\n?\\s*<article class="blog-card" data-blog-category="[^"]*">\\r?\\n\\s*<a href="/blog/${page.slug}\\.html"[\\s\\S]*?\\r?\\n\\s*</article>`, 'g');
    html = html.replace(cardPattern, '');
    const navPattern = new RegExp(`\\n\\s*<a href="/blog/${page.slug}\\.html" data-blog-path="/blog/${page.slug}\\.html">[^<]*</a>`, 'g');
    html = html.replace(navPattern, '');
    const jsonPattern = new RegExp(`\\n?\\s*\\{\\n\\s*"@type": "BlogPosting",[\\s\\S]*?"url": "https://idont82\\.github\\.io/blog/${page.slug}\\.html",[\\s\\S]*?\\n\\s*\\},`, 'g');
    html = html.replace(jsonPattern, '');
  }

  const cards = pages.map(indexCard).join('\n\n');
  const anchorPattern = /          <article class="blog-card" data-blog-category="[^"]*">\r?\n            <a href="\/blog\/water-500ml-vs-2l-guide\.html"/;
  const anchorMatch = html.match(anchorPattern);
  html = anchorMatch
    ? html.replace(anchorMatch[0], `${cards}\n\n${anchorMatch[0]}`)
    : html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${cards}\n\n`);

  const navLinks = pages.slice(0, 4).map((page) => `          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${escapeHtml(page.shortTitle)}</a>`).join('\n');
  html = html.replace('          <a href="/blog/water-500ml-vs-2l-guide.html"', `${navLinks}\n          <a href="/blog/water-500ml-vs-2l-guide.html"`);

  const blogPostItems = pages.map((page) => {
    const product = readProducts(page)[0] || {};
    return `        {
          "@type": "BlogPosting",
          "headline": "${escapeHtml(page.title)}",
          "url": "${site}/blog/${page.slug}.html",
          "image": ${JSON.stringify(productImage(product))},
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
    const existing = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`, 'g');
    xml = xml.replace(existing, '');
  }
  const entries = pages.map((page) => `  <url>
    <loc>${site}/blog/${page.slug}.html</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
  xml = xml.replace('</urlset>', `${entries}\n</urlset>`);
  fs.writeFileSync(sitemapPath, xml, 'utf8');
}

function main() {
  for (const page of pages) {
    fs.writeFileSync(path.join(root, 'blog', `${page.slug}.html`), pageHtml(page), 'utf8');
  }
  patchIndex();
  patchSitemap();
  for (const page of pages) {
    console.log(`/blog/${page.slug}.html`);
  }
}

main();
