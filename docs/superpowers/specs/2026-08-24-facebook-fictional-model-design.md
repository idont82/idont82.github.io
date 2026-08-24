# Facebook Fictional Model Design

## Goal

Increase Facebook post attention and purchase interest by showing products in a believable lifestyle context with a consistent fictional Gold Pick model. Preserve product accuracy and avoid implying that the fictional model is a real customer, celebrity, or paid endorser.

## Selected Direction

Use the hybrid **person + product proof** format. The fictional model creates the initial emotional hook, while verified product photos and facts provide the evidence needed for a purchase decision.

Two alternatives were considered and rejected as the default:

- A person-first lifestyle card offers the strongest emotional hook but makes the exact product and price harder to understand immediately.
- A product-first information card communicates specifications clearly but gives the fictional model too little presence to become a recognizable Gold Pick asset.

## Fixed Model Identity

The fictional model is named **HANA (하나)**. She is presented as a friendly, polished Korean woman in her late twenties with long dark-brown hair, a bright and healthy expression, natural makeup, and a realistic influencer-style appearance.

HANA's face, hair, age range, and overall mood remain consistent across posts. Clothing, pose, setting, and activity may change to suit the product category. A reusable character reference image or reference set must be used during image generation to reduce identity drift.

HANA must not resemble or be described as a real celebrity. Images must avoid sexualized presentation and unrealistic body proportions.

## Disclosure and Claims

Every lifestyle image containing HANA includes a legible `AI 연출 이미지` label. The label must remain visible in Facebook's mobile crop.

Post copy must not present HANA as an actual buyer or reviewer. Avoid first-person experience claims such as `직접 써보니` unless a real, documented test occurred independently of the fictional image. Use guidance-oriented language such as:

- `이런 상황이라면`
- `선택할 때 볼 점`
- `이런 분께 잘 맞아요`

The post must not imply celebrity endorsement, customer testimony, or a sponsored-model relationship.

## Three-Card Post Structure

Each Facebook post uses three 1080-by-1350 portrait cards.

### Card 1: Lifestyle Hook

- Show HANA wearing or actively using the product in a relevant setting.
- Reserve approximately 65% of the composition for the lifestyle scene.
- Reserve approximately 35% for a clean product-information panel.
- Include one short problem or need statement, a verified product thumbnail, and one concise price-band or selection message.
- Keep the face, product, headline, and disclosure within the mobile-safe area.

### Card 2: Product Proof

- Use the real verified product image rather than a generated substitute.
- Show the accurate product name, the price band as of the content date, and three decision-relevant attributes.
- Do not reproduce an exact price as permanent information. Use `작성일 기준 가격대` or equivalent wording when prices may change.

### Card 3: Fit and Action

- State who the product is suitable for.
- Include one meaningful caution or tradeoff.
- End with `자세한 비교는 본문에서` or an equivalent call to action.

## Category Adaptation

- Clothing: HANA wears the item in a natural outing or daily-life scene.
- Laptops and electronics: HANA uses the device at a desk, cafe, commute, or home-work setting.
- Household products: HANA uses the product in the relevant room and task context.

Generated scenes are illustrative. Exact logos, ports, stitching, controls, colors, and package text must not be trusted as product evidence. If the generated product differs materially from the real product, crop or obscure the unreliable detail and rely on the verified product photo in the information panel.

## Facebook Post Copy

The blog URL appears alone on the first line of the Facebook post. Supporting copy follows after the link and should connect the depicted situation to the buying problem without making a fabricated experience claim.

Recommended copy order:

1. Blog URL
2. One-line situation or need
3. Two or three selection points
4. Price-change or affiliate disclosure when applicable

## Production Flow

1. Select a product whose identity, photo, attributes, and current price band have been verified.
2. Define the relevant lifestyle setting and HANA's action.
3. Generate the lifestyle image using the approved HANA reference.
4. Review the generated image for identity consistency, anatomy, product mismatch, and misleading text or logos.
5. Combine the approved lifestyle image with the real product photo and verified copy.
6. Preview the three cards at desktop and mobile widths.
7. Confirm the blog URL is the first line of the queued Facebook message.
8. Publish only after the checklist passes.

If image generation produces an unusable hand, face, or product, regenerate the scene. If repeated attempts cannot preserve the exact product, use a category-level lifestyle scene with no readable brand detail and retain the real product image as the sole product proof.

## Validation Checklist

- HANA's identity and styling are consistent with the approved reference.
- Hands, face, pose, and body proportions contain no obvious generation errors.
- The generated product does not materially contradict the real product.
- The real product photo, product name, and attributes match the selected item.
- `AI 연출 이미지` is legible and survives the mobile crop.
- Price language is dated or expressed as a changeable price band.
- Copy does not imply a real review, customer identity, or celebrity endorsement.
- The blog URL is the first line of the Facebook message.
- Face, product, headline, and call to action remain visible in the Facebook preview.

## Pilot and Success Criteria

Create one laptop post as the pilot before applying this format to other categories. Compare it with the current product-first format where practical.

The pilot is successful when:

- all validation checks pass;
- the mobile preview remains clear and attractive;
- the user approves HANA's identity consistency and product presentation;
- the format can be reproduced for a second category without redefining the character.

Facebook engagement and link-click data may guide later refinements, but analytics automation and broad reposting are outside this first pilot's scope.

## Scope

The first implementation produces the reusable HANA identity reference, one laptop lifestyle image, and one three-card pilot post. It does not automatically publish or replace existing Facebook posts without a separate explicit publishing decision.
