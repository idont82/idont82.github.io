# 서울 인형뽑기 성지 가이드 (Seoul Claw Machine Sanctuary Guide)

## Project Overview
This project is a specialized web application designed for claw machine (doll-picking) enthusiasts in Seoul. It provides a comprehensive guide to the best claw machine locations (sanctuaries) in various districts, including detailed routes, maps, and spot recommendations. Additionally, it features a fully functional, interactive 3D claw machine simulation game.

### Main Technologies
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **3D Graphics:** [Three.js](https://threejs.org/) (used for the 3D claw machine game).
- **Backend:** Node.js (using the native `http` module for static serving).
- **Data Storage:** Static JSON files located in the `data/` directory.
- **Integration:** Includes Coupang Partners ad integration.

### Architecture
- **Single Page Application (SPA):** The main guide (`index.html`) uses a hash-based router (`location.hash`) to switch between the area list and detailed area views.
- **Standalone Game Component:** The 3D claw machine (`claw-machine.html`) operates as a standalone experience, linked from the main guide.
- **Data-Driven UI:** The application dynamically renders content by fetching metadata from `data/areas.json` and specific area details from individual `{area_id}.json` files.
- **Procedural 3D Modeling:** Characters and assets in the 3D game are procedurally generated using Three.js primitives to maintain a lightweight footprint.

---

## Directory Structure
- `index.html`: Main entry point and guide interface.
- `claw-machine.html`: The 3D claw machine game page.
- `claw-machine.js`: Core logic for the 3D game (physics, state machine, rendering).
- `claw-machine.css`: Styling for the 3D game UI.
- `server.js`: Simple Node.js server for local development and static file serving.
- `data/`:
    - `areas.json`: Master registry of all supported Seoul areas.
    - `{area_id}.json`: Detailed information (spots, routes, maps) for a specific area.
- `images/`: Static image assets (e.g., area maps).
- `start_server.bat` / `stop_server.bat`: Convenience scripts for managing the local server.

---

## Building and Running

### Prerequisites
- [Node.js](https://nodejs.org/) (recommended for `server.js`).

### Running the Project
1.  **Start the Server:**
    - Run `node server.js` in your terminal.
    - Alternatively, on Windows, double-click `start_server.bat`.
2.  **Access the App:**
    - Open your browser and navigate to `http://localhost:3000`.

### Stopping the Server
- Use `Ctrl+C` in the terminal.
- Alternatively, on Windows, run `stop_server.bat`.

---

## Development Conventions

### Adding New Areas
1.  **Register the Area:** Add a new entry to `data/areas.json` with the basic metadata (id, name, emoji, etc.).
2.  **Create Detail Data:** Create a new JSON file in `data/` named `{id}.json` following the established schema (see `hongdae.json` for reference).
3.  **UI Updates:** The UI will automatically detect the new area. If `spotCount` is 0, the card will appear in a "Coming Soon" state.

### 3D Game Logic (`claw-machine.js`)
- **State Management:** The game uses a finite state machine (`IDLE`, `MOVING`, `DROPPING`, `GRABBING`, etc.).
- **Physics:** Implements custom pendulum physics for the claw and collision detection for plushies.
- **Persistence:** High scores and collected items are saved to `localStorage`.

### Styling Standards
- **Global:** Uses a "Cyberpunk/Arcade" dark mode aesthetic.
- **CSS:** Prioritizes Vanilla CSS and Flexbox/Grid for responsiveness.
- **Responsive Design:** Uses `clamp()` and media queries to ensure compatibility across mobile and desktop.
