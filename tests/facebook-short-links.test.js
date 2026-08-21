const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const queue = require('../data/facebook-post-queue.json');
const laptopQueue = require('../data/facebook-laptop-post-queue.json');
const { buildMappings, renderRedirectScript } = require('../scripts/build-facebook-short-links');
const { SHORT_LINKS, resolveShortLink } = require('../g/redirect');
const combinedQueue = [...queue, ...laptopQueue];

test('generated short-link allowlist covers every immutable queue number', () => {
  assert.deepEqual(Object.keys(SHORT_LINKS).map(Number), combinedQueue.map((item) => item.shortLinkId));
  assert.deepEqual(buildMappings(combinedQueue), SHORT_LINKS);
});

test('blog and direct short links resolve only to their prebuilt tracked destinations', () => {
  assert.match(resolveShortLink('1'), /^https:\/\/idont82\.github\.io\/blog\//);
  assert.equal(new URL(resolveShortLink('1')).searchParams.get('utm_source'), 'facebook');
  assert.match(resolveShortLink('4'), /^https:\/\/link\.coupang\.com\//);
  assert.equal(new URL(resolveShortLink('4')).searchParams.get('subid'), 'fb-20260813-problem-water-size');
  assert.match(resolveShortLink('15'), /best-value-laptop-top3-guide\.html/);
  assert.match(resolveShortLink('16'), /highest-performance-laptop-top3-guide\.html/);
  assert.match(resolveShortLink('17'), /document-work-laptop-top3-guide\.html/);
  for (const id of ['15', '16', '17']) {
    assert.equal(new URL(resolveShortLink(id)).searchParams.get('utm_source'), 'facebook');
  }
});

test('resolver rejects missing, malformed, unknown, and noncanonical values', () => {
  for (const value of [undefined, '', '0', '-1', '01', '1.0', '1x', '999', ' 1']) {
    assert.equal(resolveShortLink(value), '/');
  }
});

test('generated browser files are deterministic and index uses location.replace', () => {
  const generated = renderRedirectScript(buildMappings(combinedQueue)).replace(/\r\n/g, '\n');
  assert.equal(fs.readFileSync('g/redirect.js', 'utf8').replace(/\r\n/g, '\n'), generated);
  const index = fs.readFileSync('g/index.html', 'utf8');
  assert.match(index, /new URLSearchParams\(location\.search\)\.get\('n'\)/);
  assert.match(index, /location\.replace\(resolveShortLink\(number\)\)/);
  assert.doesNotMatch(index, /innerHTML|document\.write/);
});
