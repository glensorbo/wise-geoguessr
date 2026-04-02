# 🌍 geoguessr

All GeoGuessr scoreboard logic, components, and hooks.

## Structure

| Path                              | Contents                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `constants.ts`                    | `PLAYER_COLORS`, `getPlayerColor`, `getChartSeries`, `formatAxisNumber`                                                    |
| `hooks/useResults.ts`             | Shared hook — year state + data fetching for Results and Stats pages                                                       |
| `hooks/useRoundDetail.ts`         | Fetches a single round by ID, derives `RoundDetailData` and podium                                                         |
| `components/dashboardSection.tsx` | Paper section wrapper used across dashboard                                                                                |
| `components/podiumCard.tsx`       | Gold/silver/bronze podium display (top 3 by wins)                                                                          |
| `components/lastRoundCard.tsx`    | Ranked last round results                                                                                                  |
| `components/yearSelector.tsx`     | Reusable year dropdown                                                                                                     |
| `components/addScoreModal.tsx`    | Modal for adding a new round score                                                                                         |
| `logic/podium.ts`                 | `getPodium()` — returns top 3 players by wins                                                                              |
| `logic/lastRound.ts`              | `getLastRound()` — returns latest round rankings                                                                           |
| `logic/roundDetail.ts`            | `getRoundDetail()` — sorted rankings with delta vs season average; `getRoundPodium()` — top-3 entries from a detail result |
| `logic/`                          | Other pure data-transformation helpers (results, scores, players, etc.)                                                    |

## Rules

- **Must not** import from sibling feature folders.
- **Must** add shared chart/colour helpers to `constants.ts` — not inline in components.
- `useResults.ts` is the single source for year-state + fetch logic — reuse it, don't duplicate.
- `useRoundDetail.ts` is the single source for per-round fetch + derivation logic — reuse it, don't duplicate.
