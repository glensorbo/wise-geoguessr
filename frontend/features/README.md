# 🧩 Features

Self-contained feature modules. Each subfolder owns everything for that feature:

```
features/
└── myFeature/
    ├── components/   # React components
    ├── hooks/        # Custom hooks
    ├── logic/        # Pure functions, helpers
    ├── types/        # TypeScript types & interfaces
    └── state/        # Redux slices / local state
```

## Rules

- **No cross-feature imports.** Features must not import from sibling feature folders.
- If logic is needed by multiple features, extract it to `frontend/shared/`.
- `shared/` must not contain business logic — only generic utilities, components, hooks and types.
