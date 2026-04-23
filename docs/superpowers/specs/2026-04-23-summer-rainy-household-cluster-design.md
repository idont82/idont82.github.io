# Summer Rainy Household Search Cluster Design

## Goal

Add three search-led buying guide pages for summer and rainy-season household needs:

- 23. 가정용 모기퇴치기 TOP 3
- 24. 모기기피제 TOP 3
- 25. 제습제/습기제거제 TOP 3

These pages target users who search Naver or Google before buying on Coupang because the category has seasonal urgency, similar product names, and unclear selection criteria.

## Search Intent

### 23. 가정용 모기퇴치기

Primary search terms:

- 모기퇴치기 추천
- 가정용 모기퇴치기
- 전기 모기퇴치기

Recommended product slots:

- Rank 1: indoor UV or suction-style mosquito trap
- Rank 2: electric mosquito swatter
- Rank 3: camping or outdoor-compatible mosquito repellent device

### 24. 모기기피제

Primary search terms:

- 모기기피제 추천
- 어린이 모기기피제
- 야외 모기기피제

Recommended product slots:

- Rank 1: children or family-use repellent
- Rank 2: outdoor spray or mist type
- Rank 3: portable patch, band, or clip type

### 25. 제습제/습기제거제

Primary search terms:

- 제습제 추천
- 옷장 습기제거제
- 장마철 제습제

Recommended product slots:

- Rank 1: wardrobe or drawer moisture absorber
- Rank 2: large tub moisture absorber
- Rank 3: shoe cabinet, car, or small-space absorber

## Page Structure

Each page follows the current static TOP 3 guide pattern:

- SEO title, description, canonical, Open Graph, Twitter image, and site favicon metadata
- Disclosure block
- Hero header
- Two intro paragraphs explaining the purchase problem
- Compare table with `.table-rank` gold, silver, and bronze rank badges
- Three product cards using `.product`, `.rank-badge`, `.pros-cons`, `.specs`, `.recommend-target`, and `.cta`
- Four FAQ items
- Cluster navigation linking pages 23, 24, and 25

## Affiliate Link Handling

Initial implementation can use placeholder SVG product images and `상품 링크 준비중` CTAs.

When Coupang affiliate snippets are supplied, update each product with:

- Real affiliate URL
- Real image URL
- Product-specific alt text
- `rel="sponsored nofollow"`
- `target="_blank"`
- `referrerpolicy="unsafe-url"`
- CTA text `최저가 확인하기`

No placeholder CTA text should remain after final product links are supplied.

## Site Integration

Add the three pages to:

- `search/index.html` as entries 23, 24, and 25
- root `index.html` as a representative summer/rainy-season card
- `sitemap.xml` with `lastmod` `2026-04-23`

## Verification

Before committing implementation, verify:

- Each new page exists
- Each page has three product cards
- Each page has three compare-table rank badges
- Each page has at least four FAQ items
- Each page has canonical and `og:image`
- `search/index.html` includes 23, 24, and 25
- `sitemap.xml` includes all three new URLs
- No unrelated untracked docs are staged

## Out Of Scope

- Medical or pesticide safety claims
- Real-time ranking claims
- Automatic Coupang scraping
- Guaranteeing Naver indexing
