const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildImportedPost,
  markerForSource,
  publishExistingPage,
} = require('../scripts/publish-existing-page-to-blogger');

const sourceUrl = 'https://idont82.github.io/blog/sample-guide.html';
const sampleHtml = `<!doctype html>
<html><head><title>샘플 가이드 | Gold Pick</title></head><body>
<header>메뉴</header>
<main class="wrap"><article class="blog-article">
  <h1>샘플 가이드</h1>
  <p>소개 문단</p>
  <img src="/images/hero.png" alt="대표 이미지">
  <section class="laptop-products">
    <article class="laptop-product-card"><img src="/images/one.png" alt="제품 1"><h2>제품 1</h2><p class="laptop-price"><strong>1,000원</strong></p><a class="laptop-buy-button" href="/product-one">보기</a></article>
    <article class="laptop-product-card"><img src="/images/two.png" alt="제품 2"><h2>제품 2</h2><p class="laptop-price"><strong>2,000원</strong></p><a class="laptop-buy-button" href="/product-two">보기</a></article>
    <article class="laptop-product-card"><img src="/images/three.png" alt="제품 3"><h2>제품 3</h2><p class="laptop-price"><strong>3,000원</strong></p><a class="laptop-buy-button" href="/product-three">보기</a></article>
  </section>
  <p class="laptop-disclosure">이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
  <footer>Gold Pick 안내</footer>
</article></main>
<script src="/app.js"></script>
</body></html>`;

test('imports the complete main article and preserves nested product articles', () => {
  const post = buildImportedPost(sampleHtml, sourceUrl);

  assert.equal(post.title, '샘플 가이드');
  assert.match(post.content, /<article class="laptop-product-card"/);
  assert.match(post.content, /https:\/\/idont82\.github\.io\/images\/hero\.png/);
  assert.match(post.content, /https:\/\/idont82\.github\.io\/product-one/);
  assert.doesNotMatch(post.content, /<h1\b|<script\b|<header>메뉴/);
});

test('adds scoped responsive styles and inline laptop fallbacks', () => {
  const post = buildImportedPost(sampleHtml, sourceUrl);

  assert.match(post.content, /\.goldpick-import \.laptop-product-card/);
  assert.match(post.content, /@media\s*\(max-width:680px\)/);
  assert.equal((post.content.match(/data-blogger-price="prominent"/g) || []).length, 3);
  assert.equal((post.content.match(/data-blogger-product-card="styled"/g) || []).length, 3);
  assert.equal((post.content.match(/data-blogger-buy-button="styled"/g) || []).length, 3);
  assert.ok(post.content.trim().endsWith('이에 따른 일정액의 수수료를 제공받습니다.</p>'));
});

test('fits the comparison table within a mobile viewport without horizontal scrolling', () => {
  const post = buildImportedPost(sampleHtml, sourceUrl);

  assert.match(post.content, /@media\s*\(max-width:680px\)[\s\S]*\.goldpick-import \.laptop-table-wrap\{overflow-x:visible!important\}/);
  assert.match(post.content, /@media\s*\(max-width:680px\)[\s\S]*\.goldpick-import \.laptop-table\{[^}]*min-width:0!important;[^}]*table-layout:fixed/);
  assert.match(post.content, /@media\s*\(max-width:680px\)[\s\S]*\.goldpick-import \.laptop-table th,.goldpick-import \.laptop-table td\{[^}]*overflow-wrap:anywhere/);
});

test('places a stable source marker and disclosure after the footer', () => {
  const post = buildImportedPost(sampleHtml, sourceUrl);
  const disclosureIndex = post.content.indexOf('이 게시물은 쿠팡 파트너스');
  const footerIndex = post.content.indexOf('Gold Pick 안내');

  assert.match(post.content, /<!-- goldpick-source:blog-sample-guide-html -->/);
  assert.ok(disclosureIndex > footerIndex);
  assert.ok(post.content.trim().endsWith('이에 따른 일정액의 수수료를 제공받습니다.</p>'));
  assert.equal(markerForSource(sourceUrl), '<!-- goldpick-source:blog-sample-guide-html -->');
});

test('rejects pages without a main article or disclosure', () => {
  assert.throws(() => buildImportedPost('<title>x</title>', sourceUrl), /main content/);
  assert.throws(
    () => buildImportedPost('<title>x</title><main><article><p>본문</p></article></main>', sourceUrl),
    /Coupang disclosure/,
  );
});

test('updates a marker-matched post instead of inserting another', async () => {
  const calls = { update: 0, insert: 0, write: 0 };
  const expected = buildImportedPost(sampleHtml, sourceUrl);
  const client = {
    getBlogByUrl: async () => ({ id: 'blog1' }),
    listPosts: async () => [{ id: 'post1', content: markerForSource(sourceUrl) }],
    updatePost: async (blogId, postId, post) => {
      calls.update += 1;
      assert.equal(blogId, 'blog1');
      assert.equal(postId, 'post1');
      assert.equal(post.content, expected.content);
      return { id: postId };
    },
    insertPost: async () => {
      calls.insert += 1;
      throw new Error('insert must not run');
    },
    getPost: async () => ({
      id: 'post1',
      url: 'https://example.test/post1',
      ...expected,
    }),
  };

  const result = await publishExistingPage({
    file: 'sample.html',
    sourceUrl,
    dependencies: {
      root: 'D:/site',
      readFile: async () => sampleHtml,
      getToken: async () => 'access',
      createClient: () => client,
      writePublication: async () => { calls.write += 1; },
    },
  });

  assert.equal(result.status, 'updated');
  assert.equal(calls.update, 1);
  assert.equal(calls.insert, 0);
  assert.equal(calls.write, 1);
});
