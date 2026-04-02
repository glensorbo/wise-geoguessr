# 🌟 Recap Feature

Spotify Wrapped-style Season Recap page at `/recap/:year`. Animated slideshow of stat highlights computed from `GameResult[]`.

## Logic — `recapStats.ts`

```ts
getRecapStats(currentResults: GameResult[], prevResults: GameResult[]): RecapStats
```

Computes 7 stat highlights:

| Stat               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `champion`         | Player with the most wins                                |
| `mostImproved`     | Highest positive delta in avg score vs prior season      |
| `sharpshooter`     | Player + date with the single highest score              |
| `closestRivalry`   | Two players with lowest avg score gap (≥3 shared rounds) |
| `mostInconsistent` | Highest score std deviation (≥3 rounds played)           |
| `longestWinStreak` | Longest consecutive-win streak                           |
| `totalRounds`      | Total number of rounds in `currentResults`               |

Any stat may be `null` if there is insufficient data. Null stats are skipped when building slides.

## Components — `RecapCard`

```ts
type RecapSlide = {
  key: string;
  emoji: string;
  label: string; // e.g. "Season Champion"
  value: string; // e.g. "Alice"
  subtext: string; // e.g. "8 wins this season"
  gradient: string; // CSS gradient for card background
  confetti?: boolean; // fires canvas-confetti on mount if true
};
```

`RecapCard` accepts `slide: RecapSlide` and `direction: 1 | -1`. Slides animate in from the right (`direction=1`) or left (`direction=-1`) using Framer Motion `AnimatePresence`.

## Hook — `useRecap`

```ts
useRecap(year: number): { stats: RecapStats; isLoading: boolean; hasData: boolean }
```

Fetches `year` and `year - 1` results via RTK Query, then memoizes `getRecapStats`.

## Route

`/recap/:year` → `RecapPage`  
Supports keyboard arrow navigation (← →) and clickable progress dots.
