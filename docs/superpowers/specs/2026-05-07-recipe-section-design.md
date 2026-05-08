# Recipe Section Design

## Goal

Add a new `recipe/` section that mirrors the repository's static content pattern: one index page plus standalone detail pages. The first two recipes are salt bread and Dubai chewy cookie, each with ingredient lists, step-by-step instructions, and Coupang-linked ingredient recommendations.

## Structure

- `recipe/index.html`
- `recipe/salt-bread.html`
- `recipe/dubai-chewy-cookie.html`

## Page Pattern

Use plain static HTML with light, readable styling tuned for recipe content rather than search comparison content.

Each detail page should include:

- Title, description, canonical, OG, and Twitter meta tags
- Intro summary
- Ingredient list with quantities
- Recommended ingredient cards with temporary Coupang links
- Step-by-step cooking method
- Storage/tips section
- Disclosure for affiliate links

`recipe/index.html` should act as a hub page listing available recipes with short summaries and links.

## Content Approach

- Salt bread: home-baking oriented, practical ingredient substitutions allowed
- Dubai chewy cookie: trending dessert interpretation centered on pistachio spread, kataifi, and chewy cookie dough
- Ingredient links are temporary placeholders and can be replaced later with exact affiliate links from the user

## Navigation and SEO

- Add recipe URLs to `sitemap.xml`
- Add an entry point from root `index.html`
- Keep the section independent from `/search/`, but consistent with the repo's static HTML publishing model

## Non-Goals

- No JS app or dynamic filtering
- No build pipeline changes
- No CMS or shared component system
