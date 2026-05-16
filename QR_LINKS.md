# Indoor Navigation - QR Code & Link Guide

This guide explains how to generate dynamic links for the Indoor Navigation system. These links can be embedded in QR codes to provide contextual navigation for users.

## URL Base Format
The standard URL for a floor viewer is:
`https://domain.com/viewer/[FloorID]`

Where `[FloorID]` follows the format: `B[BuildingID]-F[Level]` (e.g., `0-F0`).

---

## Navigation Scenarios

### 1. Simple Location Marker (You Are Here)
Use this when you want to show the user where they are on the map without a specific destination selected.
**Format:** `/viewer/[FloorID]?from=[NodeID]`
**Example:** `/viewer/0-F0?from=0-F0-12`
**Result:** The map opens on Floor 0, and node `0-F0-12` is pre-selected in the "FROM" field. The map marker 'A' is shown at this position.

### 2. Destination Only (Go Here)
Use this to suggest a destination, but let the user decide their starting point.
**Format:** `/viewer/[FloorID]?to=[NodeID]`
**Example:** `/viewer/0-F0?to=0-F0-42`
**Result:** The map opens on Floor 0, and node `0-F0-42` is pre-selected in the "TO" field.

### 3. Full Navigation (From A to B)
Use this for a complete path from a fixed starting point (like a physical QR code location) to a specific room or point of interest.
**Format:** `/viewer/[FloorID]?from=[StartNodeID]&to=[EndNodeID]`
**Example:** `/viewer/0-F0?from=0-F0-1&to=0-F0-37`
**Result:** The system automatically calculates the path, draws the line on the map, and places markers 'A' and 'B'. The user doesn't need to click anything.

---

## Technical Details

- **Node IDs:** You can find Node IDs (QR IDs) in the Admin Panel Map Editor. They usually look like `0-F0-5`.
- **Cross-floor Navigation:** If the `from` and `to` nodes are on different floors, the system will start on the floor of the `from` node and guide the user through connectors (stairs/elevators).
- **Auto-Sync:** When a user manually selects points and clicks "NAWIGUJ", the browser URL is updated automatically. You can copy this URL directly to create a QR code for that specific path.
- **Validation:** If the `from` and `to` IDs are identical, the system will ignore the navigation request to prevent errors.
