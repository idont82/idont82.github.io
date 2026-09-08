# Blogger Imported Laptop Layout Design

**Date:** 2026-09-08

## Goal

Update the existing Blogger copy of `blog/best-value-laptop-top3-guide.html` so it retains the original page's readable spacing, comparison table, product-card grouping, prominent prices, and clear purchase buttons without creating a duplicate post.

## Root cause

The source page defines its laptop layout in a `<style>` element inside `<head>`. The importer copies only `<main>`, so Blogger receives the semantic class names but none of their CSS rules. Product cards therefore collapse into unstyled document flow and prices lose their visual hierarchy.

## Rendering approach

Use a hybrid layout:

- Prepend a narrowly scoped `<style>` block whose selectors all begin with `.goldpick-import`.
- Wrap the imported body in `.goldpick-import` so rules cannot affect the Blogger theme.
- Preserve the source content, product order, images, links, specifications, and disclosure.
- Add inline fallback styles to the summary, hero image, table, product cards, role labels, prices, purchase buttons, caution box, and disclosure.
- Use the scoped stylesheet for responsive behavior: two-column product cards on wider screens and stacked cards below 680px.
- Display prices in large, bold orange text and purchase links as high-contrast buttons.
- Keep the Coupang Partners disclosure as the final content element.

## Update flow

1. Convert the local source page into Blogger-safe HTML.
2. Find the existing Blogger post by its stable source marker.
3. Update that post in place through Blogger API v3; do not insert a new post.
4. Fetch the updated post and verify its title, source marker, three product cards, four images, three emphasized prices, purchase buttons, scoped stylesheet, responsive rule, and bottom disclosure.
5. Fetch the public URL and confirm HTTP 200 and the same structural markers.

## Code boundaries

- `scripts/publish-existing-page-to-blogger.js` owns source conversion, layout decoration, duplicate lookup, update, and remote verification.
- `scripts/blogger-api.js` adds a minimal `updatePost(blogId, postId, post)` method using Blogger's post update endpoint.
- Existing source HTML remains unchanged.
- OAuth credentials and publication records remain under ignored `.blogger-artifacts/`.

## Tests

- A source-conversion test proves all key classes receive scoped or inline styling.
- A layout test proves three product cards, three emphasized prices, and mobile stacking rules are present.
- An API test proves updating uses the existing post ID and does not request draft creation.
- A workflow test proves an existing marker triggers update rather than insert.
- Fresh remote verification checks the public Blogger post after the update.
