const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = 'https://idont82.github.io';
const date = '2026-06-24';
const dateText = '2026.06.24';
const disclosure = '쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.';
const mobileTopAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=992213&template=carousel&trackingCode=AF7523287&subId=&width=380&height=50&tsource=" width="380" height="50" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const articleAdIframe = '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';
const rightRailAdIframe = '<iframe class="blog-ad-frame" src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>';

const commonSources = [
  ['NIH ODS Dietary Supplements', 'https://ods.od.nih.gov/factsheets/DietarySupplements-Consumer/']
];

const pages = [
  {
    slug: 'bnr17-diet-probiotics-home-shopping-guide',
    data: 'coupang-bnr17-diet-probiotics.json',
    productType: 'bnr17_diet_probiotics',
    category: '건강식품',
    badge: '방송 건강식품',
    shortTitle: '다이어트 유산균',
    keyword: '다이어트 유산균 추천',
    subKeywords: ['비에날씬 다이어트 유산균', 'BNR17 유산균', '유산균 고르는 법'],
    titles: [
      '다이어트 유산균 추천, 홈쇼핑 방송 보고 바로 사기 전 확인할 것',
      '비에날씬 다이어트 유산균이 궁금하다면 성분표부터 보세요',
      '다이어트 유산균 추천 전에 BNR17과 보장균수를 따져보는 법'
    ],
    description: '홈쇼핑에서 비에날씬 다이어트 유산균을 보고 고민하는 분들을 위해 BNR17, 보장균수, 섭취 편의성, 대체 상품 기준을 정리했습니다.',
    opener: '요즘 체중 관리가 마음처럼 되지 않아 답답하셨죠? 식단도 신경 쓰고 걷기도 해보는데, 방송에서 다이어트 유산균이 나오면 괜히 눈길이 갈 수밖에 없어요. 다만 급한 마음으로 고르기보다 내 생활에 맞는지 차분히 보는 게 먼저예요.',
    why: '유산균은 균주마다 연구된 방향이 다르고, 체중 관리는 식사와 활동량의 영향을 크게 받아요. NIH ODS도 프로바이오틱스는 균주와 CFU, 사용 목적을 함께 봐야 한다고 설명해요. 그래서 다이어트 유산균 추천 글을 볼 때도 특정 제품명보다 균주명과 보장균수를 먼저 확인하는 편이 좋아요.',
    criteria: [
      'BNR17처럼 균주명이 구체적으로 적혀 있는지 확인해요.',
      '제조 시점 균수가 아니라 유통기한까지 보장되는 CFU인지 봐요.',
      '분말, 캡슐, 냉장 보관 여부가 내 생활 루틴과 맞는지 따져봐요.'
    ],
    caution: '**유산균은 체중 감량을 보장하는 제품이 아니에요.** 면역저하 상태이거나 복부 불편감이 심한 분은 섭취 전 전문가와 상담하는 게 좋아요.',
    close: '다이어트 유산균 추천을 찾는 마음은 결국 내 몸을 조금 더 편하게 돌보고 싶다는 뜻일 거예요. 방송 상품이든 대체 상품이든, 꾸준히 먹을 수 있는 구성과 생활 습관을 함께 보는 선택을 응원해요.',
    sources: [
      ['NIH ODS Probiotics', 'https://ods.od.nih.gov/factsheets/Probiotics-Consumer/'],
      ...commonSources
    ],
    tags: ['#다이어트유산균', '#BNR17', '#홈쇼핑건강식품']
  },
  {
    slug: 'glutathione-film-home-shopping-guide',
    data: 'coupang-glutathione-film.json',
    productType: 'glutathione_film',
    category: '건강식품',
    badge: '방송 건강식품',
    shortTitle: '글루타치온',
    keyword: '글루타치온 추천',
    subKeywords: ['에스더포뮬러 글루타치온', '글루타치온 필름', '글루타치온 고르는 법'],
    titles: [
      '글루타치온 추천, 홈쇼핑 필름형 제품 보기 전 성분 체크',
      '에스더포뮬러 글루타치온 방송을 봤다면 함량과 형태부터 보세요',
      '글루타치온 추천 전에 리포좀·필름형·비타민C를 비교하는 법'
    ],
    description: '글루타치온 필름형 방송 상품을 보고 고민하는 분들을 위해 함량, 제형, 비타민C 조합, 대체 상품 선택 기준을 정리했습니다.',
    opener: '피곤한 날이 길어지면 얼굴빛까지 신경 쓰이죠. 그럴 때 홈쇼핑에서 글루타치온 제품이 나오면 “나도 챙겨볼까” 하는 생각이 자연스럽게 들어요. 하지만 피부 표현만 보고 고르기에는 확인할 것이 꽤 많아요.',
    why: '글루타치온은 체내 항산화 시스템과 관련해 자주 언급되지만, 건강기능식품 문구처럼 과장해서 이해하면 곤란해요. 비타민C는 콜라겐 형성과 항산화 기능에 관여하는 영양소로 알려져 있어 함께 배합되는 경우가 많아요. 글루타치온 추천 글에서는 제형보다 1일 섭취량과 함께 들어간 영양소를 먼저 확인해야 해요.',
    criteria: [
      '환원형, 리포좀, 필름형 등 제형 설명이 과장 문구인지 실제 원료 정보인지 구분해요.',
      '1매 또는 1포 기준 글루타치온 함량과 총 섭취일수를 같이 계산해요.',
      '비타민C, 셀레늄 등 부원료가 중복 섭취되지 않는지 확인해요.'
    ],
    caution: '**글루타치온은 피부 미백 치료제가 아니에요.** 임신·수유 중이거나 질환 치료 중이라면 새 보조식품을 시작하기 전 상담이 필요해요.',
    close: '글루타치온 추천 제품을 찾는다면 광고 문장보다 성분표가 더 친절한 답을 줘요. 지금의 피곤함을 탓하지 말고, 나에게 무리 없는 루틴부터 천천히 만들어보세요.',
    sources: [
      ['NIH ODS Vitamin C', 'https://ods.od.nih.gov/factsheets/VitaminC-Consumer/'],
      ...commonSources
    ],
    tags: ['#글루타치온', '#글루타치온필름', '#항산화영양제']
  },
  {
    slug: 'black-goat-extract-home-shopping-guide',
    data: 'coupang-black-goat-extract.json',
    productType: 'black_goat_extract',
    category: '건강식품',
    badge: '방송 건강식품',
    shortTitle: '흑염소 진액',
    heroImage: '/images/black-goat-extract-guide.png',
    fallbackProducts: [
      {
        productName: '흑염소 진액 검색 결과 비교',
        productPrice: 0,
        productImage: '/images/black-goat-extract-guide.png',
        productUrl: 'https://link.coupang.com/re/AFFSRP?lptag=AF7523287&subid=health-tv-black-goat&pageKey=%ED%9D%91%EC%97%BC%EC%86%8C%EC%A7%84%EC%95%A1',
        categoryName: '건강식품'
      }
    ],
    keyword: '흑염소 진액 추천',
    subKeywords: ['이경제 흑염소진액', '흑염소 진액 고르는 법', '부모님 건강식품'],
    titles: [
      '흑염소 진액 추천, 홈쇼핑 방송 보고 부모님 선물 전 확인할 점',
      '이경제 흑염소진액이 궁금하다면 원재료와 당류부터 보세요',
      '흑염소 진액 추천 전에 농축액 비율과 부원료를 따져보는 법'
    ],
    description: '흑염소 진액 방송을 보고 구매를 고민하는 분들을 위해 원재료, 농축액 비율, 당류, 섭취 주의사항과 대체 상품 기준을 정리했습니다.',
    opener: '부모님이 기운 없어 보일 때 마음이 쓰이죠. 홈쇼핑에서 흑염소 진액이 나오면 선물로 괜찮을지 한 번쯤 고민하게 돼요. 따뜻한 마음일수록 성분표는 더 깐깐하게 보는 게 좋아요.',
    why: '흑염소 진액은 전통적으로 보양식 이미지가 강하지만, 건강기능식품 기능성을 모두 가진 제품은 아니에요. 제품마다 흑염소 추출액 비율, 고형분, 부원료, 당류가 달라 실제 구성 차이가 큽니다. 흑염소 진액 추천을 볼 때는 “진하다”는 말보다 원재료 함량을 먼저 봐야 해요.',
    criteria: [
      '흑염소 추출액 비율과 고형분 표시가 구체적인지 확인해요.',
      '단맛을 내는 원료나 당류가 많은 제품인지 살펴봐요.',
      '파우치 용량, 1일 섭취량, 총 섭취일수를 가격과 함께 계산해요.'
    ],
    caution: '**특정 질환 회복이나 치료 효과를 기대하고 먹는 제품이 아니에요.** 당 조절이 필요한 분, 소화가 예민한 분은 원재료와 섭취량을 더 신중히 봐야 해요.',
    close: '흑염소 진액 추천 상품은 선물용으로 많이 보지만, 받는 사람의 몸 상태가 먼저예요. 소중한 사람을 위한 마음이 성분표 확인까지 이어진다면 더 좋은 선택이 될 거예요.',
    sources: [
      ...commonSources
    ],
    tags: ['#흑염소진액', '#부모님선물', '#홈쇼핑건강식품']
  },
  {
    slug: 'collagen-retinol-home-shopping-guide',
    data: 'coupang-collagen-peptide.json',
    productType: 'collagen_peptide',
    category: '건강식품',
    badge: '방송 건강식품',
    shortTitle: '저분자 콜라겐',
    keyword: '저분자 콜라겐 추천',
    subKeywords: ['에버콜라겐 레티놀A', '피부 영양제', '콜라겐 고르는 법'],
    titles: [
      '저분자 콜라겐 추천, 홈쇼핑 방송 전 함량과 원료 확인하기',
      '에버콜라겐 레티놀A가 궁금하다면 콜라겐 펩타이드부터 보세요',
      '저분자 콜라겐 추천 전에 비타민C와 섭취일수를 따져보는 법'
    ],
    description: '저분자 콜라겐 방송 상품을 보고 고민하는 분들을 위해 콜라겐 펩타이드, 비타민C, 원료 유래, 대체 상품 기준을 정리했습니다.',
    opener: '거울을 볼 때 피부 탄력이 예전 같지 않다고 느끼면 마음이 괜히 가라앉아요. 그래서 콜라겐 방송은 유독 눈길이 오래 가죠. 다만 피부 고민이 클수록 광고 표현보다 원료와 함량을 더 차분히 봐야 해요.',
    why: '콜라겐 제품은 보통 콜라겐 펩타이드, 비타민C, 히알루론산 같은 부원료 조합으로 구성돼요. 비타민C는 정상적인 콜라겐 형성에 필요한 영양소로 알려져 있어 배합 이유를 이해할 수 있어요. 저분자 콜라겐 추천 글에서는 1일 콜라겐 섭취량과 원료 유래를 같이 보는 게 중요해요.',
    criteria: [
      '콜라겐 펩타이드 1일 섭취량이 명확한지 확인해요.',
      '어류, 돼지, 소 등 원료 유래가 알레르기나 식습관과 맞는지 봐요.',
      '비타민C, 히알루론산, 엘라스틴 등 부원료가 필요한 조합인지 따져봐요.'
    ],
    caution: '**콜라겐은 주름을 없애는 치료제가 아니에요.** 생선 알레르기가 있거나 임신·수유 중이라면 원료 유래와 섭취 가능 여부를 먼저 확인하세요.',
    close: '저분자 콜라겐 추천 제품을 고를 때는 나를 위한 투자라는 마음으로 오래 지속 가능한 구성을 고르는 게 좋아요. 오늘의 작은 관리가 내일의 컨디션을 조금 더 편하게 만들어주길 바라요.',
    sources: [
      ['NIH ODS Vitamin C', 'https://ods.od.nih.gov/factsheets/VitaminC-Consumer/'],
      ...commonSources
    ],
    tags: ['#저분자콜라겐', '#피부영양제', '#콜라겐펩타이드']
  },
  {
    slug: 'lactofit-probiotics-home-shopping-guide',
    data: 'coupang-lactofit-probiotics.json',
    productType: 'lactofit_probiotics',
    category: '건강식품',
    badge: '방송 건강식품',
    shortTitle: '락토핏 유산균',
    keyword: '락토핏 유산균 추천',
    subKeywords: ['종근당건강 락토핏', '가족 유산균', '유산균 고르는 법'],
    titles: [
      '락토핏 유산균 추천, 가족용으로 고르기 전 봐야 할 기준',
      '종근당건강 락토핏 방송을 봤다면 연령별 제품부터 확인하세요',
      '락토핏 유산균 추천 전에 보장균수와 보관법 따져보기'
    ],
    description: '종근당건강 락토핏 계열 유산균을 보고 고민하는 분들을 위해 연령, 보장균수, 균주, 보관법과 대체 상품 기준을 정리했습니다.',
    opener: '가족이 함께 먹을 유산균을 찾다 보면 선택지가 너무 많아 피곤해져요. 익숙한 브랜드가 보이면 안심되지만, 그래도 우리 집에 맞는지는 따로 봐야 해요. 매일 먹는 제품일수록 작은 기준이 중요해요.',
    why: '프로바이오틱스는 균주와 CFU가 제품별로 다르고, 보관 조건에 따라 실제 섭취 시점의 균수도 달라질 수 있어요. NIH ODS는 CFU 숫자만 높다고 건강상 이점이 더 큰 것은 아니라고 설명해요. 락토핏 유산균 추천을 볼 때도 연령별 라인업과 섭취 편의성을 함께 봐야 해요.',
    criteria: [
      '성인용, 키즈용, 시니어용처럼 대상 연령이 맞는지 확인해요.',
      '유통기한까지 보장되는 균수인지 제품 설명을 봐요.',
      '스틱형인지 캡슐형인지, 가족이 매일 먹기 쉬운 제형인지 따져봐요.'
    ],
    caution: '**유산균은 장 질환을 치료하는 약이 아니에요.** 면역력이 약한 분이나 항생제 복용 중인 분은 섭취 시점과 제품 선택을 상담해보는 게 좋아요.',
    close: '락토핏 유산균 추천을 찾는 분들은 결국 가족의 루틴을 챙기고 싶은 마음이 크실 거예요. 무리한 기대보다 매일 편하게 이어갈 수 있는 제품을 고르는 쪽을 응원해요.',
    sources: [
      ['NIH ODS Probiotics', 'https://ods.od.nih.gov/factsheets/Probiotics-Consumer/'],
      ...commonSources
    ],
    tags: ['#락토핏', '#유산균추천', '#가족건강식품']
  },
  {
    slug: 'vitamin-b-fatigue-home-shopping-guide',
    data: 'coupang-vitamin-b-complex.json',
    productType: 'vitamin_b_complex',
    category: '건강식품',
    badge: '피로 루틴',
    shortTitle: '비타민B군',
    keyword: '만성피로 영양제 추천',
    subKeywords: ['직장인 피로회복', '비타민B 컴플렉스', '영양제 고르는 법'],
    titles: [
      '만성피로 영양제 추천, 직장인이 비타민B군을 볼 때 기준',
      '아침이 무거운 3040을 위한 만성피로 영양제 추천 체크리스트',
      '만성피로 영양제 추천 전에 B1·B6·B12 함량부터 보세요'
    ],
    description: '매일 피곤한 직장인을 위해 비타민B군의 역할, 고함량 제품 선택 기준, 섭취 주의사항과 대체 상품을 정리했습니다.',
    opener: '요즘 부쩍 몸이 무거우셨죠? 잠을 자도 개운하지 않고, 출근 준비만 해도 이미 하루치 에너지를 쓴 것 같은 날이 있어요. 그런 분들에게 만성피로 영양제 추천 글은 위로처럼 느껴질 수 있어요.',
    why: '비타민B군은 에너지 대사에 관여하는 영양소가 많아 피로 관련 제품에 자주 들어가요. 특히 B12는 신경 기능과 적혈구 형성에 필요하고, 부족하면 피로감과 관련된 문제가 생길 수 있어요. 만성피로 영양제 추천 제품을 볼 때는 “고함량”보다 내 식습관과 중복 섭취 여부를 먼저 봐야 해요.',
    criteria: [
      'B1, B2, B6, B12가 각각 얼마나 들어 있는지 따로 확인해요.',
      '나이아신 고함량 제품은 얼굴 화끈거림 같은 반응이 있을 수 있어요.',
      '종합비타민을 이미 먹는다면 같은 성분이 과하게 겹치지 않는지 봐요.'
    ],
    caution: '**피로가 오래 지속되거나 체중 감소, 어지럼, 통증이 동반되면 영양제보다 진료가 먼저예요.** 만성피로 영양제 추천은 생활 보조 관점으로만 봐야 해요.',
    close: '만성피로 영양제 추천을 찾는 당신이 게으른 게 아니에요. 몸이 보내는 신호를 돌보려는 마음부터 이미 좋은 시작이에요.',
    sources: [
      ['NIH ODS Vitamin B12', 'https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/'],
      ...commonSources
    ],
    tags: ['#만성피로영양제추천', '#비타민B군', '#직장인피로회복']
  },
  {
    slug: 'red-ginseng-stick-home-shopping-guide',
    data: 'coupang-red-ginseng-stick.json',
    productType: 'red_ginseng_stick',
    category: '건강식품',
    badge: '선물 건강식품',
    shortTitle: '홍삼 스틱',
    keyword: '홍삼 스틱 추천',
    subKeywords: ['홍삼 선물', '진세노사이드', '홍삼 고르는 법'],
    titles: [
      '홍삼 스틱 추천, 부모님 선물 전 진세노사이드 확인하기',
      '홈쇼핑 홍삼 방송을 봤다면 홍삼농축액 함량부터 보세요',
      '홍삼 스틱 추천 전에 당류와 섭취 편의성을 따져보는 법'
    ],
    description: '홍삼 스틱 방송 상품을 보고 선물을 고민하는 분들을 위해 진세노사이드, 홍삼농축액, 당류, 섭취 주의사항을 정리했습니다.',
    opener: '부모님이나 배우자 선물로 홍삼을 떠올리는 분들이 많아요. 익숙하고 정성이 느껴지는 건강식품이라 마음이 가죠. 그렇지만 선물일수록 받는 분의 건강 상태와 성분을 함께 봐야 해요.',
    why: '홍삼은 인삼을 찌고 말려 만든 원료로, 진세노사이드 함량이 주요 확인 포인트로 쓰여요. NCCIH는 아시아 인삼 연구가 늘고 있지만 피로 등에 대한 근거는 아직 일관되지 않다고 설명해요. 홍삼 스틱 추천 제품은 기능성 문구보다 홍삼농축액과 당류를 같이 봐야 해요.',
    criteria: [
      '진세노사이드 Rg1, Rb1, Rg3 합산 함량 표시를 확인해요.',
      '홍삼농축액 비율과 고형분, 원료삼 배합비가 구체적인지 봐요.',
      '달게 만든 스틱인지, 당류와 열량이 부담 없는지 따져봐요.'
    ],
    caution: '**홍삼은 혈당, 혈압, 항응고제 복용과 관련해 주의가 필요할 수 있어요.** 당뇨가 있거나 약을 복용 중인 분은 전문가와 상담하세요.',
    close: '홍삼 스틱 추천은 선물의 마음과 성분의 현실을 같이 보는 일이라고 생각해요. 좋은 마음이 더 편안하게 전달되도록, 성분표까지 한 번 더 살펴보세요.',
    sources: [
      ['NCCIH Asian Ginseng', 'https://www.nccih.nih.gov/health/asian-ginseng'],
      ...commonSources
    ],
    tags: ['#홍삼스틱', '#홍삼선물', '#진세노사이드']
  },
  {
    slug: 'manuka-honey-home-shopping-guide',
    data: 'coupang-manuka-honey.json',
    productType: 'manuka_honey',
    category: '건강식품',
    badge: '건강 간식',
    shortTitle: '마누카꿀',
    keyword: '마누카꿀 추천',
    subKeywords: ['마누카벌집꿀', 'MGO', 'UMF'],
    titles: [
      '마누카꿀 추천, 홈쇼핑 벌집꿀 보기 전 MGO와 당류 체크',
      '마누카벌집꿀이 궁금하다면 UMF·MGO 표시부터 보세요',
      '마누카꿀 추천 전에 가격보다 인증과 섭취량을 따져보는 법'
    ],
    description: '마누카꿀과 벌집꿀 방송 상품을 보고 고민하는 분들을 위해 MGO, UMF, 당류, 주의사항과 대체 상품 기준을 정리했습니다.',
    opener: '목이 칼칼하거나 달콤한 건강 간식이 당길 때 꿀 제품이 유난히 좋아 보여요. 특히 마누카꿀은 프리미엄 이미지가 강해서 선물용으로도 고민하게 되죠. 비싼 제품일수록 인증과 당류를 먼저 봐야 해요.',
    why: '마누카꿀은 MGO, UMF 같은 지표로 차별화되어 판매되는 경우가 많아요. 다만 꿀은 기본적으로 당류가 있는 식품이라 건강식품처럼 과하게 기대하면 안 돼요. 마누카꿀 추천 제품은 인증 표시와 섭취량, 가격 대비 용량을 함께 비교해야 해요.',
    criteria: [
      'MGO 또는 UMF 등급이 구체적으로 표시되어 있는지 확인해요.',
      '원산지와 수입·검사 정보가 명확한지 봐요.',
      '1회 섭취량 기준 당류와 열량이 부담스럽지 않은지 따져봐요.'
    ],
    caution: '**12개월 미만 영아에게 꿀을 먹이면 안 돼요.** 당 조절이 필요한 분이나 벌·꿀 알레르기가 있는 분도 주의가 필요해요.',
    close: '마누카꿀 추천 상품은 약이 아니라 조금 특별한 식품으로 보는 게 좋아요. 나를 달래는 작은 간식이 되되, 몸에 부담이 되지 않는 선에서 즐기세요.',
    sources: [
      ['FDA Food Facts for Consumers', 'https://www.fda.gov/food/information-consumers-using-dietary-supplements'],
      ...commonSources
    ],
    tags: ['#마누카꿀', '#MGO', '#건강간식']
  },
  {
    slug: 'daily-nuts-home-shopping-guide',
    data: 'coupang-daily-nuts.json',
    productType: 'daily_nuts',
    category: '건강식품',
    badge: '건강 간식',
    shortTitle: '하루견과',
    keyword: '하루견과 추천',
    subKeywords: ['마시는하루견과', '견과류 고르는 법', '건강 간식'],
    titles: [
      '하루견과 추천, 홈쇼핑 건강간식 고르기 전 원물 비율 체크',
      '마시는하루견과가 궁금하다면 당류와 견과 함량부터 보세요',
      '하루견과 추천 전에 산패와 포장 방식을 따져보는 법'
    ],
    description: '하루견과와 마시는 견과 방송 상품을 보고 고민하는 분들을 위해 원물 비율, 당류, 산패, 포장 방식과 대체 상품 기준을 정리했습니다.',
    opener: '바쁜 아침에 끼니를 놓치면 작은 간식 하나가 크게 위로가 되죠. 견과류는 간편해서 자주 찾게 되지만, 제품마다 구성 차이가 꽤 커요. 건강 간식일수록 당류와 원물 비율을 먼저 봐야 해요.',
    why: '견과류는 불포화지방, 식이섬유, 미네랄을 함께 섭취할 수 있는 식품이에요. 하지만 초콜릿, 요거트 코팅, 건과일이 많으면 당류가 빠르게 늘어날 수 있어요. 하루견과 추천 제품은 견과 원물 비율과 개별 포장 상태가 핵심이에요.',
    criteria: [
      '아몬드, 호두, 캐슈넛 등 견과 원물 비율이 높은지 확인해요.',
      '건과일과 코팅 원료 때문에 당류가 높아지지 않았는지 봐요.',
      '산패를 줄이기 위해 개별 포장과 유통기한을 확인해요.'
    ],
    caution: '**견과류 알레르기가 있는 분은 반드시 피해야 해요.** 열량이 높은 편이라 한 번에 많이 먹기보다 1회분을 정해두는 게 좋아요.',
    close: '하루견과 추천은 거창한 건강 관리보다 바쁜 하루에 덜 무너지는 간식을 고르는 일이에요. 작은 한 봉지가 내 식사 리듬을 지켜주는 선택이 되길 바라요.',
    sources: [
      ['NIH ODS Magnesium', 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/'],
      ['NIH ODS Omega-3', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/'],
      ...commonSources
    ],
    tags: ['#하루견과', '#건강간식', '#견과류추천']
  },
  {
    slug: 'magnesium-supplement-home-shopping-guide',
    data: 'coupang-magnesium-supplement.json',
    productType: 'magnesium_supplement',
    category: '건강식품',
    badge: '수면 루틴',
    shortTitle: '마그네슘',
    keyword: '마그네슘 영양제 추천',
    subKeywords: ['눈떨림 영양제', '수면 루틴', '마그네슘 고르는 법'],
    titles: [
      '마그네슘 영양제 추천, 눈떨림과 수면 루틴 전에 확인할 기준',
      '마그네슘 영양제 추천 전에 산화·구연산·킬레이트 차이 보기',
      '피곤한 밤을 위한 마그네슘 영양제 추천 체크리스트'
    ],
    description: '마그네슘 영양제를 찾는 분들을 위해 형태별 차이, 1일 섭취량, 위장 부담, 복용 주의사항과 대체 상품 기준을 정리했습니다.',
    opener: '밤이 되어도 몸이 긴장된 느낌이 남아 있으면 참 지치죠. 눈가가 떨리거나 잠들기 어려운 날이 반복되면 마그네슘을 찾아보게 돼요. 그럴수록 내 몸에 부담 없는 형태인지 천천히 확인해야 해요.',
    why: '마그네슘은 근육과 신경 기능, 에너지 생성에 관여하는 필수 미네랄이에요. 제품은 산화마그네슘, 구연산마그네슘, 글리시네이트 등 형태가 다양하고 흡수감과 위장 부담이 다를 수 있어요. 마그네슘 영양제 추천 글에서는 원료 형태와 1일 섭취량을 함께 봐야 해요.',
    criteria: [
      '원료 형태가 산화, 구연산, 글리시네이트 중 무엇인지 확인해요.',
      '마그네슘 원소량 기준으로 1일 섭취량을 계산해요.',
      '칼슘, 비타민D, 아연 등 다른 미네랄과 중복 섭취되는지 봐요.'
    ],
    caution: '**마그네슘 보충제는 설사나 복부 불편감을 줄 수 있어요.** 신장 질환이 있거나 약을 복용 중인 분은 반드시 전문가와 상담하세요.',
    close: '마그네슘 영양제 추천을 찾는 건 내 몸의 긴장을 조금 덜어주고 싶은 마음일 거예요. 무리한 기대보다 편안한 밤을 위한 작은 루틴으로 접근해보세요.',
    sources: [
      ['NIH ODS Magnesium', 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/'],
      ...commonSources
    ],
    tags: ['#마그네슘영양제추천', '#눈떨림영양제', '#수면루틴']
  }
];

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readProducts(file) {
  const fullPath = path.join(root, 'data', file);
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return (data.items || []).slice(0, 3);
}

function priceLabel(value) {
  const price = Number(value || 0);
  if (!price) return '가격 확인';
  return `${price.toLocaleString('ko-KR')}원대`;
}

function productName(page, index) {
  const products = readProducts(page.data);
  if (products[index]?.productName && products[index].keyword !== 'Gold box') {
    return products[index].productName;
  }
  const labels = ['첫 번째', '두 번째', '세 번째'];
  return `${page.shortTitle} ${labels[index] || `${index + 1}번째`} 비교 상품`;
}

function imageOf(product) {
  return product.localImage || product.productImage || '/images/shopping-thumbnail.png';
}

function productUrl(product, page) {
  return product.productUrl || `https://www.coupang.com/np/search?q=${encodeURIComponent(page.shortTitle)}`;
}

function productsForPage(page) {
  const products = readProducts(page.data);
  const filtered = products.filter((product) => product.keyword !== 'Gold box');
  if (filtered.length) {
    return filtered;
  }
  return page.fallbackProducts || [];
}

function sourceList(page) {
  return page.sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join('\n              ');
}

function productCards(page, products) {
  if (!products.length) {
    return '';
  }
  return products.map((product, index) => {
    const name = product.productName || productName(page, index);
    const url = productUrl(product, page);
    return `              <section class="product-detail-card">
                <div class="product-detail-media">
                  <a href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">
                    <img src="${escapeHtml(imageOf(product))}" alt="${escapeHtml(name)}" loading="lazy" width="420" height="420">
                  </a>
                </div>
                <div class="product-detail-info">
                  <span class="product-detail-badge">${index + 1}번 대체 상품</span>
                  <h3>${escapeHtml(name)}</h3>
                  <div class="product-detail-price">현재가 기준 <strong>${escapeHtml(priceLabel(product.productPrice))}</strong></div>
                  <div class="product-detail-specs"><strong>체크 포인트</strong>: 방송 상품과 가격, 구성, 섭취일수를 비교해볼 만한 ${escapeHtml(page.shortTitle)} 카테고리 상품이에요.</div>
                  <p class="product-detail-desc">특정 제품을 무조건 권하기보다, 본문 기준표를 보면서 내 상황에 맞는지 확인하는 용도로 보세요.</p>
                  <div class="product-detail-target"><strong>이럴 때 비교</strong>: 방송 상품이 품절이거나 가격이 부담될 때 같은 성분군의 대체 상품을 빠르게 보고 싶을 때</div>
                  <a class="product-detail-btn" href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="product_card" data-coupang-product-type="${page.productType}">쿠팡에서 비교하기</a>
                  <p class="blog-ad-disclosure">${disclosure}</p>
                </div>
              </section>`;
  }).join('\n');
}

function article(page) {
  const products = productsForPage(page);
  const first = products[0] || {};
  const heroImage = page.heroImage || imageOf(first);
  const absoluteImage = heroImage.startsWith('/') ? `${site}${heroImage}` : heroImage;
  const canonical = `${site}/blog/${page.slug}.html`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.titles[0],
    description: page.description,
    image: { '@type': 'ImageObject', url: absoluteImage, width: 657, height: 657 },
    thumbnailUrl: absoluteImage,
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
  const mobileName = productName(page, 0);

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
  <title>${escapeHtml(page.titles[0])} | 골드픽 노트</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.titles[0])}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(absoluteImage)}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="골드픽">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.titles[0])}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteImage)}">
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
          <button type="button" class="blog-mobile-icon" data-share-page aria-label="페이지 공유">↗</button>
          <button type="button" class="blog-mobile-icon" data-toggle-mobile-nav aria-expanded="false" aria-controls="drawer-${page.slug}" aria-label="메뉴 열기">☰</button>
        </div>
      </div>
      <div class="blog-mobile-drawer" id="drawer-${page.slug}" hidden>
        <nav class="blog-mobile-drawer-links" aria-label="모바일 블로그 메뉴">
          <a href="/" data-blog-path="/">홈</a>
          <a href="/blog/bnr17-diet-probiotics-home-shopping-guide.html" data-blog-path="/blog/bnr17-diet-probiotics-home-shopping-guide.html">다이어트 유산균</a>
          <a href="/blog/glutathione-film-home-shopping-guide.html" data-blog-path="/blog/glutathione-film-home-shopping-guide.html">글루타치온</a>
          <a href="/blog/black-goat-extract-home-shopping-guide.html" data-blog-path="/blog/black-goat-extract-home-shopping-guide.html">흑염소 진액</a>
          <a href="/blog/collagen-retinol-home-shopping-guide.html" data-blog-path="/blog/collagen-retinol-home-shopping-guide.html">저분자 콜라겐</a>
        </nav>
      </div>
      <div class="blog-brand">
        <p class="blog-kicker">Home Shopping Health Note</p>
        <div class="blog-title">${escapeHtml(page.shortTitle)} 성분 체크</div>
        <p class="blog-intro">${escapeHtml(page.description)}</p>
      </div>
      <nav class="blog-top-nav" aria-label="블로그 바로가기">
        <a href="/" data-blog-path="/">홈</a>
        <a href="/blog/bnr17-diet-probiotics-home-shopping-guide.html" data-blog-path="/blog/bnr17-diet-probiotics-home-shopping-guide.html">다이어트 유산균</a>
        <a href="/blog/glutathione-film-home-shopping-guide.html" data-blog-path="/blog/glutathione-film-home-shopping-guide.html">글루타치온</a>
        <a href="/blog/red-ginseng-stick-home-shopping-guide.html" data-blog-path="/blog/red-ginseng-stick-home-shopping-guide.html">홍삼</a>
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
              <span>홈쇼핑에서 본 건강식품을 성분표 중심으로 다시 읽어드립니다.</span>
            </div>
          </section>
          <section class="blog-panel">
            <h2>글 순서</h2>
            <div class="blog-link-list blog-toc-list">
              <a href="#title-options">제목 후보 <span>3개</span></a>
              <a href="#why">성분 이유 <span>근거</span></a>
              <a href="#criteria">선택 기준 <span>3가지</span></a>
              <a href="#products">대체 상품 <span>비교</span></a>
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
            방송에서 본 제품이 마음에 걸린다면, 오늘은 제품명보다 성분표와 섭취 기준부터 차분히 확인해보세요.<br>
            <span class="memo-note memo-note--summary memo-note--blue">${escapeHtml(page.subKeywords[0])}</span>
          </div>

          <section class="mobile-conversion-card" aria-label="${escapeHtml(page.shortTitle)} 대체 상품">
            <a class="mobile-conversion-card__image" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">
              <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(mobileName)}" width="220" height="220">
            </a>
            <div class="mobile-conversion-card__body">
              <span class="mobile-conversion-card__eyebrow">방송 상품 대체 비교</span>
              <strong>${escapeHtml(mobileName)}</strong>
              <p>방송 상품이 품절이거나 가격이 애매할 때 같은 카테고리에서 비교해볼 수 있는 상품이에요.</p>
              <a class="mobile-conversion-card__button" href="${escapeHtml(mobileUrl)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="mobile_summary_card" data-coupang-product-type="${page.productType}">쿠팡에서 비교하기</a>
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>
          </section>

          <figure class="article-hero">
            <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.shortTitle)} 대표 상품 이미지" width="657" height="657">
            <figcaption>${escapeHtml(page.shortTitle)}는 방송 문구보다 성분표, 섭취일수, 주의사항을 함께 보는 게 중요해요.</figcaption>
          </figure>

          <div class="article-body">
            <section id="title-options">
              <h2>제목 후보 3개</h2>
              <ul>
                ${page.titles.map((title) => `<li>${escapeHtml(title)}</li>`).join('\n                ')}
              </ul>
            </section>

            <p class="article-lead">${escapeHtml(page.opener)}</p>

            <h2 id="why">${escapeHtml(page.shortTitle)}이 왜 필요하다고 느껴질까요?</h2>
            <p>${escapeHtml(page.why)}</p>

            <h2 id="criteria">속지 않고 고르는 팁 3가지</h2>
            <ul>
              ${page.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ul>
            <p>${page.caution}</p>

            <div class="article-ad article-ad-frame-block" aria-label="쿠팡 제휴 광고">
              <p class="article-ad-label">광고</p>
              ${articleAdIframe}
              <p class="blog-ad-disclosure">${disclosure}</p>
            </div>

            <h2>방송 상품이 맞는 사람, 대체 상품이 나은 사람</h2>
            <div class="article-choice-grid">
              <section class="article-choice-card">
                <h3>방송 상품이 맞을 수 있어요</h3>
                <p>구성, 가격, 섭취일수가 마음에 들고 방송 혜택까지 확인한 분이라면 바로 비교해볼 만해요.</p>
              </section>
              <section class="article-choice-card">
                <h3>대체 상품이 나을 수 있어요</h3>
                <p>특정 브랜드보다 성분, 함량, 가격을 먼저 보고 싶거나 품절 이후에도 비슷한 기준으로 고르고 싶은 분께 맞아요.</p>
              </section>
            </div>

            <h2>참고한 근거</h2>
            <p>건강식품은 치료나 예방을 약속하는 제품이 아니므로, 아래 공식 자료를 기준으로 표현을 보수적으로 정리했어요.</p>
            <ul class="article-source-list">
              ${sourceList(page)}
            </ul>

            <h2 id="products">${escapeHtml(page.keyword)} 대체 상품 보기</h2>
            <p>${escapeHtml(page.keyword)}을 찾는 분이라면 방송 상품 하나만 보지 말고, 같은 기준으로 가격과 구성을 비교해보세요. 아래 상품은 구매 강요가 아니라 비교 출발점으로 정리한 목록이에요.</p>
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
  const first = productsForPage(page)[0] || {};
  const image = page.heroImage || imageOf(first);
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
  const healthCardAnchor = '          <article class="blog-card" data-blog-category="life">\n            <a href="/blog/lutein-omega3-home-shopping-guide.html"';
  if (html.includes(healthCardAnchor)) {
    html = html.replace(healthCardAnchor, `${cards}\n${healthCardAnchor}`);
  } else {
    html = html.replace('        <div class="blog-card-list">\n', `        <div class="blog-card-list">\n${cards}\n`);
  }

  const navLinks = pages.slice(0, 8).map((page) => `          <a href="/blog/${page.slug}.html" data-blog-path="/blog/${page.slug}.html">${page.shortTitle}</a>`).join('\n');
  html = html.replace('          <a href="/blog/lutein-omega3-home-shopping-guide.html"', `${navLinks}\n          <a href="/blog/lutein-omega3-home-shopping-guide.html"`);

  const blogPostItems = pages.map((page) => {
    const first = productsForPage(page)[0] || {};
    const image = page.heroImage || imageOf(first);
    const absoluteImage = image.startsWith('/') ? `${site}${image}` : image;
    return `        {
          "@type": "BlogPosting",
          "headline": ${JSON.stringify(page.titles[0])},
          "url": "${site}/blog/${page.slug}.html",
          "image": ${JSON.stringify(absoluteImage)},
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

function patchTest() {
  const testPath = path.join(root, 'tests', 'home-shopping-blog-pages.test.js');
  let js = fs.readFileSync(testPath, 'utf8');
  for (const page of pages) {
    const entry = `  'blog/${page.slug}.html',`;
    if (!js.includes(entry)) {
      js = js.replace('const pages = [\n', `const pages = [\n${entry}\n`);
    }
  }
  fs.writeFileSync(testPath, js, 'utf8');
}

for (const page of pages) {
  fs.writeFileSync(path.join(root, 'blog', `${page.slug}.html`), article(page), 'utf8');
}
patchIndex();
patchSitemap();
patchTest();

console.log(pages.map((page) => `/blog/${page.slug}.html`).join('\n'));
