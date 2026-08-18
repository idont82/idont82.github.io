# Blackpink Facebook Single Post Design

## Scope

Publish only the existing `20260812-idol-blackpink-photocard` queue item to the Gold Pick Facebook Page. Do not publish, schedule, or modify the following water-size direct-link item.

## Content and Link

- Render the existing three-card Blackpink photocard storage post.
- Keep the existing blog link mode.
- Show the short URL `https://idont82.github.io/g/?n=3` in the caption.
- Resolve that short URL to the tracked Blackpink blog URL.
- Keep the Coupang Partners disclosure in the Facebook caption.

## Publication Flow

1. Load the ignored Page access token from `.facebook-artifacts/meta.env` without printing it.
2. Run a dry run and require exactly three generated cards, the expected queue ID, and short link 3.
3. Publish through the existing Graph API client, including its duplicate-post check.
4. Query the resulting post through Graph API and require the returned post ID and three attached cards.
5. Persist only the Blackpink queue item's published state and push that state to `main`.

## Error Handling

If token validation, rendering, upload, publishing, or verification fails, stop without advancing to the water-size item. Preserve the failure state and report the sanitized Meta error.

## Out of Scope

- Publishing the water-size direct-link post
- Creating a one-hour Windows task
- Changing card layout, copy, article content, or redirect behavior
