## Preference Checker — Agent Notes

- Package manager: `pnpm` (packageManager set to pnpm@10.15.0). Use `pnpm install` to bootstrap and `pnpm dev|build|preview|lint` for scripts.
- Lockfile: pnpm-lock.yaml present after install.
- Stack: Vite + React (with a small Vue custom element), TypeScript, Tailwind CSS v4 alpha. Data lives in `data/` and preferences persist to `localStorage`.
- Ranking: user picks between two options (A/B); results update an Elo-style rating per option.
- Deployment: GitHub Pages via `.github/workflows/deploy.yml` (builds on pushes to `main`), Vite `base` set to `./` for Pages.
- Tests: run `pnpm lint` and `pnpm test` after changes. Vitest config lives in `vitest.config.ts`.
- Mobile: must support very small phone screens (e.g., 480x854); Arena page should fit without scrolling vertically.
- Styling: keep CSS only for animations (e.g., keyframes); all other styling should be inline Tailwind utilities.
