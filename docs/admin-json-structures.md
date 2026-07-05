# Struktury JSON — Panel Administracyjny

Dokument opisuje wszystkie struktury danych przepływające przez panel admina: payloady Server Actions, odpowiedzi API, struktury kolumn JSON w bazie oraz stany komponentów.

---

## Typy bazowe (src/types/manifest.ts)

### `BuildingManifest`

```typescript
interface BuildingManifest {
  id: string;
  name: string;
  description: string;
  address: string;
  isVisible?: boolean;
}
```

```json
{
  "id": "pierce-tower",
  "name": "Pierce Tower",
  "description": "Główna siedziba firmy",
  "address": "ul. Przykładowa 1, Warszawa",
  "isVisible": true
}
```

Produkowane przez `data.ts:rowToBuilding()` (z bazy) i formularze w `BuildingsClient.tsx`.

---

### `FloorManifest`

```typescript
interface FloorManifest {
  id: string;
  buildingId: string;
  level: number;
  name: string;
  svgMapUrl: string;
  isVisible?: boolean;
}
```

```json
{
  "id": "pierce-tower-F2",
  "buildingId": "pierce-tower",
  "level": 2,
  "name": "Piętro 2",
  "svgMapUrl": "/api/map/pierce-tower-F2",
  "isVisible": true
}
```

Produkowane przez `data.ts:rowToFloor()`.

---

### `NavigationNode`

Główna encja mapy. Każdy węzeł to punkt na mapie (sala, POI, konektor, itp.).

```typescript
interface NavigationNode {
  qrId: string;
  floorId: string;
  x: number;         // współrzędna w % szerokości SVG
  y: number;         // współrzędna w % wysokości SVG
  type: 'invisible' | 'poi' | 'room' | 'location' | 'connector';
  connections: string[];  // tablica qrId połączonych węzłów
  name?: string;
  shortName?: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  isNavigable?: boolean;
  translations?: Record<string, Record<string, string>>;
}
```

```json
{
  "qrId": "pierce-tower-F2-1",
  "floorId": "pierce-tower-F2",
  "x": 45.5,
  "y": 32.3,
  "type": "poi",
  "connections": ["pierce-tower-F2-2", "pierce-tower-F3-5"],
  "name": "Sala konferencyjna A",
  "shortName": "Konf A",
  "description": "Duża sala z wyposażeniem AV",
  "iconName": "conference",
  "iconColor": "#0070f3",
  "isNavigable": true,
  "translations": {
    "en-US": {
      "name": "Conference Room A",
      "shortName": "Conf A",
      "description": "Large conference room with AV setup"
    }
  }
}
```

---

## Kolumna `connections` w bazie danych

Pole `connections` w tabeli `nodes` jest przechowywane jako JSON string (typ `TEXT`).

**W bazie:**
```
'["pierce-tower-F2-2","pierce-tower-F3-5"]'
```

**Serializacja** (`data.ts:saveNodes`):
```typescript
JSON.stringify(node.connections ?? [])
```

**Deserializacja** (`data.ts:rowToNode`):
```typescript
JSON.parse(row.connections ?? '[]')
```

Połączenia między piętrowymi węzłami są zawsze dwustronne — `saveNodesAction` zapisuje referencję po obu stronach.

---

## Server Actions (src/lib/actions.ts)

### `saveNodesAction(floorId, nodes)`

Przyjmuje pełną tablicę węzłów dla danego piętra i nadpisuje poprzedni stan (delete + insert w transakcji).

```typescript
saveNodesAction(floorId: string, nodes: NavigationNode[])
```

**Payload (nodes):**
```json
[
  {
    "qrId": "pierce-tower-F2-1",
    "floorId": "pierce-tower-F2",
    "x": 45.5,
    "y": 32.3,
    "type": "poi",
    "connections": ["pierce-tower-F2-2"],
    "name": "Recepcja"
  },
  {
    "qrId": "pierce-tower-F2-2",
    "floorId": "pierce-tower-F2",
    "x": 60.0,
    "y": 40.0,
    "type": "room",
    "connections": ["pierce-tower-F2-1"],
    "name": "Sala 101"
  }
]
```

---

### `addBuildingAction(formData)` / `saveBuildingAction(formData)`

FormData z pól formularza:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `string` | Unikalny identyfikator (tylko przy create) |
| `name` | `string` | Wyświetlana nazwa |
| `description` | `string` | Opcjonalny opis |
| `address` | `string` | Adres budynku |
| `isVisible` | `'true' \| 'false'` | Czy widoczny publicznie |

---

### `addFloorAction(buildingId, formData)` / `updateFloorAction(floorId, formData)`

**Create — FormData:**

| Pole | Typ | Opis |
|------|-----|------|
| `level` | `string` (liczba) | Numer piętra |
| `name` | `string` | Nazwa piętra |

**Update — FormData:**

| Pole | Typ | Opis |
|------|-----|------|
| `svgFile` | `File` | Plik SVG mapy (opcjonalny) |
| `svgUrl` | `string` | URL zewnętrzny SVG (opcjonalny) |
| `isVisible` | `'true' \| 'false'` | Widoczność |

---

### `saveTranslation(entityType, entityId, locale, fieldName, translation)`

```typescript
saveTranslation(
  entityType: 'building' | 'floor' | 'node',
  entityId: string,
  locale: string,       // np. 'en-US', 'de-DE'
  fieldName: string,    // 'name' | 'shortName' | 'description'
  translation: string
)
```

Schemat tabeli `translations`:

```sql
entity_type  TEXT  -- 'building' | 'floor' | 'node'
entity_id    TEXT  -- id encji (np. qrId węzła)
locale       TEXT  -- 'en-US', 'pl-PL', ...
field_name   TEXT  -- 'name' | 'shortName' | 'description'
translation  TEXT
```

---

### `cloneFloorData(sourceFloorId, targetFloorId, mode)`

```typescript
cloneFloorData(
  sourceFloorId: string,
  targetFloorId: string,
  mode: 'overwrite' | 'merge'
)
```

`overwrite` — usuwa wszystkie węzły na docelowym piętrze przed skopiowaniem.  
`merge` — dodaje węzły ze źródła, nie usuwając istniejących.

---

## API Routes

### `GET /api/building/[id]/nodes`

Odpowiedź łącząca piętra z węzłami i tłumaczeniami:

```json
{
  "floors": [
    {
      "id": "pierce-tower-F1",
      "level": 1,
      "name": "Parter",
      "svgMapUrl": "/api/map/pierce-tower-F1",
      "translations": {
        "en-US": "Ground Floor",
        "de-DE": "Erdgeschoss"
      }
    },
    {
      "id": "pierce-tower-F2",
      "level": 2,
      "name": "Piętro 2",
      "svgMapUrl": "/api/map/pierce-tower-F2",
      "translations": {}
    }
  ],
  "nodes": [
    {
      "qrId": "pierce-tower-F1-1",
      "floorId": "pierce-tower-F1",
      "x": 50.0,
      "y": 50.0,
      "type": "connector",
      "connections": ["pierce-tower-F2-1"],
      "name": "Winda",
      "translations": {
        "en-US": { "name": "Elevator" },
        "de-DE": { "name": "Aufzug" }
      }
    }
  ]
}
```

---

### `GET /api/map/[id]`

Zwraca surową zawartość SVG (`Content-Type: image/svg+xml`). Brak JSON — binarny blob z bazy (`svg_content` kolumna BLOB).

---

### `GET /api/locales/[code]`

Płaski słownik klucz-wartość dla tłumaczeń UI:

```json
{
  "ui.buildingsManagement": "Zarządzanie budynkami",
  "ui.addNewBuilding": "Dodaj nowy budynek",
  "ui.buildingId": "ID budynku",
  "ui.manageFloors": "Zarządzaj piętrami",
  "ui.delete": "Usuń",
  "ui.save": "Zapisz"
}
```

---

## Struktura danych edytora map (MapEditorClient)

### Stan węzłów w edytorze

Edytor przechowuje węzły w lokalnym stanie React jako `NavigationNode[]`. Przy zapisie cała tablica trafia do `saveNodesAction`.

### `crossFloorTargets` — dane do połączeń międzypiętrowych

Budowane po stronie serwera w `editor/[id]/page.tsx` i przekazywane jako prop do `MapEditorClient`. Zawiera wyłącznie węzły typu `connector` z innych pięter budynku:

```typescript
Record<string, {
  floorName: string;
  connectors: NavigationNode[];
}>
```

```json
{
  "pierce-tower-F3": {
    "floorName": "Piętro 3",
    "connectors": [
      {
        "qrId": "pierce-tower-F3-5",
        "floorId": "pierce-tower-F3",
        "x": 50.0,
        "y": 40.0,
        "type": "connector",
        "connections": ["pierce-tower-F2-1"],
        "name": "Winda"
      }
    ]
  }
}
```

Używane w edytorze do wyświetlenia listy dostępnych konektor-węzłów na innych piętrach, gdy użytkownik tworzy połączenie międzypiętrowe.

---

## Tłumaczenia encji — pełna struktura (w pamięci)

Na poziomie komponentów React tłumaczenia są reprezentowane jako:

```typescript
// Węzeł z tłumaczeniami wszystkich pól dla każdego locale
translations: Record<locale, Record<fieldName, string>>

// Piętro / budynek — jedno pole (name) dla każdego locale
translations: Record<locale, string>
```

Przykład węzła z pełnymi tłumaczeniami:

```json
{
  "translations": {
    "en-US": {
      "name": "Conference Room A",
      "shortName": "Conf A",
      "description": "Large room with AV"
    },
    "de-DE": {
      "name": "Konferenzraum A",
      "shortName": "Konf A",
      "description": "Großer Raum mit AV-Ausstattung"
    }
  }
}
```

Przykład tłumaczenia piętra (jedno pole):

```json
{
  "translations": {
    "en-US": "Second Floor",
    "de-DE": "Zweites Stockwerk"
  }
}
```
