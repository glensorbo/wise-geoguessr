# 🔧 Shared

Generic, reusable code with **no business logic**. Safe to import from any feature or page.

```
shared/
├── components/   # Reusable UI primitives
│   ├── animatedMapBackground.tsx  # Decorative SVG world map with framer-motion breathing animation; aria-hidden, theme-aware, respects prefers-reduced-motion
│   ├── errorBoundary.tsx          # App-level React error boundary with reset support
│   ├── playerAvatar.tsx           # Memoised MUI Avatar backed by a DiceBear toon-head SVG; accepts name + optional size
│   └── skeleton.tsx               # Skeleton loaders: TableSkeleton, ListSkeleton, CardSkeleton
├── hooks/        # Generic hooks (e.g. useDebounce, useLocalStorage)
├── utils/        # Pure utility functions (e.g. formatDate, cn)
└── types/        # Shared TypeScript types & utility types
```

## Rules

- ❌ No API calls
- ❌ No Redux state
- ❌ No domain/business concepts
- ✅ Purely generic — could theoretically live in any project
