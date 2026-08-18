# Blackpink Facebook Single Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish only the queued Blackpink photocard storage card-news post to the Gold Pick Facebook Page and persist its verified publication state.

**Architecture:** Reuse the existing queue, renderer, short-link resolver, and Graph API publisher without changing production code. Load the Page token from the ignored local file, prove the three-card/blog-link payload in dry-run, publish once with duplicate detection, then verify the remote post and commit only the queue state.

**Tech Stack:** Node.js, PowerShell, Meta Graph API v26.0, vanilla JSON queue, Git

---

### Task 1: Validate the Blackpink payload

**Files:**
- Read: `.facebook-artifacts/meta.env`
- Read: `data/facebook-post-queue.json`
- Generated: `.facebook-artifacts/20260812-idol-blackpink-photocard/`

- [ ] **Step 1: Confirm the queue target and preserve the following direct-link item**

Run:

```powershell
node -e "const q=require('./data/facebook-post-queue.json'); const queued=q.filter(x=>x.status==='queued'); const first=queued[0]; const second=queued[1]; if(first?.id!=='20260812-idol-blackpink-photocard'||first.linkMode!=='blog'||first.shortLinkId!==3) throw new Error('Unexpected first queue item'); if(second?.id!=='20260813-problem-water-size'||second.linkMode!=='direct'||second.shortLinkId!==4) throw new Error('Unexpected following queue item'); console.log('QUEUE_SCOPE_OK=True')"
```

Expected: `QUEUE_SCOPE_OK=True`.

- [ ] **Step 2: Run the renderer in dry-run mode**

Run:

```powershell
$output = node scripts/publish-facebook-posts.js --dry-run --now 2026-08-18T22:00:00+09:00
if ($LASTEXITCODE -ne 0) { throw 'Facebook dry run failed' }
$result = $output | ConvertFrom-Json
if ($result.id -ne '20260812-idol-blackpink-photocard') { throw 'Unexpected queue item' }
if ($result.files.Count -ne 3) { throw 'Expected three cards' }
if (-not $result.content.caption.Contains('https://idont82.github.io/g/?n=3')) { throw 'Expected short link 3' }
if ($result.content.destinationLink -notmatch '/blog/blackpink-album-photocard-storage-guide\.html') { throw 'Expected tracked blog destination' }
Write-Output 'DRY_RUN_OK=True'
```

Expected: `DRY_RUN_OK=True` with no queue state change.

### Task 2: Publish the Blackpink post

**Files:**
- Read: `.facebook-artifacts/meta.env`
- Modify through publisher: `data/facebook-post-queue.json`

- [ ] **Step 1: Load and validate the ignored Page token**

Run the token load without printing its value:

```powershell
$tokenFile = 'D:\py_project\claw\idont82.github.io\.facebook-artifacts\meta.env'
$tokenLine = Get-Content -LiteralPath $tokenFile | Where-Object { $_ -match '^META_PAGE_ACCESS_TOKEN=' } | Select-Object -First 1
if (-not $tokenLine) { throw 'Token entry missing' }
$env:META_PAGE_ACCESS_TOKEN = $tokenLine.Substring('META_PAGE_ACCESS_TOKEN='.Length).Trim()
if ($env:META_PAGE_ACCESS_TOKEN.Length -lt 20) { throw 'Token appears incomplete' }
Write-Output 'TOKEN_LOADED=True'
```

Expected: `TOKEN_LOADED=True`; the token itself must not appear in output.

- [ ] **Step 2: Publish through the existing duplicate-safe publisher**

Run in the same PowerShell process after loading the token:

```powershell
$output = node --use-system-ca scripts/publish-facebook-posts.js --now 2026-08-18T22:00:00+09:00
if ($LASTEXITCODE -ne 0) { throw 'Facebook publisher failed' }
$result = $output | ConvertFrom-Json
if ($result.status -ne 'published') { throw "Unexpected status: $($result.status)" }
if ($result.id -ne '20260812-idol-blackpink-photocard') { throw "Unexpected queue item: $($result.id)" }
Write-Output "POST_ID=$($result.post.id)"
Write-Output "PERMALINK=$($result.post.permalink_url)"
```

Expected: `status` is `published`, and a post ID and Facebook permalink are returned.

### Task 3: Verify and persist the result

**Files:**
- Verify: `data/facebook-post-queue.json`
- Commit: `data/facebook-post-queue.json`

- [ ] **Step 1: Verify the remote post and three attached cards**

Use the returned post ID and the token already loaded:

```powershell
$env:VERIFY_POST_ID = $result.post.id
node --use-system-ca -e "const token=process.env.META_PAGE_ACCESS_TOKEN; const postId=process.env.VERIFY_POST_ID; const version=process.env.META_GRAPH_VERSION||'v26.0'; const fields='id,permalink_url,created_time,attachments.limit(1){subattachments.limit(10)}'; fetch('https://graph.facebook.com/'+version+'/'+encodeURIComponent(postId)+'?fields='+encodeURIComponent(fields),{headers:{Authorization:'Bearer '+token}}).then(async r=>{const b=await r.json(); if(!r.ok||b.error) throw new Error(b.error?.message||('HTTP '+r.status)); const cards=b.attachments?.data?.[0]?.subattachments?.data?.length||0; if(cards!==3) throw new Error('Expected three remote cards'); console.log('REMOTE_POST_FOUND=True'); console.log('REMOTE_CARD_COUNT='+cards); console.log('REMOTE_PERMALINK='+b.permalink_url)}).catch(e=>{console.error(e.message);process.exit(1)})"
```

Expected: `REMOTE_POST_FOUND=True` and `REMOTE_CARD_COUNT=3`.

- [ ] **Step 2: Verify only Blackpink advanced and water stayed queued**

Run:

```powershell
node -e "const q=require('./data/facebook-post-queue.json'); const blackpink=q.find(x=>x.id==='20260812-idol-blackpink-photocard'); const water=q.find(x=>x.id==='20260813-problem-water-size'); if(blackpink?.status!=='published'||!blackpink.facebookPostId) throw new Error('Blackpink publication state missing'); if(water?.status!=='queued'||water.facebookPostId) throw new Error('Water item changed unexpectedly'); console.log('QUEUE_STATE_OK=True')"
```

Expected: `QUEUE_STATE_OK=True`.

- [ ] **Step 3: Commit only the queue state and push main**

Run:

```powershell
git -c safe.directory='D:/py_project/claw/idont82.github.io' add -- data/facebook-post-queue.json
git -c safe.directory='D:/py_project/claw/idont82.github.io' commit --only -m "chore: record blackpink facebook post" -- data/facebook-post-queue.json
git -c safe.directory='D:/py_project/claw/idont82.github.io' push origin main
```

Expected: the commit summary lists only `data/facebook-post-queue.json`, and `origin/main` advances to that commit.

- [ ] **Step 4: Confirm the token file is untracked and remote main matches**

Run:

```powershell
$localHead = git -c safe.directory='D:/py_project/claw/idont82.github.io' rev-parse HEAD
$remoteLine = git -c safe.directory='D:/py_project/claw/idont82.github.io' ls-remote origin refs/heads/main
if (-not $remoteLine.StartsWith($localHead)) { throw 'Remote main does not match local HEAD' }
$trackedSecret = git -c safe.directory='D:/py_project/claw/idont82.github.io' ls-files -- '.facebook-artifacts/meta.env'
if ($trackedSecret) { throw 'Token file is unexpectedly tracked' }
Write-Output 'FINAL_VERIFICATION=True'
```

Expected: `FINAL_VERIFICATION=True`.
