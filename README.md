# Learning OS — نظام التعلّم الشخصي

A simple, Arabic-first (RTL) personal learning management app. Use it to organise learning paths and topics, track resources, practise through projects and tasks, and keep a learning journal.

This is a **single-user prototype**. All data lives in your browser. See [Data storage and limitations](#data-storage-and-limitations) before relying on it.

## Features

| Section | What you can do |
| --- | --- |
| **الرئيسية (Dashboard)** | See the suggested next step, pending tasks from active projects (tick them off directly), recent activity, and progress per learning path. |
| **المسارات (Learning paths)** | Add, edit, delete and reorder paths. Inside a path, add, edit, delete, reorder and move topics between paths, with notes per topic. |
| **المصادر (Resources)** | Add courses, videos, articles, books and links with notes. Set the status (planned / in progress / completed) and link each resource to a topic. Filter by status or path and search by text. |
| **المشاريع (Projects)** | Create projects with a status (active / paused / done), linked to a path. Break them into tasks, tick tasks off, reorder them, and link a task to a learning topic. |
| **اليوميات (Journal)** | Dated entries recording what you learned, what you practised, problems you hit, and what to do next, optionally linked to a topic. |
| **البيانات (Data)** | Export a JSON backup, import a backup, restore the sample content, or erase everything. |

Two starter paths are included, *الذكاء الاصطناعي والتقنية والأتمتة* (AI, Technology & Automation) and *التواصل والقيادة ومهارات الأعمال* (Communication, Leadership & Business Skills), along with a few sample topics, resources, projects and journal entries. Everything can be edited or deleted. To start from a blank slate, use **البيانات ← حذف كل البيانات**.

### How the "next step" is chosen

The dashboard uses a fixed, predictable rule, in this order:

1. The first open task in the most recently updated **active** project.
2. Otherwise, the most recently touched resource that is **in progress**.
3. Otherwise, the oldest **planned** resource.
4. Otherwise, a prompt to write today's journal entry, or to create a path or project.

## Tech stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript, with no backend.
- State is held in a `useReducer` store (`src/store/reducer.ts`) and saved to `localStorage` after every change.
- Hash-based routing (`#/projects/...`), so the built app works on any static host without server rewrite rules.
- Plain CSS that uses logical properties for RTL. The IBM Plex Sans Arabic font is bundled locally through `@fontsource`, so no external font requests are made.
- [Vitest](https://vitest.dev/) unit tests for the reducer, storage and dashboard logic.

There are no API keys, secrets, accounts or paid services.

## Setup and running

Requires **Node.js 20.19+** (or 22.12+) and npm.

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:5173
```

Other scripts:

```bash
npm test           # run unit tests
npm run typecheck  # TypeScript checks
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

`dist/` is a fully static site. You can host it on any static host (GitHub Pages, Netlify, Cloudflare Pages and so on) or open it from a local web server. Note that each host or address keeps its own separate data (see below).

## Data storage and limitations

- **Where data lives:** in your browser's `localStorage` under the key `learning-os:data:v1`, on this device only. Nothing is sent to a server.
- **No sync:** data does **not** sync between devices, browsers or browser profiles. Your phone and your laptop will each have separate data. To move data, export a backup on one device and import it on the other. An import **replaces** the existing data and does not merge with it.
- **Data can be lost:** clearing site data, some private/incognito modes, or browser storage eviction can delete everything. **Export a backup regularly** (البيانات ← تصدير نسخة احتياطية).
- **Separate data per address:** `localhost:5173`, `localhost:4173` and a deployed URL each count as a different origin, so each has its own data.
- **Size:** browsers allow roughly 5 MB per origin. That is plenty for text, but the app shows a warning if a save fails.
- **Multiple tabs:** changes made in one tab are picked up by other open tabs of the same origin.
- **Corrupted data:** if saved data can't be read, the app loads the sample content and keeps the unreadable data under `learning-os:data:v1:corrupt-backup`.
- **No accounts:** there is no login, so anyone with access to the browser can see the data.

## Project structure

```
src/
  App.tsx              route → page mapping
  main.tsx             entry point
  styles.css           all styles (RTL, responsive)
  components/          Layout, FormModal, shared UI bits
  pages/               Dashboard, Paths, Resources, Projects, Journal, Data
  lib/                 types, labels, router, dashboard insights
  store/               reducer, localStorage persistence, sample data, tests
```

## Not included yet (by design)

AI agents, external integrations, analytics dashboards, automated scheduling, accounts, and cloud sync.
