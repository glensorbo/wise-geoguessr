# 📄 Pages

One file per route. Pages are intentionally thin — they import and compose feature components, they do not own logic themselves.

```
pages/
└── homePage.tsx   →  route "/" — public GeoGuessr dashboard (year selector, results DataGrid, 4 charts)
```

## Conventions

- Filename matches the route intent, lowerCamelCase.
- Pages may import from `features/` and `shared/`, not from each other.
