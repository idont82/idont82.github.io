const assert = require('node:assert/strict');
const test = require('node:test');

const { validateQueue } = require('../scripts/facebook-post-queue');

function shoppingCard(index) {
  return {
    hook: `${100 + index}만원대`,
    productName: `테스트 노트북 ${index}`,
    imageUrls: [`https://example.com/laptop-${index}.jpg`],
    specs: ['메모리 16GB', '저장공간 512GB'],
    uses: ['문서 작업', '화상 회의'],
    disclaimer: '작성일 기준 · 가격 변동 가능',
  };
}

function shoppingItem() {
  return {
    id: '20260821-laptop-shopping-test',
    category: 'laptop',
    article: '/blog/best-value-laptop-top3-guide.html',
    linkMode: 'blog',
    scheduledAt: '2026-08-21T15:00:00+09:00',
    shortLinkId: 18,
    cardCopy: ['100만원대 노트북', '가격의 함정 확인', '내 용도에 맞는 선택'],
    cardTemplate: 'shopping-grid',
    shoppingCards: [shoppingCard(1), shoppingCard(2), shoppingCard(3)],
    replacesFacebookPostId: '1243431898854300_122110686801428837',
    status: 'queued',
    attempts: 0,
  };
}

test('shopping-grid 큐는 제품별 쇼핑 카드 세 장을 요구한다', () => {
  assert.doesNotThrow(() => validateQueue([shoppingItem()]));
  assert.throws(
    () => validateQueue([{ ...shoppingItem(), shoppingCards: [] }]),
    /shoppingCards must contain exactly three cards/
  );
});

test('쇼핑 카드 필드와 목록 길이를 엄격히 검증한다', () => {
  const missingHook = shoppingItem();
  delete missingHook.shoppingCards[0].hook;
  assert.throws(() => validateQueue([missingHook]), /shopping card missing hook/);

  const tooManySpecs = shoppingItem();
  tooManySpecs.shoppingCards[0].specs = ['1', '2', '3', '4'];
  assert.throws(() => validateQueue([tooManySpecs]), /shopping card specs must contain 1 to 3 items/);

  const tooManyUses = shoppingItem();
  tooManyUses.shoppingCards[0].uses = ['1', '2', '3', '4', '5'];
  assert.throws(() => validateQueue([tooManyUses]), /shopping card uses must contain 1 to 4 items/);
});

module.exports = { shoppingCard, shoppingItem };
