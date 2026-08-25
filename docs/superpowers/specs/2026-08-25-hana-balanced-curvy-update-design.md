# HANA Balanced Curvy Update Design

## Goal

Give HANA a more visibly curvy, attractive silhouette while preserving the trustworthy Gold Pick shopping-editor identity and keeping product information—not sexualized presentation—as the purpose of the Facebook creative.

## Selected Direction

Use the **natural balanced-curvy** approach. Increase overall body volume moderately across the shoulders, bust, waist-to-hip transition, and hips. Keep realistic adult proportions and a coherent full-body silhouette rather than emphasizing one body area.

The alternatives were rejected as defaults:

- A strongly exaggerated hourglass figure would attract more attention but could overpower the product and make the post feel provocative.
- Changing only pose and clothing would be safer but would not create the clearly visible adjustment requested by the user.

## Identity and Styling Invariants

- Preserve HANA's approved face, apparent late-twenties age, long dark-brown hair, natural makeup, and friendly expression.
- Preserve the realistic Korean lifestyle-editorial photography style.
- Keep the charcoal cardigan, light blouse, cafe setting, generic logo-free laptop, and current upper-frame product-use composition.
- Keep clothing non-revealing and professionally styled. Do not add cleavage, lingerie styling, transparent fabric, or sexualized posing.
- Preserve natural hands, wrists, seated posture, and realistic anatomy.
- The resulting body must look physically coherent with the head, shoulders, arms, and chair rather than appearing locally enlarged or warped.

## Asset Update

Update both reusable HANA assets so future generations share the same approved body identity:

- `images/facebook-fictional-model/hana-reference.png`: expand the reference framing enough to establish the balanced-curvy upper-body silhouette while preserving the approved face.
- `images/facebook-fictional-model/hana-laptop-document-scene.png`: apply the same body identity in the cafe scene while keeping the face, laptop, and hand interaction above the card's information panel.

Replace the existing files only after side-by-side inspection confirms identity continuity. Keep the previous versions recoverable in Git history; do not create additional public-facing variants.

## Pilot Regeneration

After both source assets pass review, rerender the existing three-card pilot. Only card 1 should change visually because cards 2 and 3 use verified product evidence without HANA. Card 1 must retain:

- the `AI 연출 이미지` disclosure;
- visible face, natural hands, and recognizable generic laptop above the opaque panel;
- the actual product image only inside the white product panel;
- current headline, source date, product name, and safe margins.

Cards 2 and 3 must remain pixel-identical unless deterministic image-download metadata causes a harmless encoding difference. Any unexpected layout or content change is a regression.

## Validation

- Compare the updated reference and cafe scene with the current committed versions.
- Confirm the same face, hair, age, expression, clothing, and setting.
- Confirm a clearly more curvy but realistic overall silhouette at normal mobile viewing size.
- Reject exaggerated bust-only edits, anatomical distortion, sexualized framing, fabric warping, chair/body intersection, or loss of hand/laptop visibility.
- Verify both source PNGs decode successfully and retain an approximately 4:5 aspect ratio.
- Rerender all three 1080-by-1350 cards and inspect them at original detail and mobile scale.
- Run the existing HANA pilot and Facebook renderer regression suites.
- Keep the pilot `draft` with `publish: false`; do not access `meta.env` or call the Facebook API.

## Scope

This update changes only HANA's two source assets and the ignored local pilot render artifacts. Renderer code, pilot copy, product facts, live queues, and Facebook publication remain unchanged unless a test exposes a genuine regression caused by the new image composition.
