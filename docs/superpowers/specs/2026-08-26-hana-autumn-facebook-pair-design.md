# HANA Autumn Facebook Pair Design

## Goal

Publish two separate Gold Pick Facebook carousel posts for autumn products: a lightweight windbreaker and lightweight trekking shoes. Work directly on `main`, preserve unrelated uncommitted files, and place each tracked blog link on the first line of its caption.

## Content

Each post uses the existing three-card `lifestyle-hybrid` format:

1. HANA wearing or using the product in a natural autumn scene, with `AI 연출 이미지` disclosure.
2. The verified Coupang product image, name, price band, and three concrete comparison points.
3. Suitable uses, one purchase caution, and a link-to-article call to action.

The windbreaker post links to `/blog/lightweight-windbreaker-autumn-guide.html`. The trekking-shoes post links to `/blog/autumn-lightweight-trekking-shoes-guide.html`. Both links use Facebook/social/card-news UTM parameters and a unique 2026-08-26 content ID.

## Visual Direction

Use the established fictional adult model HANA consistently. The windbreaker scene is a warm urban park with fallen leaves; the trekking scene is a safe, gentle woodland trail. Keep the outfit stylish and seasonally appropriate, avoid real-person resemblance, brand logos, embedded text, watermarks, unsafe terrain, and misleading product identity. The generated lifestyle image is illustrative; the actual product photograph appears separately on cards two and three.

## Data and Publication Safety

Store both post definitions in `data/facebook-hana-autumn-posts.json`. Keep access tokens only in `.facebook-artifacts/meta.env`. Render and review all six cards before publication. Publish posts one at a time, use the first-line tracked blog URL as the duplicate marker, and read each post back from Graph API to verify its ID, permalink, message, and three attached photos. Never delete or replace existing Facebook posts.

## Verification

- Contract test proves there are exactly two posts and each has three correctly ordered lifestyle roles.
- Every first caption line is the expected tracked blog URL.
- Every scene carries the AI disclosure and every caption carries the Coupang Partners disclosure.
- Renderer produces six 1080×1350 PNG files without overflow.
- Live Graph read-back proves two distinct published post IDs, exact first-line links, and three images per post.

