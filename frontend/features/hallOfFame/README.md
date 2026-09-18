# 🏆 hallOfFame

Displays the three all-time records on the `/hall-of-fame` page.

## 📁 Files

| File                        | Purpose                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `components/recordCard.tsx` | Generic record card — accepts `emoji`, `title`, `value`, and a list of `holders` to render |

## Rules

- `RecordCard` must remain generic — it must not import from `@backend/types/hallOfFame` or reference any Hall of Fame domain types directly.
- Data fetching lives in `hallOfFamePage.tsx` via `useGetHallOfFameQuery` — must not be duplicated here.
- Each record field (`highestSingleRoundScore`, `longestWinStreak`, `highestSeasonTotal`) can be `null` when no data exists; the page handles the empty state.
