# 📄 Pages

One file per route. Pages are intentionally thin — they import and compose feature components, they do not own logic themselves.

| File               | Route      | Content                                                                    |
| ------------------ | ---------- | -------------------------------------------------------------------------- |
| `homePage.tsx`     | `/`        | Season Podium (top 3 by wins) + Last Round card                            |
| `resultsPage.tsx`  | `/results` | Points DataGrid + Weekly LineChart + year selector                         |
| `statsPage.tsx`    | `/stats`   | Won vs Played, Points Per Round, Accumulated Points charts + year selector |
| `loginPage.tsx`    | `/login`   | Login form (direct URL access; TopNav uses `LoginModal` instead)           |
| `notFoundPage.tsx` | `*`        | 404 fallback (protected route)                                             |

## Conventions

- Filename matches the route intent, lowerCamelCase.
- Pages may import from `features/` and `shared/`, not from each other.
