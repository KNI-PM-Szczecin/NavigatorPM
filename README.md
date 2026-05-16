# NavigatorPM - Indoor Navigation System

NavigatorPM is a high-performance, responsive web application built with **Next.js (App Router)** and **React**. It provides a comprehensive solution for indoor navigation, allowing administrators to manage multiple buildings, design interactive floor plans, and provide users with real-time pathfinding.

## 🚀 Key Features

- **Multi-Building Support**: Hierarchical data structure (`Buildings` -> `Floors` -> `Nodes`).
- **Interactive Map Editor**: An admin-only interface to upload SVG maps and position navigation nodes directly on the floor plan.
- **Advanced Pathfinding**: Supports **A*** and **Dijkstra** algorithms with dynamic switching.
- **Contextual QR Navigation**: Generate intuitive QR codes (e.g., `B1-F0-42`) that instantly load the correct floor and navigation path.
- **Mobile-First Design**: Fully optimized for mobile devices with a slide-out navigation panel and touch-friendly map controls.
- **Internationalization (i18n)**: Built-in support for multiple languages for all entity metadata (names, descriptions, short names).
- **Dynamic POIs**: Render points of interest using SVG masks, allowing flexible CSS-based coloring from the admin panel.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript
- **Database**: SQLite (Better-SQLite3)
- **Styling**: Vanilla CSS (Modern CSS variables)
- **Algorithms**: Custom implementations of A*, Dijkstra, BFS, and Greedy Search.

## 📂 Project Structure

- `/src/app`: Next.js App Router (Public and Admin routes)
- `/src/components`: React components (Viewer, Admin Editor, UI)
- `/src/lib/algorithms`: Pathfinding implementations and registry
- `/src/locales`: JSON translation files
- `/data`: (Ignored) Local storage for building manifests and node configurations
- `/navigator.db`: (Ignored) SQLite database for sessions and translations

## ⚙️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Admin Access**:
   Navigate to `/admin-portal-721`.
   Default credentials: `admin` / `admin123`.

## 📍 QR Link Integration

For detailed instructions on how to use the URL-based navigation system and generate QR codes for specific routes or locations, please refer to [QR_LINKS.md](./QR_LINKS.md).
