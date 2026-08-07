const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('Facebook workflow is locked, secret-backed, scheduled at 20:30 KST and supports dry-run', () => {
  const yaml = fs.readFileSync('.github/workflows/facebook-card-news.yml', 'utf8');
  assert.match(yaml, /cron:\s*['"]30 11 \* \* \*['"]/);
  assert.match(yaml, /workflow_dispatch:/);
  assert.match(yaml, /dry_run:/);
  assert.match(yaml, /concurrency:/);
  assert.match(yaml, /contents:\s*write/);
  assert.match(yaml, /secrets\.META_PAGE_ID/);
  assert.match(yaml, /secrets\.META_PAGE_ACCESS_TOKEN/);
  assert.match(yaml, /node --test tests\/facebook-/);
  assert.match(yaml, /publish-facebook-posts\.js/);
  assert.match(yaml, /collect-facebook-insights\.js/);
  assert.doesNotMatch(yaml, /coupang\/api\.txt/);
});
