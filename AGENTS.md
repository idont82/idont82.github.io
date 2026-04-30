# Repository Guidelines

## Project Structure & Module Organization
This repository is a static site with a small local Node server. Root pages such as `index.html`, `claw-machine.html`, `claw-machine-guide.html`, `claw-machine.css`, and `claw-machine.js` contain the main app and the standalone 3D claw game. Area and page data live in `data/`, including `areas.json` and per-area files such as `data/hongdae.json`. Search landing pages are under `search/`, shared search styling is in `search/assets/`, and images are stored in `images/`. Planning and design notes are kept in `docs/superpowers/`.

## Build, Test, and Development Commands
There is no build step, bundler, or package manager.

- `node server.js`: start the local static server at `http://localhost:3000`
- `start_server.bat`: Windows shortcut for starting the server
- `stop_server.bat`: stop the local server on port `3000`
- `git status`: review pending changes before editing or opening a PR

## Coding Style & Naming Conventions
Use vanilla HTML, CSS, and JavaScript only. Match the existing style: 2-space indentation in HTML/CSS/JS, semicolons in JavaScript, and concise inline comments only where logic is non-obvious. Keep filenames lowercase with hyphens for pages and assets, for example `search/air-purifier-budget-top3.html`. Use descriptive JSON ids that align with filenames, such as `hongdae` -> `data/hongdae.json`.

## Testing Guidelines
This repo does not use an automated test framework. Verify changes by running `node server.js` and checking the affected page in a browser. For content pages, confirm links, images, metadata, and layout at desktop and mobile widths. When working on structured search pages, reuse existing check artifacts in `data/search-page-checks/` and keep required text markers aligned with the final HTML.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:`, `fix:`, and `docs:`. Keep commit subjects short and imperative, for example `feat: add jongro area data`. Pull requests should include a brief summary, the pages or data files changed, linked issues if any, and screenshots for visible UI updates. Call out SEO, metadata, or content changes explicitly when they affect published pages.

## Content & Configuration Notes
Preserve Korean UI copy unless the task requires translation. Keep CDN references stable, especially the pinned Three.js import in `claw-machine.html`. For new areas, update `data/areas.json` and add the matching `data/<id>.json` file together so the UI can discover the content correctly.
