const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPost,
  markerFor,
  textLength,
  validateCampaign,
} = require('../scripts/build-blogger-health-post');

const campaign = require('./fixtures/blogger-health-campaign.json');

test('builds a truthful long-form post with three images and bottom disclosure', () => {
  const post = buildPost(campaign, 'https://idont82.github.io/images/blogger/sample');

  assert.ok(textLength(post.content) >= 1500 && textLength(post.content) <= 2000);
  assert.equal((post.content.match(/<img\b/g) || []).length, 3);
  assert.equal((post.content.match(/rel="nofollow sponsored"/g) || []).length, 1);
  assert.match(post.content, /가격은 판매 시점에 따라 달라질 수 있습니다/);
  assert.match(post.content, /<!-- goldpick-product:sample-omega3-001 -->/);
  assert.ok(post.content.trim().endsWith('이에 따른 일정액의 수수료를 제공받습니다.</p>'));
  assert.doesNotMatch(post.content, /먹어봤|복용해봤|치료|완치|효과를 보장/);
});

test('escapes untrusted campaign text and URL values', () => {
  const unsafe = structuredClone(campaign);
  unsafe.title = '<script>alert(1)</script>';
  unsafe.product.affiliateUrl = 'javascript:alert(1)';

  assert.throws(() => buildPost(unsafe, 'https://example.test/images'), /HTTPS URL/);
  unsafe.product.affiliateUrl = 'https://example.test/?q=<tag>';
  const post = buildPost(unsafe, 'https://example.test/images');
  assert.doesNotMatch(post.title, /<script>/);
  assert.match(post.content, /q=&lt;tag&gt;/);
});

test('rejects duplicate images and prohibited experience claims', () => {
  const duplicate = structuredClone(campaign);
  duplicate.imageFiles[2] = duplicate.imageFiles[1];
  assert.throws(() => validateCampaign(duplicate), /distinct images/);

  const deceptive = structuredClone(campaign);
  deceptive.editorialParagraphs[0] = '제가 직접 먹어봤는데 정말 좋았습니다.';
  assert.throws(() => validateCampaign(deceptive), /prohibited claim/);
});

test('uses a stable, comment-safe product marker', () => {
  assert.equal(markerFor('ABC 12/가'), '<!-- goldpick-product:abc-12 -->');
});
