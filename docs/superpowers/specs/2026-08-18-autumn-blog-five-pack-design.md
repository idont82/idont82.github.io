# Autumn Blog Five-Pack Design

## Goal

Publish five Korean autumn shopping guides that balance evergreen household search demand with seasonal fashion and outing demand. Every product and image must come from a fresh Coupang Partners API result collected during implementation.

## Article Set

| # | Slug | Working SEO title | Product model |
|---|---|---|---|
| 1 | `autumn-bedding-quilt-vs-blanket-guide` | `가을 차렵이불 추천, 담요와 비교해 고르는 환절기 침구 기준` | Three products: lightweight quilt, washable quilt, blanket |
| 2 | `humidifier-types-autumn-guide` | `가습기 추천, 초음파식·가열식·기화식 차이와 청소 기준` | Three products: one product per humidifier type |
| 3 | `autumn-closet-storage-guide` | `가을 옷장 정리용품 추천, 압축팩·제습제·논슬립 옷걸이 비교` | Three products: one per storage problem |
| 4 | `lightweight-windbreaker-autumn-guide` | `가을 경량 바람막이 추천, 일교차에 입기 좋은 제품 고르는 법` | One verified representative product |
| 5 | `autumn-lightweight-trekking-shoes-guide` | `가을 트레킹화 추천, 단풍 나들이용 경량 신발 고르는 기준` | One verified representative product |

The first three articles are household problem-solving comparisons. The last two are focused fashion and outing guides. No celebrity endorsement or unverified association is allowed.

## Content Structure

Each page follows the existing Gold Pick blog shell and contains:

1. One Korean `h1`, a short intro, and a compact decision summary.
2. A hero product image with an affiliate link.
3. Selection criteria based on product specifications and cited public guidance.
4. Either three distinct product cards or one focused product card, according to the table above.
5. A comparison table for three-product pages and a specification table for one-product pages.
6. Practical cautions, a short FAQ, references, related posts, and the Coupang Partners disclosure.
7. Mobile summary CTA, product-card CTA, and hero-image tracking using `data-coupang-placement` and a stable article-specific `data-coupang-product-type`.

Every affiliate anchor opens in a new tab and uses `rel="sponsored nofollow"` plus `referrerpolicy="unsafe-url"`. Product links go directly to the corresponding Coupang Partners product URL.

## SEO and Discovery

Every page includes a unique title, description, canonical URL, indexable robots directive, Open Graph and Twitter metadata, a large product image, and valid `BlogPosting` JSON-LD. Each new URL is inserted exactly once in `index.html` and `sitemap.xml`.

The copy uses natural variants of the main keyword without keyword stuffing. Prices are labeled as API-check-time prices and are not described as guaranteed. The publication date and API verification time are rendered on every page.

## Data and Generator Architecture

Create one generator, `scripts/generate-autumn-blog-pages.js`, responsible only for transforming validated configuration and Coupang product data into the five pages. Keep editorial configuration in `data/autumn-blog-guides.json`. Store the fresh API response used by each article in five `data/coupang-autumn-*.json` files.

The generator must:

- validate required editorial fields and exact product counts before writing any page;
- reject missing product names, prices, images, or non-Coupang affiliate URLs;
- reject duplicate product IDs within an article;
- build all five HTML strings successfully before writing any output, preventing partial generation;
- preserve unrelated existing index and sitemap content while inserting each new article once;
- produce deterministic output from unchanged inputs.

## Product Selection Rules

Implementation queries the Coupang API with terms appropriate to each role, then selects currently returned listings with clear product names, usable product photos, direct product URLs, and prices. Household comparison pages must use genuinely different product roles rather than color variants of the same listing. Focused pages select one representative product with enough visible specifications to support a useful guide.

Do not claim firsthand use, review consensus, medical benefit, waterproofing, warmth, or performance unless the API listing or a cited authoritative source supports the statement. Humidifier guidance must distinguish general indoor-humidity guidance from product capability and must include cleaning and over-humidification cautions.

## Sources

Use primary or authoritative references close to the relevant claim. Planned sources include the Korea Meteorological Administration for autumn variability, the Korea Disease Control and Prevention Agency or another public-health authority for dry-season indoor humidity, the Korea Consumer Agency or product labels for safety and care, and the Korea Tourism Organization for autumn outing context. Product identity, price, image, and affiliate URL come only from the collected Coupang API data.

## Testing and Verification

Add `tests/autumn-blog-pages.test.js` to verify:

- all five files exist and contain complete SEO, JSON-LD, Korean headings, disclosure, and tracked affiliate placements;
- the first three pages render exactly three distinct product cards and the last two exactly one;
- all rendered products have names, numeric prices, images, and allowed Coupang Partners URLs;
- the humidifier page contains cleaning and humidity cautions without medical overclaims;
- each page occurs exactly once in the blog index and sitemap;
- rerunning the generator does not change generated output.

After generation, run the focused test plus existing blog affiliate-tracking tests, inspect all five pages at desktop and mobile widths, verify hero and CTA links, run `git diff --check`, commit only task files, and push `main` after verification.

## Failure Handling

If an API search lacks a suitable product role, change the search term and collect again instead of filling the slot with an unrelated or duplicate item. If any generator validation, test, link check, or visual check fails, do not publish a partial set. Keep all five pages unpublished until the full set passes.

## Out of Scope

- Facebook publication or queue additions
- Scheduled posting
- New site-wide visual components
- Rewriting existing seasonal articles
- Changing unrelated staged or unstaged user work
