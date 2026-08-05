# 🗺️ NavigatorPM - Indoor Navigation System

An indoor navigation system designed for university students and staff. It works like "Google Maps for inside buildings".

The project was designed for maximum performance and minimal maintenance costs – it utilizes a stateless architecture based on in-memory data, and all the heavy routing math is executed directly on the user's smartphone.

## ✨ Key Features

- 🚀 **Blazing Fast (Zero Latency):** No traditional database. The entire university map is loaded into the server's RAM from a JSON file, reducing API response times to fractions of a millisecond.
- 🧠 **Client-Side Routing:** An advanced Dijkstra algorithm runs directly in the browser of the user's device (Smartphone).
- ♿ **Accessibility Mode:** Ability to calculate routes that bypass stairs (tailored for people with mobility impairments, e.g., wheelchair users).
- 📱 **QR Code Recognition:** The user scans a QR code in the hallway, and the app instantly knows their exact location and loads the corresponding floor map.
- 🌍 **Multilingual (i18n):** Automatically serves room names and descriptions in Polish, English, or Ukrainian based on the user's browser settings.
- 🗺️ **Multi-floor Support:** Seamless route transitions between different building levels with automatic background SVG map switching.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** None! (The system relies on a `.json` file and in-memory Hash Maps on the server)
- **Maps:** Clean `.svg` files rendered on the frontend.

## 🚀 Running Locally

Thanks to the removal of heavy database dependencies (SQL), running the project is incredibly simple and requires no Docker configuration or environment variables.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KNI-PM-Szczecin/NavigatorPM
   cd navigatorPM
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## 📂 Data Structure & API

The main "data engine" in the application is a static file that feeds the API endpoints.

- `src/data/map.json` - The Single Source of Truth. Contains all nodes, edges, buildings, and translations.
- `src/data/mapStore.ts` - The initialization file that reads the JSON and creates blazing-fast indexes (O(1) dictionaries) for the API.
- `public/maps/` - Directory containing graphical map files (e.g., `floor_0.svg`).

### Available API Endpoints

| Method  | Endpoint         | Description                                                                                                   |
| :-----: | :--------------- | :------------------------------------------------------------------------------------------------------------ |
| **GET** | `/api/qr/[id]`   | Returns starting location data after a QR code scan (incl. `nodeId`, `floorId`, `buildingId`, `mapImageUrl`). |
| **GET** | `/api/buildings` | Returns a structured list of buildings and floors to build the UI menu (includes links to SVG maps).          |
| **GET** | `/api/pois`      | Returns a translated list of destinations for the search bar (Classrooms, Lecture Halls, Dean's Office).      |
| **GET** | `/api/map-data`  | Returns the full mathematical grid of nodes and edges (graph) used for local route calculation.               |
