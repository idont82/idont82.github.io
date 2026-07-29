# Naver Search CTR Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the search intent match of four high-opportunity pages without changing their URLs, layouts, canonical links, or existing product and location claims.

**Architecture:** Keep each page self-contained and make narrow content edits in its existing metadata and opening content. Separate the Seoul blog page from the main directory by framing it as a one-area half-day route chooser, strengthen decision-oriented copy on the capsule detergent page, expose route facts earlier on the Gangnam page, and move the exact salt-bread ingredient intent into the recipe title and opening.

**Tech Stack:** Static HTML5, existing shared CSS, JSON-LD, PowerShell and Node.js verification

---

## File Map

- Modify: `blog/seoul-claw-machine-guide.html` — distinguish the blog article as a half-day route chooser.
- Modify: `search/capsule-detergent-budget-top3.html` — surface the use-case winner for each existing product.
- Modify: `search/gangnam-claw-machine-guide.html` — surface the 11번 출구, 10곳, and walking-route facts.
- Modify: `recipe/salt-bread.html` — target the `소금빵 재료` intent and expose the existing measurements earlier.
- Verify: `data/search-page-checks/gangnam-claw-machine-guide.required.txt` — reuse the existing required-marker artifact without modifying it.

### Task 1: Differentiate the Seoul Blog Route

**Files:**
- Modify: `blog/seoul-claw-machine-guide.html:16-54`
- Modify: `blog/seoul-claw-machine-guide.html:128-166`

- [ ] **Step 1: Capture the current metadata and heading state**

Run:

```powershell
rg -n '<title>|name="description"|og:title|og:description|twitter:title|twitter:description|"headline"|"description"|"dateModified"|<h1|article-summary-box' blog/seoul-claw-machine-guide.html
```

Expected: the page still uses `서울 인형뽑기 성지 TOP 코스` as its primary title and H1.

- [ ] **Step 2: Change metadata and structured data to the approved route intent**

Use these exact primary strings while preserving the canonical URL and image metadata:

```html
<title>서울 인형뽑기 반나절 코스 | 홍대·강남·신림 동선 비교</title>
<meta name="description" content="서울 인형뽑기를 반나절 즐길 때 어느 지역을 고를지 정리했습니다. 홍대·강남·신림·연신내 등 7개 코스의 매장 수, 출발역, 동선 특징을 비교해 한 지역을 골라보세요.">
```

Set the matching Open Graph, Twitter, and BlogPosting headline to
`서울 인형뽑기 반나절 코스 | 홍대·강남·신림 동선 비교`. Set the
BlogPosting description to `서울 인형뽑기를 반나절 즐길 때 한 지역을
고를 수 있도록 7개 코스의 매장 수, 출발역, 동선 특징을 비교한 글` and
`dateModified` to `2026-07-29`.

- [ ] **Step 3: Change the visible opening to explain that the reader chooses one area**

Set the H1 to:

```html
<h1 class="blog-article-title">서울 인형뽑기 반나절 코스 | 홍대·강남·신림 중 어디로 갈까</h1>
```

Update the summary box so it says that a half-day plan should choose one area,
then preserves the existing distinctions: Hongdae for variety, Gangnam for
scale, and Sinlim or Yeonsinnae for a short walking route. Change the first
table-of-contents label from `빠른 선택` to `반나절 코스 선택`.

- [ ] **Step 4: Verify intent separation**

Run:

```powershell
rg -n '반나절 코스|한 지역|dateModified.*2026-07-29|canonical' blog/seoul-claw-machine-guide.html
```

Expected: the half-day and one-area intent appears in metadata and the opening,
and the canonical remains `/blog/seoul-claw-machine-guide.html`.

### Task 2: Strengthen Capsule Detergent Decision Copy

**Files:**
- Modify: `search/capsule-detergent-budget-top3.html:16-27`
- Modify: `search/capsule-detergent-budget-top3.html:107-130`

- [ ] **Step 1: Confirm existing product claims**

Run:

```powershell
rg -n '퍼실|탐사|피지|세척력|가성비|쉰내|드럼|통돌이' search/capsule-detergent-budget-top3.html
```

Expected: the page already supports Persil for cleaning power, Tamsaa for
value, Fiji for odor, and contains a washer-type FAQ. Do not introduce an exact
per-wash price because the page has no stable price value.

- [ ] **Step 2: Replace title and sharing metadata**

Use:

```html
<title>캡슐세제 추천 TOP 3 (2026) | 세척력·가성비·쉰내별 1위</title>
<meta name="description" content="캡슐세제 추천 TOP 3를 세척력, 가성비, 실내건조 쉰내 기준으로 비교했습니다. 퍼실·탐사·피지 중 세탁 습관에 맞는 제품과 드럼·통돌이 사용법을 확인하세요.">
```

Match the Open Graph title and description to the same decision-oriented
message while preserving the canonical URL and image.

- [ ] **Step 3: Put the existing conclusions before the comparison table**

Change the H1 to:

```html
<h1>캡슐세제 추천 TOP 3 (2026) | 세척력·가성비·쉰내 비교</h1>
```

Replace the generic intro with a short conclusion containing all three
supported choices:

```html
<p class="intro">
  캡슐세제 추천을 빠르게 고르면 <strong>세척력은 퍼실, 대용량 가성비는 탐사,
  실내건조 쉰내 관리는 피지</strong>가 기준입니다. 세 제품의 세척력과 용도,
  드럼·통돌이 사용 여부를 비교해 세탁 습관에 맞는 한 가지를 고를 수 있게 정리했습니다.
</p>
```

Add a `사용 기준` row to the existing comparison table with `드럼·통돌이
겸용` for each product only because the FAQ already states that compatibility.
Keep the current non-numeric price bands and do not make a live-price claim.

- [ ] **Step 4: Verify required decision markers**

Run:

```powershell
$page = Get-Content -Raw -Encoding UTF8 search/capsule-detergent-budget-top3.html
@('캡슐세제 추천 TOP 3','세척력은 퍼실','대용량 가성비는 탐사','실내건조 쉰내 관리는 피지','드럼·통돌이') | ForEach-Object { if (-not $page.Contains($_)) { throw "Missing marker: $_" } }
```

Expected: command exits with code 0 and no output.

### Task 3: Surface Gangnam Route Facts

**Files:**
- Modify: `search/gangnam-claw-machine-guide.html:16-33`
- Modify: `search/gangnam-claw-machine-guide.html:186-211`
- Verify: `data/search-page-checks/gangnam-claw-machine-guide.required.txt`

- [ ] **Step 1: Confirm the existing route evidence**

Run:

```powershell
rg -n '11번 출구|10곳|전체 도보 약 1000m|북쪽 메인|남쪽' search/gangnam-claw-machine-guide.html
```

Expected: all route facts already exist in the page; the edit only moves them
into the search snippet and opening.

- [ ] **Step 2: Tighten the metadata without replacing the successful keyword**

Keep the current title. Replace the description with:

```html
<meta name="description" content="강남 인형뽑기 성지 10곳을 강남역 11번 출구부터 도보 약 1km 동선으로 정리했습니다. 짱오락실·와와오락실을 먼저 보고 서초동 남쪽 라인까지 이어가세요.">
```

Update the Open Graph and Twitter descriptions to the same route facts. Keep
`강남 인형뽑기 성지` as the H1 and keep the existing canonical URL.

- [ ] **Step 3: Put time and route scope in the opening**

Replace the article lead with copy that states: start at exit 11, check the
northern main line first, continue to the southern line if time remains, and
allow about 1–2 hours for the approximately 1 km route. Add `추천 소요시간:
약 1~2시간` to the existing route metadata beside the station and distance.

- [ ] **Step 4: Run the existing required-marker check**

Run:

```powershell
$page = Get-Content -Raw -Encoding UTF8 search/gangnam-claw-machine-guide.html
Get-Content -Encoding UTF8 data/search-page-checks/gangnam-claw-machine-guide.required.txt | ForEach-Object { if ($_ -and -not $page.Contains($_)) { throw "Missing marker: $_" } }
```

Expected: command exits with code 0 and no output.

### Task 4: Match the Salt-Bread Ingredient Intent

**Files:**
- Modify: `recipe/salt-bread.html:14-33`
- Modify: `recipe/salt-bread.html:66-90`

- [ ] **Step 1: Confirm that all proposed measurements are existing claims**

Run:

```powershell
rg -n '강력분 300g|드라이이스트 5g|설탕 18g|소금 5g|물 185g|가염버터 80g|8개' recipe/salt-bread.html
```

Expected: every measurement appears in the existing recipe and Recipe JSON-LD.

- [ ] **Step 2: Update recipe metadata and structured data**

Use:

```html
<title>소금빵 재료와 황금비율 | 8개 분량 기본 레시피</title>
<meta name="description" content="소금빵 재료와 8개 분량 황금비율을 정리했습니다. 강력분 300g, 물 185g, 가염버터 80g을 기준으로 발효부터 굽기까지 집에서 따라 해보세요.">
```

Change the Open Graph title to `소금빵 재료와 황금비율 | 기본 레시피`,
the Open Graph description to the same ingredient-first intent, the Recipe name
to `소금빵 재료와 기본 레시피`, and its description to `소금빵 8개 분량
재료와 집에서 따라 하기 쉬운 기본 레시피`.

- [ ] **Step 3: Make the existing ingredient list visible from the opening**

Change the H1 to:

```html
<h1>소금빵 재료와 황금비율</h1>
```

Change the opening summary to name the 8-piece base amounts for flour, water,
and butter and tell the reader that the full ingredient list follows. Change
the ingredient heading to `소금빵 재료 8개 분량`; do not duplicate or alter the
existing ingredient list.

- [ ] **Step 4: Verify Recipe JSON-LD and ingredient markers**

Run:

```powershell
$html = Get-Content -Raw -Encoding UTF8 recipe/salt-bread.html
$matches = [regex]::Matches($html, '<script type="application/ld\\+json">(?<json>[\\s\\S]*?)</script>')
$matches | ForEach-Object { $_.Groups['json'].Value | ConvertFrom-Json | Out-Null }
@('소금빵 재료와 황금비율','강력분 300g','미지근한 물 185g','가염버터 80g') | ForEach-Object { if (-not $html.Contains($_)) { throw "Missing marker: $_" } }
```

Expected: command exits with code 0 and no output.

### Task 5: Cross-Page Verification

**Files:**
- Verify: `blog/seoul-claw-machine-guide.html`
- Verify: `search/capsule-detergent-budget-top3.html`
- Verify: `search/gangnam-claw-machine-guide.html`
- Verify: `recipe/salt-bread.html`

- [ ] **Step 1: Check whitespace and scope**

Run:

```powershell
git diff --check -- blog/seoul-claw-machine-guide.html search/capsule-detergent-budget-top3.html search/gangnam-claw-machine-guide.html recipe/salt-bread.html
git status --short
```

Expected: no whitespace errors; only the four scoped pages are newly modified
by this implementation, while pre-existing unrelated worktree changes remain
untouched.

- [ ] **Step 2: Validate every JSON-LD block in the four pages**

Run:

```powershell
$files = @('blog/seoul-claw-machine-guide.html','search/capsule-detergent-budget-top3.html','search/gangnam-claw-machine-guide.html','recipe/salt-bread.html')
foreach ($file in $files) {
  $html = Get-Content -Raw -Encoding UTF8 $file
  [regex]::Matches($html, '<script type="application/ld\\+json">(?<json>[\\s\\S]*?)</script>') | ForEach-Object {
    $_.Groups['json'].Value | ConvertFrom-Json | Out-Null
  }
}
```

Expected: command exits with code 0 and no parse errors.

- [ ] **Step 3: Start the local server**

Run:

```powershell
node server.js
```

Expected: the static server listens at `http://localhost:3000`. Keep the process
running for the next step.

- [ ] **Step 4: Request all four pages**

Run in another PowerShell process:

```powershell
@('/blog/seoul-claw-machine-guide.html','/search/capsule-detergent-budget-top3.html','/search/gangnam-claw-machine-guide.html','/recipe/salt-bread.html') | ForEach-Object {
  $response = Invoke-WebRequest -UseBasicParsing "http://localhost:3000$_"
  if ($response.StatusCode -ne 200) { throw "$_ returned $($response.StatusCode)" }
}
```

Expected: command exits with code 0 and no output.

- [ ] **Step 5: Review the final scoped diff**

Run:

```powershell
git diff -- blog/seoul-claw-machine-guide.html search/capsule-detergent-budget-top3.html search/gangnam-claw-machine-guide.html recipe/salt-bread.html
```

Expected: changes are limited to metadata, structured-data copy, headings,
opening summaries, and the approved comparison/route facts. No URL, canonical,
affiliate link, CSS, or unrelated page change appears.
