# Laptop Blog Three-Pack and Facebook Publication Design

## Goal

Publish three Korean laptop buying guides for value, maximum performance, and document work. Each guide compares three current Coupang listings, helps readers choose by use case, and leads to a corresponding Facebook carousel post whose first line is the blog URL.

## Article Set

| # | Slug | Working title | Selection focus |
|---|---|---|---|
| 1 | `best-value-laptop-top3-guide` | `가성비 노트북 추천 TOP 3, 가격과 사양을 함께 보는 선택 기준` | Balanced CPU, memory, storage, display, and price |
| 2 | `highest-performance-laptop-top3-guide` | `최고성능 노트북 추천 TOP 3, 고사양 작업용 선택 기준` | High-end CPU/GPU, memory, storage, display, and cooling-related listing details |
| 3 | `document-work-laptop-top3-guide` | `문서용 노트북 추천 TOP 3, 가벼운 업무와 휴대성 선택 기준` | Office performance, portability, battery-related listing details, keyboard and screen practicality |

Each article contains exactly three distinct products. A product may appear in only one article so the three guides cover nine different choices.

## Product Data and Claims

Fresh Coupang search results must be collected during implementation. Only listings with a clear product name, price, image, direct affiliate URL, and enough visible specifications for a useful comparison may be selected.

Product identity, price, image, and affiliate URL come from the collected Coupang data. CPU, GPU, memory, storage, display, weight, and operating-system details may be stated only when supported by the listing title or collected product metadata. Unverified battery-life, thermal, benchmark, durability, and firsthand-use claims are prohibited. Prices are labeled as collection-time values and may change.

## Page Structure

All three pages reuse the existing Gold Pick blog shell and shared assets. Each page includes:

1. Unique Korean title, description, canonical URL, Open Graph and Twitter metadata, and `BlogPosting` JSON-LD.
2. A short introduction and compact decision summary.
3. A linked hero product image and mobile summary CTA.
4. Selection criteria tailored to the article's use case.
5. Three product cards with price, supported specifications, suitable user, and limitations.
6. A three-product comparison table.
7. A practical buying checklist, FAQ, related links to the other two laptop guides, references where needed, and the Coupang Partners disclosure.

Every affiliate link opens in a new tab and uses `rel="sponsored nofollow"`, `referrerpolicy="unsafe-url"`, and stable `data-coupang-*` tracking attributes.

## Data and Generation

Create one laptop-specific editorial configuration file, three collected Coupang data files, and one deterministic page generator. The generator validates all input before writing any page and rejects:

- missing product names, numeric prices, images, or allowed affiliate URLs;
- duplicate product identifiers within or across articles;
- an article with other than three products;
- missing editorial sections, disclosure text, or tracked affiliate placements.

The generator builds all three HTML strings successfully before writing output, then inserts each URL exactly once into `blog/index.html`, the root `index.html`, and `sitemap.xml`. It must preserve unrelated content and existing user changes.

## Facebook Publication

Add three queue entries with `linkMode: "blog"`, unique IDs, unique short-link IDs, and three concise carousel phrases per article. All three posts are due immediately and are published consecutively only after the public blog URLs return successfully.

Change Facebook caption construction from the current copy-first layout to this order for blog-link posts:

1. Short blog URL on the first line.
2. Blank line.
3. Two concise introductory lines.
4. Blank line.
5. Coupang Partners disclosure.

The first-line rule applies to these laptop posts and future blog-link posts. Direct affiliate posts retain their existing safe handling unless a focused test demonstrates that the same layout is valid for them. The carousel image renderer and Graph API publication flow remain unchanged.

Before live publication, perform dry runs for all three laptop queue items and verify that the caption's first non-empty line is the expected short blog URL. Publish sequentially and record each Facebook post ID, permalink, and publication time in the queue. If one post fails, stop the sequence and preserve its failure state rather than continuing with a partial unknown result.

## Testing and Verification

Add focused automated checks for:

- three generated files with complete SEO, JSON-LD, Korean headings, disclosure, and tracked affiliate placements;
- exactly three distinct products per page and nine distinct products across the set;
- valid product names, prices, images, and allowed Coupang affiliate URLs;
- comparison tables and use-case-specific cautions;
- exact-once discovery links in the blog index, root index, and sitemap;
- deterministic generator output;
- Facebook blog captions beginning with the short blog URL;
- three valid new queue entries and successful dry-run card generation.

Run the focused tests, existing Facebook publisher tests, affiliate-tracking tests, `git diff --check`, and local HTTP checks. Inspect all three pages at desktop and mobile widths, including hero images, tables, CTA links, and Korean text rendering.

## Deployment and Failure Handling

Commit only files created or changed for this task because the working tree already contains unrelated user changes. Push the verified task commits to `main`, confirm all three public URLs respond, and only then publish the three Facebook posts consecutively.

If a suitable product set cannot be obtained, change the query or candidate selection instead of using duplicates or unsupported specifications. If generation, tests, deployment, URL verification, dry-run rendering, or Facebook publication fails, stop at that boundary and report the concrete failure. Never publish a Facebook post pointing to an unavailable page.

## Out of Scope

- Rewriting existing blog articles.
- Site-wide visual redesign.
- Automated recurring laptop-price refreshes.
- Claims based on unsupported reviews or benchmarks.
- Altering or committing unrelated staged and unstaged user work.
