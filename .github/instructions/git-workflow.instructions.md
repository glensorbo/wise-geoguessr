---
applyTo: '**'
---

# 🌿 Git Workflow

## Branching Strategy

**Never commit directly to `main` unless explicitly instructed.**

All code changes must go through a feature branch and be merged via a pull request:

1. **Create a feature branch** from `main`:
   ```sh
   git checkout -b feat/short-description
   ```
2. **Commit your changes** to that branch (run `bun run cc` first)
3. **Push the branch** and open a PR:
   ```sh
   git push -u origin feat/short-description
   gh pr create --fill
   ```

## Branch Naming

| Type             | Pattern               | Example                     |
| ---------------- | --------------------- | --------------------------- |
| Feature          | `feat/<description>`  | `feat/user-profile-page`    |
| Fix              | `fix/<description>`   | `fix/refresh-token-expiry`  |
| Chore / refactor | `chore/<description>` | `chore/update-dependencies` |

## Commit Messages

Use emoji prefixes to signal intent:

| Prefix         | When to use                       |
| -------------- | --------------------------------- |
| `✨ feat:`     | New feature                       |
| `🐛 fix:`      | Bug fix                           |
| `♻️ refactor:` | Refactor without behaviour change |
| `🧪 test:`     | Tests only                        |
| `📝 docs:`     | Documentation only                |
| `🔧 chore:`    | Build, config, tooling            |

Always include the Copilot co-author trailer:

```
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

## When Direct Commits to `main` Are Allowed

Only when the user **explicitly says** something like:

- _"commit directly to main"_
- _"just push to main"_
- _"skip the PR"_

Otherwise, always use a feature branch.
