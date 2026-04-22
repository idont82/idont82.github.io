# Personal Care And Household Search Cluster Design

## Goal

Add three search-led buying guide pages that continue the existing household repeat-purchase series:

- 20. 탈모/두피 샴푸 TOP 3
- 21. 섬유유연제 TOP 3
- 22. 주방세제 TOP 3

The pages should target users who search Google or Naver before buying on Coupang because the product category has many similar options and unclear selection criteria.

## Search Intent

### 20. 탈모/두피 샴푸

Primary search terms:

- 탈모샴푸 추천
- 두피샴푸 추천
- 지성두피 샴푸 추천

User problem:

- Users want to know whether they should choose a sensitive-scalp, oily-scalp, or value-size shampoo before comparing products.

Recommended product slots:

- Rank 1: sensitive or scalp-care shampoo
- Rank 2: oily-scalp or refreshing shampoo
- Rank 3: value-size daily shampoo

### 21. 섬유유연제

Primary search terms:

- 섬유유연제 추천
- 실내건조 섬유유연제
- 향 좋은 섬유유연제

User problem:

- Users compare scent strength, indoor-drying odor control, and skin sensitivity before repeat purchase.

Recommended product slots:

- Rank 1: long-lasting scent
- Rank 2: indoor-drying odor control
- Rank 3: sensitive-skin or family-use option

### 22. 주방세제

Primary search terms:

- 주방세제 추천
- 젖병세제 추천
- 기름때 주방세제

User problem:

- Users need to decide between degreasing power, baby-bottle safety, and value-size daily use.

Recommended product slots:

- Rank 1: strong degreasing
- Rank 2: baby-bottle or low-irritation option
- Rank 3: value-size daily dish soap

## Page Structure

Each page follows the established TOP 3 guide structure:

- Metadata with category-specific SEO title and description
- Hero section with a clear purchase intent headline
- Intro paragraphs explaining why the category needs comparison
- Compare table with rank crowns for ranks 1, 2, and 3
- Three product sections with image, heading, one-liner, pros/cons, spec bars, recommendation target, and CTA
- FAQ section with at least four category-specific questions
- Cluster navigation linking pages 20, 21, and 22 together

## Affiliate Link Handling

Initial implementation may use placeholder product candidates and existing CTA structure. When Coupang affiliate snippets are provided, each page must be updated with:

- Real Coupang affiliate URL
- Real Coupang image URL
- Product alt text based on the supplied snippet
- `rel="sponsored nofollow"`
- `target="_blank"`
- `referrerpolicy="unsafe-url"`

No `link.coupang.com/a/default` links should remain after final product links are supplied.

## Site Integration

Add the three pages to:

- `search/index.html`
- root `index.html` representative search section if needed
- `sitemap.xml`

The `search/index.html` list should continue numbering from the existing pages:

- 20. 탈모/두피 샴푸
- 21. 섬유유연제
- 22. 주방세제

## Visual And UX Requirements

Use the existing site design system:

- Product rank badges reuse `.rank-badge`
- Compare-table rank badges reuse `.table-rank`
- Gold, silver, and bronze crown treatment remains consistent with pages 17 to 19
- Mobile layout must remain readable without horizontal content overflow

## Verification

Before committing implementation, verify:

- Each new page exists
- Each page has three product sections
- Each page has three comparison rank badges
- Each page has at least four FAQ items
- Each page has canonical metadata
- `search/index.html` includes numbers 20, 21, and 22
- `sitemap.xml` includes the three new URLs
- No unintended unrelated files are staged

## Out Of Scope

- Real-time ranking claims
- Medical claims about hair loss treatment
- Ingredient safety claims beyond general shopping guidance
- Automated Coupang product scraping
