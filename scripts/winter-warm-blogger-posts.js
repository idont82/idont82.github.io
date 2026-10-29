// 겨울 보온 제품 3편의 Blogger 본문을 만든다.
// 이 글들은 Blogger에만 올라간다. idont82.github.io 에는 같은 글을 두지 않는다 (중복 색인 방지).
const DISCLOSURE_TEXT = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const MIN_PRODUCTS = 5;
const DEEPLINK_PREFIX = 'https://link.coupang.com/a/';

const WINTER_POSTS = [
  {
    slug: 'winter-lightweight-padding',
    subId: 'winter-padding',
    dataFile: 'coupang-winter-padding.json',
    keyword: '경량패딩',
    title: '경량패딩 고르는 법, 꺼짐·사이즈·세탁 후기 불만을 기준으로 바꾸기',
    labels: ['겨울', '패딩', '의류', '구매 가이드'],
    lead: '경량패딩은 가격대가 넓고 제품 수가 많아서 비교가 어려운 품목입니다. 판매 페이지만 보면 다 비슷해 보이지만, 공개된 후기에서 반복되는 불만은 대체로 세 가지로 모입니다. 그 불만을 뒤집으면 그대로 선택 기준이 됩니다.',
    complaints: [
      '처음엔 도톰했는데 몇 번 입으니 납작해지고 보온이 떨어진다',
      '같은 사이즈인데 어깨나 팔 길이가 맞지 않는다',
      '세탁하고 나니 충전재가 한쪽으로 뭉쳤다',
    ],
    needs: [
      '충전재 종류와 양이 표시되어 있고 복원력을 기대할 수 있는 제품',
      '총장, 어깨, 가슴단면 같은 실측 치수가 공개된 제품',
      '세탁 방법이 명확하고 뭉침을 되돌릴 수 있는 구조',
    ],
    criteria: [
      '충전재 표기를 먼저 보세요. 덕다운과 구스다운은 솜털 비율이, 웰론이나 신슐레이트 같은 합성 충전재는 중량 표기가 보온감을 가늠하는 단서가 됩니다.',
      '사이즈는 라벨이 아니라 실측 치수로 고르세요. 평소 입는 옷의 어깨너비와 총장을 재서 상세 페이지 표와 맞춰보는 편이 반품을 줄입니다.',
      '세탁 안내를 구매 전에 확인하세요. 다운 제품은 전용 세제와 저온 건조가 권장되고, 건조기에 테니스공 같은 것을 함께 넣어 뭉친 충전재를 풀어주는 방법이 널리 쓰입니다.',
    ],
    caution: '패딩의 보온은 두께만으로 정해지지 않습니다. 바람이 강한 날에는 겉감의 방풍성과 목, 손목, 밑단의 마감이 체감 온도를 더 크게 바꿉니다. 한파 경보가 있는 날에는 얇은 경량패딩 한 장보다 겹쳐 입는 쪽이 안전합니다.',
    faq: [
      ['경량패딩은 몇 도까지 입을 수 있나요?', '제품마다 충전재와 겉감이 달라 일률적으로 말하기 어렵습니다. 일반적으로 경량패딩은 단독 착용보다 코트나 외피 안에 겹쳐 입는 용도로 설계된 경우가 많아, 영하권에서는 겹쳐 입는 구성을 생각하는 편이 좋습니다.'],
      ['다운과 합성 충전재 중 뭐가 낫나요?', '같은 보온감이면 다운이 가볍고 압축이 잘 되는 편이고, 합성 충전재는 가격과 세탁 관리가 상대적으로 수월한 편입니다. 비나 눈을 자주 맞는 상황이면 합성 충전재 쪽을 먼저 보는 경우가 많습니다.'],
      ['세탁은 얼마나 자주 해야 하나요?', '해외 아웃도어 브랜드들의 관리 안내에서는 시즌당 한두 번 정도면 충분하다고 설명하는 경우가 많습니다. 자주 빨수록 좋아지는 품목은 아닙니다.'],
      ['충전재가 뭉쳤는데 되돌릴 수 있나요?', '건조 단계에서 갈라지는 경우가 많습니다. 저온 건조로 다시 돌리면서 중간에 손으로 뭉친 부분을 풀어주는 방법이 관리 안내에 공통으로 나옵니다. 그래도 복원되지 않으면 제품 수명을 의심해볼 시점입니다.'],
    ],
    sources: [
      ['REI 다운 재킷 세탁 안내: 전용 세제와 저온 건조', 'https://www.rei.com/learn/expert-advice/how-to-wash-down-jacket.html'],
      ['MEC 다운 재킷 관리 안내: 세탁 빈도와 건조 방법', 'https://www.mec.ca/en/explore/how-to-wash-a-down-jacket'],
      ['Rab 다운 재킷 세탁 가이드: 뭉친 충전재 풀기', 'https://rab.equipment/ca/rab-lab/how-to/how-to-wash-a-down-jacket'],
    ],
    cardLead: '아래는 쿠팡 검색 결과에서 모은 경량패딩 후보입니다. 상품명에 표시된 정보를 기준으로 정리했고, 실제 보온감이나 내구성을 측정한 결과가 아닙니다.',
  },
  {
    slug: 'winter-electric-blanket',
    subId: 'winter-blanket',
    dataFile: 'coupang-winter-blanket.json',
    keyword: '전기요',
    title: '전기요 고르는 법, 온도 편차·과열 걱정·세탁 문제를 먼저 정리하기',
    labels: ['겨울', '난방', '생활가전', '구매 가이드'],
    lead: '전기요는 난방비를 줄이려고 찾는 경우가 많지만, 후기에서 반복되는 불만은 보온력보다 사용 중의 불편에 몰려 있습니다. 사기 전에 그 불편을 먼저 확인하면 고르는 기준이 단순해집니다.',
    complaints: [
      '어떤 부분만 뜨겁고 어떤 부분은 미지근해서 온도가 고르지 않다',
      '밤새 켜 두어도 되는지, 과열되지는 않는지 불안하다',
      '물이나 음료를 쏟았는데 세탁이 되는지 모르겠다',
    ],
    needs: [
      '열선이 고르게 배치되어 있고 온도 단계가 세분화된 제품',
      '과열 차단과 자동 꺼짐 타이머가 들어간 제품',
      '본체에서 전원부를 분리해 세탁할 수 있는 구조',
    ],
    criteria: [
      '안전 기능 표기를 가장 먼저 보세요. KC 안전인증, 과열 차단, 자동 꺼짐 타이머가 상세 페이지에 명시되어 있는지 확인하는 편이 좋습니다.',
      '사이즈를 매트리스 기준으로 고르세요. 싱글, 슈퍼싱글, 더블 표기가 제품마다 조금씩 달라서 가로세로 cm 표기를 매트리스 치수와 직접 비교해야 어긋나지 않습니다.',
      '세탁 가능 여부와 방식을 확인하세요. 전원부 분리 후 물세탁이 되는 제품과, 커버만 분리되는 제품은 관리 난이도가 꽤 다릅니다.',
    ],
    caution: '해외 소방 기관들의 안내를 보면 전기요는 접거나 구긴 상태로 켜 두지 말고, 위에 이불이나 물건을 쌓아 열이 갇히지 않게 하라고 공통으로 설명합니다. 눌어붙은 자국이나 갈변, 피복이 벗겨진 전선이 보이면 사용을 멈추는 편이 안전합니다. 젖은 상태로는 켜지 마세요. 또한 상품명에 자주 보이는 전자파 차단 표기는 제품의 측정 기준에 따른 표시로, 건강 효과를 뜻하는 표현이 아닙니다.',
    faq: [
      ['밤새 켜 두어도 되나요?', '해외 소방 기관 안내에서는 잠들기 전 15~30분 정도 이불을 데운 뒤 끄는 사용법을 권하는 경우가 많습니다. 밤새 켜 두는 사용을 전제로 한다면 자동 꺼짐 타이머와 과열 차단이 있는 제품인지 먼저 확인하세요.'],
      ['탄소매트와 일반 열선 제품은 뭐가 다른가요?', '발열체 방식이 달라 예열 속도와 온도 분포에 차이가 있다고 설명되는 경우가 많습니다. 다만 제품별 편차가 커서 방식 이름보다 온도 단계 수, 안전 기능, 사이즈 표기를 함께 보는 편이 실용적입니다.'],
      ['전기요와 온수매트 중 뭘 사야 하나요?', '전기요는 설치가 간단하고 가격대가 낮은 편이며, 온수매트는 물을 데워 순환시키는 구조라 보일러 소음과 물 보충 관리가 따라붙습니다. 관리 부담을 줄이고 싶으면 전기요, 전기 열선이 신경 쓰이면 온수매트를 먼저 보는 식으로 나뉩니다.'],
      ['전기요는 몇 년마다 바꿔야 하나요?', '영국의 한 소방 기관은 10년 주기 교체를 권고합니다. 연수와 상관없이 전선 피복 손상이나 갈변이 보이면 그 시점이 교체 시기입니다.'],
    ],
    sources: [
      ['미국 메인주 소방국 전기요 안전 안내문', 'https://www.maine.gov/dps/fmo/sites/maine.gov.dps.fmo/files/inline-files/electric_blanket_safety.pdf'],
      ['호주 ACT 비상서비스청 전기요 안전 자료', 'https://www.esa.act.gov.au/sites/default/files/wp-content/uploads/Electric-blankets.pdf'],
      ['영국 체셔 소방구조대 전기요 안전 안내', 'https://www.cheshirefire.gov.uk/your-safety/home-safety/electrical-fire-safety/electric-blankets'],
    ],
    cardLead: '아래는 쿠팡 검색 결과에서 모은 전기요 후보입니다. 상품명에 표시된 정보를 기준으로 정리했고, 발열 성능이나 안전성을 따로 시험한 결과가 아닙니다.',
  },
  {
    slug: 'winter-thermal-underwear',
    subId: 'winter-thermal',
    dataFile: 'coupang-winter-thermal.json',
    keyword: '기모 내의',
    title: '기모 내의 고르는 법, 땀 차면 더 추운 문제와 수축·정전기 기준',
    labels: ['겨울', '내의', '의류', '구매 가이드'],
    lead: '기모 내의는 싸고 따뜻해 보여서 고민 없이 담기 쉬운 품목입니다. 그런데 후기에서 반복되는 불만은 보온이 부족하다는 쪽이 아니라, 입고 움직인 다음에 생기는 문제들입니다.',
    complaints: [
      '실내나 이동 중에 땀이 차면 오히려 더 춥게 느껴진다',
      '세탁하고 나니 줄어들어서 소매와 기장이 짧아졌다',
      '정전기가 심해서 옷이 달라붙고 따갑다',
    ],
    needs: [
      '땀을 머금고 있지 않고 빠르게 마르는 소재 구성',
      '수축을 줄일 수 있는 세탁 방법이 안내된 제품',
      '정전기를 덜 타는 혼방 구성과 마감',
    ],
    criteria: [
      '소재 혼용률을 먼저 보세요. 면 비율이 높을수록 땀을 머금고 잘 마르지 않아, 활동량이 있는 날에는 오히려 체온을 뺏길 수 있습니다. 폴리에스터나 레이온 혼방이 건조 속도에서 유리한 편입니다.',
      '세탁 안내를 확인하세요. 기모 제품은 고온 세탁과 건조기 사용에서 수축이 생기기 쉬워, 찬물 세탁과 자연 건조가 안내되는 제품인지 보는 편이 좋습니다.',
      '사용 상황을 먼저 정하세요. 실내 생활용이면 두께를, 출퇴근이나 야외 활동용이면 건조 속도와 활동성을 우선으로 두는 쪽이 실패가 적습니다.',
    ],
    caution: '내의는 두꺼울수록 따뜻한 것이 아니라, 땀이 식지 않게 관리되는 쪽이 따뜻합니다. 땀을 많이 흘리는 활동을 한다면 두꺼운 기모 한 겹보다 얇고 빨리 마르는 소재를 안쪽에 두고 겹쳐 입는 구성이 체감에 유리합니다. 피부가 예민하거나 가려움이 반복되면 기모 표면 소재와 세탁 세제도 함께 점검해 보세요.',
    faq: [
      ['기모와 발열 내의는 다른가요?', '기모는 원단 표면을 긁어 공기층을 만드는 가공 방식이고, 발열 내의는 수분이나 마찰을 이용한 발열을 내세우는 제품 표현에 가깝습니다. 상품명 표현보다 혼용률과 두께 표기를 보는 편이 비교에 낫습니다.'],
      ['면 100% 내복은 왜 추천이 덜 되나요?', '면은 수분을 머금고 잘 마르지 않아, 땀이 난 뒤 몸을 식히는 방향으로 작용합니다. 실내 위주로 가볍게 입는다면 문제가 적지만, 바깥 활동이 섞이면 불리해집니다.'],
      ['메리노 울 제품은 어떤가요?', '젖어도 보온이 비교적 덜 떨어지고 냄새가 덜 나는 편으로 설명됩니다. 대신 가격대가 높고 세탁에 주의가 필요해, 합성 소재와 장단점이 갈립니다.'],
      ['세탁 후 줄어드는 것을 막으려면?', '표시 라벨의 권장 온도를 지키고, 건조기 고온 건조를 피하는 편이 일반적인 안내입니다. 세탁망을 쓰면 마찰로 생기는 보풀도 줄일 수 있습니다.'],
    ],
    sources: [
      ['Polygiene 메리노 울과 합성 베이스레이어 비교 자료', 'https://polygiene.com/news/resources/merino-wool-vs-synthetic-base-layers/'],
      ['Outdoor Vitals 베이스레이어 소재 비교: 면이 불리한 이유', 'https://outdoorvitals.com/blogs/ovtribe/base-layers-sun-hoodies-synthetic-vs-wool'],
    ],
    cardLead: '아래는 쿠팡 검색 결과에서 모은 기모 내의 후보입니다. 상품명에 표시된 정보를 기준으로 정리했고, 보온력이나 수축률을 측정한 결과가 아닙니다.',
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function markerFor(slug) {
  if (!/^[a-z0-9-]+$/.test(String(slug))) {
    throw new Error(`슬러그 형식이 올바르지 않습니다: ${slug}`);
  }
  return `<!-- goldpick-${slug} -->`;
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`가격이 올바르지 않습니다: ${value}`);
  }
  return `${Math.round(price).toLocaleString('ko-KR')}원`;
}

const heading = (text) => `<h2 style="font-size:23px;line-height:1.45;margin:38px 0 14px;color:#10243f">${escapeHtml(text)}</h2>`;
const para = (text) => `<p style="margin:16px 0">${escapeHtml(text)}</p>`;
const bullets = (items) => `<ul style="padding-left:22px;margin:16px 0">${items.map((item) => `<li style="margin:10px 0">${escapeHtml(item)}</li>`).join('')}</ul>`;
const numbered = (items) => `<ol style="padding-left:22px;margin:16px 0">${items.map((item) => `<li style="margin:14px 0">${escapeHtml(item)}</li>`).join('')}</ol>`;

function tableOfContents(post) {
  const entries = [
    '후기에서 반복되는 불만',
    '불만을 고르는 기준으로 바꾸면',
    '살 때 확인할 세 가지',
    `${post.keyword} 후보 상품`,
    '주의할 점',
    '자주 묻는 질문',
  ];
  return `<div style="margin:24px 0;padding:18px 20px;border:1px solid #d7e2f0;border-radius:16px;background:#f6f9fd">
<p style="margin:0 0 10px;font-weight:bold;color:#10243f">글 순서</p>
<ol style="margin:0;padding-left:20px">${entries.map((entry) => `<li style="margin:6px 0">${escapeHtml(entry)}</li>`).join('')}</ol>
</div>`;
}

function productCard(item, index, asOfDate) {
  const deeplink = String(item.deeplink || '');
  if (!deeplink.startsWith(DEEPLINK_PREFIX)) {
    throw new Error(`딥링크가 아닌 링크는 쓸 수 없습니다: ${item.productId} -> ${deeplink}`);
  }
  const name = String(item.productName || '').trim();
  if (!name) {
    throw new Error(`상품명이 비어 있습니다: ${item.productId}`);
  }
  const rocket = item.isRocket ? ' · 로켓배송 표시' : '';
  return `<section style="margin:22px 0;padding:20px;border:1px solid #dce3ee;border-radius:18px;background:#fff;overflow-wrap:anywhere">
<p style="font-size:13px;color:#38557b;font-weight:bold;margin:0">후보 ${index + 1}</p>
<img src="${escapeHtml(item.productImage)}" alt="${escapeHtml(name.slice(0, 60))} 판매 제품 이미지" width="360" height="360" style="display:block;width:100%;max-width:360px;height:auto;aspect-ratio:1;object-fit:contain;margin:12px auto" loading="lazy">
<h3 style="font-size:19px;line-height:1.5;margin:10px 0">${escapeHtml(name)}</h3>
<p style="font-size:27px;font-weight:bold;color:#174bb8;margin:10px 0">${formatPrice(item.productPrice)}</p>
<p style="font-size:13px;color:#64748b;margin:8px 0">${escapeHtml(asOfDate)} 조회 가격${rocket} · 옵션과 배송비는 판매 페이지에서 확인하세요</p>
<a href="${escapeHtml(deeplink)}" target="_blank" rel="sponsored nofollow noopener" style="display:block;background:#174bb8;color:#fff;text-align:center;text-decoration:none;padding:15px 12px;border-radius:10px;font-weight:bold;white-space:normal">쿠팡에서 가격과 상세 정보 확인 →</a>
</section>`;
}

function faqBlock(faq) {
  return faq.map(([question, answer]) => `<div style="margin:18px 0;padding-bottom:16px;border-bottom:1px solid #e3e9f2">
<p style="margin:0 0 8px;font-weight:bold;color:#10243f">${escapeHtml(question)}</p>
<p style="margin:0">${escapeHtml(answer)}</p>
</div>`).join('');
}

function sourceBlock(sources) {
  return `<ul style="padding-left:22px;margin:16px 0;font-size:14px;color:#44566d">${sources.map(([label, url]) => `<li style="margin:8px 0"><a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener" style="color:#174bb8">${escapeHtml(label)}</a></li>`).join('')}</ul>`;
}

function relatedBlock(related) {
  if (!Array.isArray(related) || related.length === 0) {
    return '';
  }
  return `<div style="margin:36px 0;padding:18px 20px;border:1px solid #d7e2f0;border-radius:16px;background:#f6f9fd">
<p style="margin:0 0 10px;font-weight:bold;color:#10243f">함께 보면 좋은 글</p>
<ul style="margin:0;padding-left:20px">${related.map((item) => `<li style="margin:8px 0"><a href="${escapeHtml(item.url)}" style="color:#174bb8">${escapeHtml(item.title)}</a></li>`).join('')}</ul>
</div>`;
}

function buildPost(post, items, options = {}) {
  const asOfDate = options.asOfDate || new Date().toISOString().slice(0, 10);
  const products = Array.isArray(items) ? items : [];
  if (products.length < MIN_PRODUCTS) {
    throw new Error(`상품이 5개 이상이어야 합니다. 현재 ${products.length}개 (${post.slug})`);
  }

  const body = [
    para(post.lead),
    tableOfContents(post),

    heading('후기에서 반복되는 불만'),
    para('공개된 상품 후기와 커뮤니티 글에서 같은 이야기가 되풀이되는 지점은 대체로 아래 세 가지입니다.'),
    bullets(post.complaints),

    heading('불만을 고르는 기준으로 바꾸면'),
    para('불만은 그 자체로는 쓸모가 적지만, 뒤집으면 상세 페이지에서 확인할 항목이 됩니다.'),
    bullets(post.needs),

    heading('살 때 확인할 세 가지'),
    numbered(post.criteria),

    heading(`${post.keyword} 후보 상품`),
    para(post.cardLead),
    products.map((item, index) => productCard(item, index, asOfDate)).join(''),

    heading('주의할 점'),
    `<div style="margin:18px 0;padding:18px 20px;border-left:5px solid #b84c2a;background:#fff4ef">${para(post.caution)}</div>`,

    heading('자주 묻는 질문'),
    faqBlock(post.faq),

    heading('참고한 자료'),
    sourceBlock(post.sources),

    relatedBlock(options.related),

    `<p style="margin-top:40px;padding:16px;border-radius:12px;background:#f1f4f8;font-size:14px;color:#44566d">${escapeHtml(DISCLOSURE_TEXT)}</p>`,
    `<p style="font-size:13px;color:#8191a5">가격과 상품 정보는 쿠팡 파트너스 상품 검색 API로 ${escapeHtml(asOfDate)}에 조회한 값입니다. 상품 설명은 판매명에 표시된 정보를 정리한 것이며 성능을 따로 시험하지 않았습니다. 가격과 재고는 바뀔 수 있습니다.</p>`,
  ].filter(Boolean).join('\n');

  const content = `${markerFor(post.slug)}<div style="max-width:760px;margin:0 auto;font-family:Arial,'Malgun Gothic',sans-serif;color:#182538;font-size:16px;line-height:1.85;overflow-wrap:anywhere">${body}</div>`;

  return { title: post.title, content, labels: [...post.labels] };
}

module.exports = {
  WINTER_POSTS,
  DISCLOSURE_TEXT,
  MIN_PRODUCTS,
  buildPost,
  markerFor,
  formatPrice,
  escapeHtml,
};
