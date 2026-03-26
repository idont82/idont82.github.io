# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Seoul Claw Machine Sanctuary Guide — a vanilla web app combining a location guide for Seoul's best claw machine spots with an interactive 3D claw machine game built on Three.js.

## Running Locally

```bash
node server.js          # Serves on http://localhost:3000
# Windows: start_server.bat / stop_server.bat
```

No build step, no package manager, no bundler. Static files served directly. Deployed via GitHub Pages.

## Architecture

**Guide SPA (`index.html`):** Hash-based router (`location.hash`) switches between area list and detail views. Data fetched from `data/areas.json` (master registry) and `data/{area_id}.json` (per-area details). All rendering is inline JS with template literals.

**3D Game (`claw-machine.html` + `claw-machine.js`):** Standalone page using Three.js (CDN). Finite state machine: IDLE → MOVING → DROPPING → GRABBING → RISING → RETURNING → RESULT. Custom pendulum physics and collision detection. Characters are procedurally generated from Three.js primitives (no external 3D models). Game state persisted to localStorage.

**Key game constants** are at the top of `claw-machine.js` (crane speed, grab probability, pendulum damping, etc.).

## Adding New Areas

1. Add entry to `data/areas.json` (id, name, emoji, station, exit, summary, spotCount, tags)
2. Create `data/{id}.json` following the schema in `hongdae.json`
3. UI auto-detects; `spotCount: 0` triggers "Coming Soon" state

## Conventions

- Vanilla stack only: no frameworks, no TypeScript, no npm dependencies
- Three.js loaded via CDN (jsdelivr), version 0.162.0
- Dark mode "Cyberpunk/Arcade" aesthetic throughout
- Responsive via vanilla CSS with `clamp()`, Flexbox, and Grid
- Korean language UI with inline Korean strings
