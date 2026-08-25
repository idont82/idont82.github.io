# HANA Cafe Off-Shoulder A2 Design

**Date:** 2026-08-25
**Status:** Approved design, awaiting written-spec review
**Scope:** One HANA cafe lifestyle source and the derived first Facebook pilot card

## Goal

Make the existing fictional adult HANA laptop scene feel more glamorous and attractive while keeping the cafe setting, laptop-use credibility, brand trust, and Facebook card layout intact.

The chosen direction is **A2: balanced off-shoulder styling**. It should create a visible upgrade through shoulder and collarbone framing, fitted clothing, confident gaze, and polished lighting rather than through a low neckline or sexualized pose.

## Selected Direction and Alternatives

- **A1, subtle one-shoulder:** safest for advertising but too small a change for the requested mood.
- **A2, balanced two-shoulder:** selected. Both shoulders and collarbones are visible in a fitted, secure cafe-appropriate top. This provides the best balance of appeal, credibility, and generation stability.
- **A3, near-strapless:** rejected. It would pull the image toward eventwear, conflict with the laptop-cafe context, and increase moderation and advertising-trust risk.

## Identity and Reference Handling

HANA remains a fictional adult brand model. Preserve her established face, apparent late-twenties age, skin tone, long dark-brown hair, makeup, and recognizable warm expression.

The user-provided event photograph is a mood reference only. Do not pass it to image generation as an identity reference and do not reproduce the real person's facial geometry, hairstyle, jewelry, dress decoration, stage background, logo, or celebrity likeness. Translate only these abstract cues into the HANA scene:

- clean two-shoulder and collarbone framing;
- a polished, confident gaze;
- refined upper-body presentation;
- a subtle warm editorial highlight.

The existing tracked `hana-reference.png` remains the sole identity/body anchor and is not modified in this iteration.

## Scene and Outfit Design

Modify only `images/facebook-fictional-model/hana-laptop-document-scene.png`.

Preserve:

- the bright, quiet cafe;
- the elevated three-quarter camera angle;
- the beige chair behind HANA;
- the generic silver laptop;
- natural two-hand laptop interaction;
- the light-wood table and clean lower panel area;
- HANA's balanced-curvy silhouette and non-sexual working posture.

Replace the current cardigan and V-neck blouse with a fitted matte cream bardot/off-shoulder top suitable for a polished cafe editorial. Both shoulders and collarbones are clearly visible. The upper edge is secure, opaque, and high enough to remain professional; it must not resemble lingerie, a corset, or a near-strapless event dress. Fabric tension, seams, shoulders, arms, and torso must remain anatomically coherent.

HANA may turn her face slightly toward the camera with calm, confident eye contact and a restrained warm smile. Her hands must continue to perform a believable laptop action. The pose must not become suggestive or interfere with the product-use story.

## Card Composition

The source image remains approximately vertical 4:5. HANA's complete face, exposed shoulders, hands, wrists, laptop screen, and keyboard stay within the upper 60 percent of the source. The lower 40 percent remains expendable, uncluttered tabletop for the renderer's opaque information panel.

Rerender the existing pilot without changing its JSON, copy, tracked link, product, date, price, disclosure, or card templates. Only card 1 should change visually. Cards 2 and 3 must remain byte-identical to their current approved outputs.

Current comparison hashes:

- cafe source before this iteration: `A92F78C4457E1F49F6C238082B4835FE223F226BD3BCCE4E626804BF383D44D9`;
- card 1 before this iteration: `30DBE578E0ED4A7EA4D3B11DEE78E90E2F4BAB003E931C929222E57223FDE180`;
- unchanged card 2: `7A07571F453620E9985B09C626137865FDF36C2E98865D6EFEE1EDFAF954C389`;
- unchanged card 3: `BCF9C4B8FF4E92D102BCDB7964C7F4170A85DF9E4242D6FF5BCFE4BFD4B42215`.

## Safety and Generation Constraints

- fictional adult only;
- preserve HANA identity; no real-person or celebrity resemblance;
- opaque, securely fitted clothing;
- no deep neckline, lingerie styling, transparency, breast exposure, wardrobe malfunction, or sexualized pose;
- no new jewelry, logo, text, watermark, readable laptop UI, or event-stage background;
- no anatomy, finger, chair, laptop, or fabric artifacts.

Use the built-in image editor with the canonical HANA reference and current cafe scene. If moderation blocks the first request, retry once with more conservative professional-fashion wording while preserving the same approved visual target. If the second request is also blocked, stop without switching to CLI or changing the safety boundary.

## Data Flow and Repository Scope

1. Inspect the canonical HANA reference and current cafe scene at original detail.
2. Edit only the cafe source image with identity and composition invariants locked.
3. Validate PNG format, dimensions, aspect ratio, and visual acceptance criteria.
4. Commit only the cafe scene using a path-scoped commit.
5. Rerender `.facebook-artifacts/hana-laptop-pilot/01.png` through `03.png` using the unchanged pilot JSON.
6. Compare hashes, inspect all cards, and run the existing scoped Facebook renderer/publisher tests.

The repository is already on a divergent, dirty `main` checkout by explicit prior user choice. Preserve every unrelated staged, modified, and untracked file. Do not sync, merge, push, or perform a broad commit.

## Acceptance Criteria

- HANA is immediately recognizable as the same fictional person.
- The two-shoulder off-shoulder styling is visibly more glamorous than the current V-neck/cardigan outfit.
- Both shoulders and collarbones read clearly at Facebook mobile size.
- The top remains secure, opaque, cafe-appropriate, and less revealing than the rejected A3 direction.
- The balanced-curvy silhouette remains coherent and is not exaggerated in one isolated area.
- Face, hands, laptop, and chair contain no material generation defect.
- All key image content stays above the 60 percent renderer boundary; the lower 40 percent remains clean tabletop.
- Card 1 preserves the AI disclosure, headline, product panel, date, counter, and safe margins.
- Card 1 differs from `30DBE578E0ED4A7EA4D3B11DEE78E90E2F4BAB003E931C929222E57223FDE180`.
- Cards 2 and 3 retain the exact SHA-256 hashes recorded above.
- The exact five-file scoped Node test suite passes with zero failures.
- The pilot remains `status: "draft"`, `publish: false`, link-first, and absent from every queue and publisher default.
- No `.facebook-artifacts/meta.env` read and no Facebook API or publication action occurs.

## Out of Scope

- changing `hana-reference.png`;
- changing cards 2 or 3;
- changing blog content, product selection, price, link, caption, disclosure, renderer code, queue, or publisher;
- imitating the real person in the reference photograph;
- publishing, scheduling, integrating with `origin/main`, or pushing.
