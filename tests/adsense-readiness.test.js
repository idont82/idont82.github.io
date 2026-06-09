const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const requiredPages = [
  {
    file: 'privacy-policy.html',
    url: 'https://idont82.github.io/privacy-policy.html',
    marker: '개인정보처리방침'
  },
  {
    file: 'terms.html',
    url: 'https://idont82.github.io/terms.html',
    marker: '이용약관'
  },
  {
    file: 'contact.html',
    url: 'https://idont82.github.io/contact.html',
    marker: '문의하기'
  }
];

test('required trust pages exist for AdSense review', () => {
  for (const page of requiredPages) {
    const html = fs.readFileSync(page.file, 'utf8');

    assert.match(html, new RegExp(`<link rel="canonical" href="${page.url.replaceAll('.', '\\.')}">`));
    assert.match(html, new RegExp(page.marker));
    assert.match(html, /골드픽/);
  }
});

test('privacy policy discloses Google advertising cookies and opt-out path', () => {
  const html = fs.readFileSync('privacy-policy.html', 'utf8');

  assert.match(html, /Google/);
  assert.match(html, /쿠키/);
  assert.match(html, /개인 맞춤 광고/);
  assert.match(html, /adssettings\.google\.com/);
});

test('root blog home links to required trust pages without exposing the AdSense checklist card', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  assert.match(html, /href="\/privacy-policy\.html"/);
  assert.match(html, /href="\/terms\.html"/);
  assert.match(html, /href="\/contact\.html"/);
  assert.doesNotMatch(html, /href="\/blog\/adsense-approval-checklist-2026\.html"/);
});

test('AdSense preparation article is discoverable and uses official references', () => {
  const html = fs.readFileSync('blog/adsense-approval-checklist-2026.html', 'utf8');

  assert.match(html, /애드센스 승인/);
  assert.match(html, /가치가 별로 없는 콘텐츠/);
  assert.match(html, /개인정보처리방침/);
  assert.match(html, /support\.google\.com\/adsense\/answer\/1348695/);
  assert.match(html, /support\.google\.com\/adsense\/answer\/10502938/);
});

test('sitemap exposes AdSense readiness pages', () => {
  const xml = fs.readFileSync('sitemap.xml', 'utf8');

  assert.match(xml, /https:\/\/idont82\.github\.io\/privacy-policy\.html/);
  assert.match(xml, /https:\/\/idont82\.github\.io\/terms\.html/);
  assert.match(xml, /https:\/\/idont82\.github\.io\/contact\.html/);
  assert.match(xml, /https:\/\/idont82\.github\.io\/blog\/adsense-approval-checklist-2026\.html/);
});
