# NavigatorPM — Client Frontend Design Specification

Dokument definiuje architekturę wizualną, system projektowy (Design System) oraz interfejs klienta w aplikacji **NavigatorPM**.
Celem jest zapewnienie pełnej spójności wizualnej i doświadczenia użytkownika z aplikacją **PlanPM** (stylistyka **Liquid Glass** / **iOS Human Interface Guidelines**) oraz wyeliminowanie przypadkowości projektowej („anti vibe-coding”).

---

## 1. Filozofia i Wytyczne Wizualne (Design System)

### 1.1. Spójność Ekosystemu PM (NavigatorPM × PlanPM)
- **Ciągłość doświadczenia:** Student przechodzący z aplikacji PlanPM (np. klikając w planie na salę `WChrobrego 19` → „Pokaż na mapie”) musi natychmiast rozpoznać ten sam język wizualny.
- **Inspiracja iOS Human Interface Guidelines (HIG):** Płynne mikromomentum, zaokrąglenia typu squircle, warstwowość głębi (depth layers), haptyka/dotyk (`active:scale-[0.98]`).
- **Anty-vibe-coding:** Wyeliminowanie losowych bibliotek, niespójnych gradientów i przypadkowych wysokości (`33dvh`). Zamiast tego: przewidywalna maszyna stanów panelu dolnego (BottomSheet), spójne tokeny CSS i ergonomia dostosowana do obsługi jedną ręką na smartfonie.

---

### 1.2. Tokeny Kolorystyczne (Color Tokens)
Spójne z paletą barw zdefiniowaną w PlanPM (`plan_pm/global/theme/colors.dart`):

| Token semantyczny | Wartość Dark Mode | Wartość Light Mode | Przeznaczenie |
|---|---|---|---|
| `--bg-base` | `#000000` (Pitch Black OLED) | `#F7F8FA` (Warm Light) | Główne tło ekranu / mapy |
| `--surface` | `#1C1C1C` | `#FFFFFF` | Panele, tło kart, modal |
| `--surface-elevated` | `#2C2C2C` | `#F2F2F7` (System Gray 6) | Elementy wyniesione, kontrolki |
| `--primary` | `#409CFF` (iOS Blue) | `#0884FF` (PM Royal Blue) | Główny kolor akcentu, aktywna trasa, aktywne piętro |
| `--on-primary` | `#FFFFFF` | `#FFFFFF` | Tekst na akcentach |
| `--outline` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.06)` | Dyskretne ramki hairline (1px) |
| `--outline-strong` | `rgba(255, 255, 255, 0.16)` | `rgba(0, 0, 0, 0.12)` | Ramki aktywnych kontrolek i pól |
| `--text-primary` | `#F5F5F7` | `#1C1C1E` | Główny tekst, nagłówki |
| `--text-secondary` | `rgba(255, 255, 255, 0.60)` | `rgba(0, 0, 0, 0.55)` | Pomocnicze etykiety, subtelne podpisy |
| `--accent-success` | `#30D158` (iOS Green) | `#34C759` | Wejścia, start trasy, statusy |
| `--accent-destructive`| `#FF453A` (iOS Red) | `#FF3B30` | Punkt docelowy, anulowanie nawigacji |
| `--accent-warning` | `#FF9F0A` (iOS Orange) | `#FF9500` | Ostrzeżenia, schody, remonty |

---

### 1.3. Specyfikacja Liquid Glass (Frosted Glassmorphism)
Pływające kontrolki nad mapą wykorzystują ujednoliconą formułę szkła:
- **Rozmycie tła:** `backdrop-blur-2xl` (`backdrop-filter: blur(20px) saturate(180%)`).
- **Wypełnienie (Tint):**
  - Dark: `rgba(28, 28, 28, 0.72)` z gradientem rozświetlenia od góry `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)`.
  - Light: `rgba(255, 255, 255, 0.78)`.
- **Obramowanie:** `border: 1px solid var(--outline)` z opcjonalnym subtelnym wewnętrznym blaskiem (`inset 0 1px 0 0 rgba(255,255,255,0.12)`).
- **Cień:** `shadow-[0_8px_32px_rgba(0,0,0,0.36)]`.

---

### 1.4. Typografia i Hierarchia
Wzorem iOS HIG Dynamic Type z PlanPM:
- **Large Title:** `text-2xl font-bold tracking-tight` (ekrany powitalne, nazwa budynku w trybie rozszerzonym).
- **Headline / Title:** `text-base font-semibold tracking-normal` (nazwy sal, wybrane cele).
- **Body:** `text-sm font-normal text-text-primary` (kroki nawigacji, opisy).
- **Subhead / Footnote:** `text-xs font-medium text-text-secondary` (odległość, piętro, czas).
- **Section Headers (iOS Inset Style):** `text-[11px] font-semibold uppercase tracking-wider text-text-secondary px-3 py-1`.

---

## 2. Architektura Widoku i Komponentów

```
┌─────────────────────────────────────────────────────────────┐
│  [Top Glass Bar]  🏛️ Wały Chrobrego ▾      ♿ [PL] [🌙]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      MAPA (Full Bleed 100dvh)               │
│                                                             │
│   🔵 Pozycja użytkownika (Wejście Główne)                   │
│       │                                     ┌── [Piętra] ──┐│
│       └────► 🚶 Trasa SVG                   │    [ 2 ]     ││
│                  │                          │   •[ 1 ]🎯   ││  <- Piętro z celem
│                  ▼                          │    [ 0 ]     ││
│             🔴 Sala 102                     └──────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ▲ [Liquid Glass Bottom Sheet]                              │
│  Stan spoczynkowy: [ 🔍 Dokąd zmierzasz? ] + Pigułki filtrów│
│  Stan nawigacji:   🎯 Sala 102 • 2 min (45m) • Piętro 1     │
│                    [ Pokaż trasę / Krok po kroku ] [ X ]    │
└─────────────────────────────────────────────────────────────┘
```

### 2.1. Warstwa 0: Pełnoekranowy Canvas Mapy (`BuildingMap`)
- **Pełne pokrycie:** 100% szerokości i wysokości ekranu (`w-screen h-dvh`). Brak sztucznego odcinania do `67dvh`.
- **Obsługa gestów:** Płynny zoom, panowanie (`react-zoom-pan-pinch`), blokada kolizji dotyku z wysuwanym panelem dolnym.
- **Wizualizacja elementów trasy:**
  - **Origin (Punkt Startowy):** Pulsująca błękitna kropka (`#0884FF`) z gradientowym radarem.
  - **Destination (Punkt Docelowy):** Pin w stylu iOS z czerwoną główką i kontrastową białą obwódką.
  - **Ścieżka SVG:** Płynna linia (`stroke-width: 4px`, `stroke-linecap: round`, `stroke-linejoin: round`) z subtelnym pulsującym efektem kierunku (`stroke-dasharray`).
  - **Znaczniki Przejść Pięter:** Dedykowane ikony schodów i windy w miejscach przeskoku kondygnacji.

---

### 2.2. Warstwa 1: Pływający Top Bar (`FloatingHeader`)
- **Położenie:** `fixed top-0 inset-x-0 pt-[env(safe-area-inset-top)] p-3 pointer-events-none z-40`.
- **Elementy interfejsu (pointer-events-auto):**
  - **Selektor Budynku (Pill):** Kompaktowa kapsuła Liquid Glass z nazwą aktualnego budynku (np. *Wały Chrobrego 1-2*) z możliwością rozwinięcia listy innych obiektów kampusu.
  - **Szybkie akcje po prawej stronie:**
    - ♿ **Tryb bez barier (Accessibility):** Jeden klik przełącza trasę na wariant bez schodów (windy zamiast klatek schodowych).
    - 🌐 **Przełącznik Języka:** Pigułka `PL` / `EN` / `UK`.
    - 🌗 **Przełącznik Motywu:** Płynne przejście Jasny / Ciemny (Next-themes).

---

### 2.3. Warstwa 2: Pionowy Selektor Pięter (`FloorRail`)
- **Położenie:** Prawa krawędź ekranu (`fixed right-3 top-1/2 -translate-y-1/2 z-40`).
- **Ergonomia:** Zoptymalizowany pod obsługę kciukiem na smartfonie.
- **Konstrukcja:**
  - Pionowa kapsuła Liquid Glass (`rounded-full p-1.5 flex flex-col gap-1.5`).
  - Przyciski poziomów (np. `2`, `1`, `0`, `-1`).
  - **Aktywne piętro:** Wypełnienie `--primary` z białym kontrastowym tekstem.
  - **Wskaźnik celu:** Dyskretna czerwona lub pomarańczowa kropka przy numerze piętra, na którym znajduje się cel podróży.
  - **Automatyczny przeskok:** Przeglądanie trasy wielopiętrowej automatycznie akcentuje piętro z aktualnym segmentem trasy.

---

### 2.4. Warstwa 3: Dolny Arkusz Nawigacyjny (`NavigationSheet`)
Ergonomiczny panel sterowania nawigacją o 3 określonych stanach:

#### Stan 1: Podgląd (Peek / Spoczynek)
- Wysokość: ~120px ponad bezpieczną strefą dolną (`env(safe-area-inset-bottom)`).
- Zawartość:
  - Uchwyt do wysuwania (Home Indicator bar).
  - Pasek wyszukiwania: `[ 🔍 Szukaj sali, dziekanatu, toalety... ]`.
  - Poziomy pasek pigułek szybkiego wyboru:
    - 🚪 `Sale`
    - 🏛️ `Dziekanat`
    - 🚻 `Toalety`
    - 🛗 `Windy`
    - ☕ `Bufet`

#### Stan 2: Wyszukiwanie (Expanded)
- Wysokość: 85% ekranu lub pełny ekran z animacją iOS Sheet.
- Zawartość:
  - Podwójne pole wejściowe:
    - **Skąd:** Domyślnie uzupełnione na podstawie zeskanowanego QR kodu lub najbliższego wejścia z możliwością zmiany.
    - **Dokąd:** Pole z autofokusem i natychmiastowym filtrowaniem.
  - Przycisk skanera QR kodu (uruchomienie kamery na korytarzu).
  - Ostatnio wyszukiwane cele (zapisywane lokalnie w `localStorage`).
  - Kategoryzowane wyniki z etykietami pięter i budynków (np. *„Sala 102 • Piętro 1 • Instytut Informatyki”*).

#### Stan 3: Aktywna Nawigacja (Active Route)
- Wysuwana karta trasy po zatwierdzeniu celu:
  - **Nagłówek celu:** Nazwa sali + ikona kategorii + badge poziomu.
  - **Pasek podsumowania:** Czas przejścia (np. *~2 min*), dystans (*~45 m*), rodzaj podejścia (*Winda / Schody*).
  - **Wskazówki krok po kroku (Turn-by-turn guidance):**
    1. *Wejście Główne (Poziom 0)*
    2. *Idź korytarzem 20 m do klatki B / windy*
    3. *Wjedź na Poziom 1*
    4. *Skręć w prawo — Sala 102 jest po lewej stronie*
  - **Przycisk zmiany piętra:** Szybki przycisk „Przejdź na widok Piętra 1”.
  - **Przycisk zakończenia nawigacji:** Dyskretny przycisk `Zakończ` czyszczący parametry trasy w URL.

---

## 3. Scenariusze Użytkownika (User Journeys)

1. **Skan kodu QR na korytarzu (Kluczowy scenariusz):**
   - Użytkownik skanuje kod QR naklejony przy wejściu lub na korytarzu (`/?from=qr_entry_1`).
   - Aplikacja centruje mapę na punkcie startowym z animacją przybliżenia.
   - Wyświetla się kontekstowa kapsuła: *„Jesteś przy: Wejście Główne (Poziom 0)”*.
   - Kursor automatycznie trafia do pola „Dokąd zmierzasz?”.

2. **Przejście z aplikacji PlanPM (Integracja Deeplink):**
   - Student klika w aplikacji PlanPM salę z planu zajęć (`navigator.pm.szczecin.pl/?to=room_102`).
   - NavigatorPM otwiera widok z zaznaczonym celem (*Sala 102*).
   - Dolny arkusz pyta: *„Skąd wyruszasz?”* z sugerowanymi głównymi wejściami do budynku lub przyciskiem skanowania QR.

3. **Nawigacja bez barier architektonicznych:**
   - Osoba na wózku lub z ciężkim bagażem włącza ikonę ♿ w górnym pasku.
   - Algorytm Dijkstry automatycznie przekazuje flagę `avoidStairs = true`.
   - Trasa omija klatki schodowe i kieruje bezpośrednio do najbliższej windy.

---

## 4. Plan Wdrożenia Komponentów (Implementation Roadmap)

1. **Etap 1: Warstwa Tokenów i Stylów Bazowych**
   - Konfiguracja motywu Tailwind v4 dla palety PlanPM (Pitch Black, Surface, PM Blue).
   - Uniwersalny komponent `LiquidGlassCard` z obsługą bezpiecznych stref (`safe-area-inset`).
2. **Etap 2: Komponenty Otoczenia Mapy**
   - Implementacja `FloatingHeader` (Budynek, Język, Dostępność ♿, Motyw).
   - Implementacja `FloorRail` z indykacją aktywnego piętra i celu.
3. **Etap 3: Interaktywny `NavigationSheet`**
   - Obsługa stanów Peek, Expanded i Active Route.
   - Wyszukiwarka sal i kategoryzowane podpowiedzi (POI).
4. **Etap 4: Dopracowanie Canvasu Mapy i Nawigacji Krok po Kroku**
   - Płynne markery SVG, animacja linii trasy.
   - Generator wskazówek tekstowych na podstawie węzłów trasy.
