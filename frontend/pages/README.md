# 📄 Pages

One file per route. Pages are intentionally thin — they import and compose feature components, they do not own logic themselves.

| File                    | Route               | Content                                                                                                                                                                                                          |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `homePage.tsx`          | `/`                 | Season Podium (top 3 by wins) + Last Round card + ⚔️ Closest Rivalries section (top 3; only rendered when rivalries exist or are loading)                                                                        |
| `hallOfFamePage.tsx`    | `/hall-of-fame`     | Three all-time record cards: highest single-round score, longest win streak, best season total — public                                                                                                          |
| `resultsPage.tsx`       | `/results`          | Points DataGrid (player column headers show `PlayerSparklineHeader` with last-5 score sparkline) + Weekly LineChart + year selector, with dense phone-friendly table and chart handling                          |
| `statsPage.tsx`         | `/stats`            | Won vs Played, Points Per Round, Accumulated Points charts + year selector, with small-screen chart polish                                                                                                       |
| `loginPage.tsx`         | `/login`            | Login form (direct URL access; TopNav uses `LoginModal` instead)                                                                                                                                                 |
| `notFoundPage.tsx`      | `*`                 | 404 fallback (protected route)                                                                                                                                                                                   |
| `playerProfilePage.tsx` | `/players/:name`    | Name, avatar, all-time stats (rounds, wins, win rate, personal best), current win streak, cumulative season rank history chart, 🏅 Achievements section (earned chips + greyed-out unearned chips with tooltips) |
| `roundDetailPage.tsx`   | `/results/:roundId` | Podium + score breakdown table for a single round, with delta vs season average                                                                                                                                  |

## Rules

- Filename must match the route intent in lowerCamelCase.
- Pages must compose feature components and shared UI, not reimplement feature logic.
- Pages may import from `features/` and `shared/`, not from each other.
- Results and stats pages must preserve the dense and overflow-safe small-screen settings that keep data views readable.
