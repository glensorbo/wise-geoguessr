# 📄 Pages

One file per route. Pages are intentionally thin — they import and compose feature components, they do not own logic themselves.

| File                 | Route           | Content                                                                                                    |
| -------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `homePage.tsx`       | `/`             | Season Podium (top 3 by wins) + Last Round card                                                            |
| `hallOfFamePage.tsx` | `/hall-of-fame` | Three all-time record cards: highest single-round score, longest win streak, best season total — public    |
| `resultsPage.tsx`    | `/results`      | Points DataGrid + Weekly LineChart + year selector, with dense phone-friendly table and chart handling     |
| `statsPage.tsx`      | `/stats`        | Won vs Played, Points Per Round, Accumulated Points charts + year selector, with small-screen chart polish |
| `loginPage.tsx`      | `/login`        | Login form (direct URL access; TopNav uses `LoginModal` instead)                                           |
| `notFoundPage.tsx`   | `*`             | 404 fallback (protected route)                                                                             |

## Rules

- Filename must match the route intent in lowerCamelCase.
- Pages must compose feature components and shared UI, not reimplement feature logic.
- Pages may import from `features/` and `shared/`, not from each other.
- Results and stats pages must preserve the dense and overflow-safe small-screen settings that keep data views readable.
