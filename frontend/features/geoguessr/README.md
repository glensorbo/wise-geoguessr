# 🌍 geoguessr

All GeoGuessr scoreboard logic, components, and hooks.

## Structure

| Path                                   | Contents                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants.ts`                         | `PLAYER_COLORS`, `getPlayerColor`, `getChartSeries`, `formatAxisNumber`                                                                                                                      |
| `hooks/useResults.ts`                  | Shared hook — year state + data fetching for Results and Stats pages                                                                                                                         |
| `hooks/useRoundDetail.ts`              | Fetches a single round by ID, derives `RoundDetailData` and podium                                                                                                                           |
| `hooks/usePlayerProfile.ts`            | Fetches all results and derives player stats, rank history, streak, and achievements for `/players/:name`                                                                                    |
| `hooks/useConfetti.ts`                 | `fireConfetti()` — plain utility function; fires a one-shot confetti burst via `canvas-confetti`; respects `prefers-reduced-motion`                                                          |
| `components/dashboardSection.tsx`      | Paper section wrapper used across dashboard                                                                                                                                                  |
| `components/podiumCard.tsx`            | Gold/silver/bronze podium display (top 3 by wins)                                                                                                                                            |
| `components/lastRoundCard.tsx`         | Ranked last round results                                                                                                                                                                    |
| `components/yearSelector.tsx`          | Reusable year dropdown                                                                                                                                                                       |
| `components/addScoreModal.tsx`         | Modal for adding a new round score                                                                                                                                                           |
| `components/playerSparklineHeader.tsx` | DataGrid column header: player name + inline `SparkLineChart` (last N scores); sparkline only rendered when player has 2+ data points                                                        |
| `components/rivalryCard.tsx`           | `RivalryCard` — displays a rivalry row: avatars, head-to-head record, avg score gap; links to `/head-to-head?a=X&b=Y`                                                                        |
| `logic/podium.ts`                      | `getPodium()` — returns top 3 players by wins                                                                                                                                                |
| `logic/lastRound.ts`                   | `getLastRound()` — returns latest round rankings                                                                                                                                             |
| `logic/roundDetail.ts`                 | `getRoundDetail()` — sorted rankings with delta vs season average; `getRoundPodium()` — top-3 entries from a detail result                                                                   |
| `logic/achievements.ts`                | `getPlayerAchievements(results, playerName)` — returns all 9 `Achievement` objects (earned/unearned) computed from `GameResult[]`                                                            |
| `logic/playerProfile.ts`               | `getPlayerStats()` — all-time stats per player; `getPlayerRankHistory()` — cumulative season rank per round date                                                                             |
| `logic/playerSparkline.ts`             | `getPlayerSparklineData(results, player, limit=5)` — last N scores for a player (played rounds only, sorted date ascending)                                                                  |
| `logic/rivalries.ts`                   | `getRivalries(results, year?, topN?)` — top N closest rivalries by avg score gap (min 3 shared rounds); exports `Rivalry`, `RivalryPlayer`                                                   |
| `logic/headToHead.ts`                  | `getHeadToHead(results, playerA, playerB, year?)` — shared round count, wins per player (ties count for both), and per-round score entries for rounds where both players have a played score |
| `logic/`                               | Other pure data-transformation helpers (results, scores, players, etc.)                                                                                                                      |

## Rules

- **Must not** import from sibling feature folders.
- **Must** add shared chart/colour helpers to `constants.ts` — not inline in components.
- `useResults.ts` is the single source for year-state + fetch logic — reuse it, don't duplicate.
- `useRoundDetail.ts` is the single source for per-round fetch + derivation logic — reuse it, don't duplicate.
- `usePlayerProfile.ts` is the single source for per-player stats, rank history, streak, and achievements — reuse it, don't duplicate.
- `fireConfetti` is a plain function, not a hook — call it inside a `useEffect` with a `setTimeout` delay (e.g. `setTimeout(fireConfetti, 1600)`).
- `getPlayerSparklineData` filters to played rounds only — never pass raw scores containing `null`/absent entries to a chart.
