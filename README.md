# Preference Checker

A pastel A/B picker that tracks your choices with a simple Elo-style score per option. Built with React, Vite, TypeScript, Tailwind v4 alpha, and a Vue custom element for a small glance widget. Data is local-only and persists in `localStorage`.

## Features
- A/B battle flow with smooth glow/dim feedback on selection
- Local scoring (Elo-like) and rankings page with images
- Pastel, glassy UI with Tailwind v4 alpha
- Vue custom element embedded in React
- pnpm-based toolchain

## Development
```bash
pnpm install
pnpm dev
```

## Tests / Lint
```bash
pnpm lint
```

## Build
```bash
pnpm build
```

## Deployment
GitHub Pages is configured via `.github/workflows/deploy.yml` (builds on pushes to `main`). Vite `base` is set to `./` for Pages compatibility.

## Data
Options live in `data/options.ts` with name, description, and image. Rankings persist to `localStorage`.

## License
MIT © 2024 Michael Standen
