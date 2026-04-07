# ◀️ leftNav

Sidebar navigation for the app shell on desktop and mobile.

## Nav items

| Label      | Route      | Icon                 | Visibility  |
| ---------- | ---------- | -------------------- | ----------- |
| Dashboard  | `/`        | `HomeRounded`        | All users   |
| Results    | `/results` | `TableChartRounded`  | All users   |
| Statistics | `/stats`   | `BarChartRounded`    | All users   |
| Admin      | `/admin`   | `AdminPanelSettings` | Admins only |

## Structure

| File                     | Role                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `components/leftNav.tsx` | Renders the permanent desktop drawer, the temporary mobile drawer, and collapsed desktop nav items |

## Rules

- `LeftNav` must render both drawer variants in one place so routes stay in sync across breakpoints.
- Desktop collapsed mode must keep icons centered and labels available via tooltip.
- Mobile navigation must use the temporary drawer and must close after navigation.
- Nav items must stay declarative and route-driven.
