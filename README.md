# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Getting Started

Run locally in development:

```bash
npm install
npm run dev
```

This starts Vite at http://localhost:5173/

## Default Login

- Email: mostafa@elryan.com
- Password: 1111

## Features

- **[Authentication]** Email/password login with role awareness.
- **[Maintenance]** `maintainance-form.jsx` to add maintenance records to local DB.
- **[Installations]** `installations-form.jsx` to add installation records to local DB.
- **[Tables]** Interactive tables for viewing maintenance and installations.
- **[Charts / Analytics]** Multiple charts in `src/pages/Charts/` using Recharts (bar, pie, line, area) with export.
- **[Export PNG]** Download chart images via `components/ExportPNG`.
- **[Export CSV]** Role-based CSV export buttons for chart tables via `components/ExportCSV`.
- **[Local Database]** Dexie/IndexedDB-backed storage with seed data via `src/db/` and `initDB.js`.
- **[UI Components]** Inputs and buttons from `@/components/ui/` with Tailwind styling.
- **[Responsive Layout]** Sidebar navigation and responsive cards.

## Tools / Stack

- **[React]** UI framework
- **[Vite]** Dev server and bundler
- **[Tailwind CSS]** Utility-first styling (`src/index.css`)
- **[Recharts]** Data visualization in charts pages
- **[Dexie]** IndexedDB wrapper for client-side persistence (`src/db/`)
- **[react-hook-form]** Forms and validation
- **[lucide-react]** Icons used across UI
- **[@/components/ui]** Shared UI primitives (inputs, buttons)
- **[react-router-dom]** Routing for navigation
- **[shadcn/ui]** UI components




