<div align="center">

# DynaBox

A local-first productivity dashboard: a grid of widgets you arrange yourself, with your data kept in your own browser.

[![Live](https://img.shields.io/badge/live-dynabox.space-6a0dad?style=flat-square)](https://dynabox.space)
![React](https://img.shields.io/badge/React-19.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.0-646cff?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey?style=flat-square)

**English** · [Português](README.pt-BR.md)

[What it is](#what-it-is) · [Status](#status) · [Architecture](#architecture) · [Stack](#stack) · [Getting started](#getting-started) · [Usage](#usage) · [Technical decisions](#technical-decisions) · [Tests](#tests) · [License](#license)

</div>

---

## What it is

DynaBox is a single-page dashboard where each feature is a widget ("box") you drop onto a
resizable grid. You pick which widgets to show, where they sit and how the whole thing looks,
and the arrangement is yours: there is no account, no server and no database. Everything lives
in `localStorage`, and the only way data leaves the browser is if you explicitly connect your
own Google Drive to back it up.

It is live at **[dynabox.space](https://dynabox.space)**. The interface is in Portuguese, since
that is who it was built for; the code, the commits and this README are in English.

## Status

Measured on 2026-10-02: 299 commits, 97 TypeScript files, 14,644 lines in `frontend/src`.
`npm run build` and `npm run lint` both pass.

| Area | State |
|---|---|
| Dashboard grid: drag, resize, add, remove, multiple workspaces | works |
| 25 native widgets rendered in the grid | works |
| Custom widgets written in HTML, CSS and JS | works |
| Theme engine: 7 color palettes, 18 wallpapers, 10 ready setups, plus free color choice | works |
| Tasks: text-script input, bulk edit, isolation per workspace | works |
| Week planner with native drag and drop, per-cycle stats | works |
| Projects: dedicated page and a project-focused dashboard | works |
| Wiki (`/wiki`) and landing page (`/intro`) | works |
| Local backup: full state export and import as JSON | works |
| Google Drive backup and restore | works, needs your own `VITE_GOOGLE_CLIENT_ID` |
| Automated tests | none yet |
| Continuous integration | none yet |
| Mobile layout | responsive, verified by hand only |

Two limits worth stating up front. The main bundle is **626.99 kB** (184.58 kB gzipped)
because the shared vendor code is not split yet, even though every widget is its own lazy
chunk. And there is no test suite, so every change is verified by building and clicking.

## Architecture

One React app, no backend. State lives in Zustand stores, each one persisted to `localStorage`
under its own key. Nothing is fetched on load.

```
component  ->  Zustand store  ->  localStorage
                     |
                     +---------->  Google Drive (opt-in, on demand)
```

```
frontend/src
├── pages/              the 8 routed screens
├── components/
│   ├── layout/         app shell: Sidebar, DashboardLayout, Home (the grid itself)
│   │   ├── boxes/      the widgets that live in the grid
│   │   └── modals/     layout manager, personalization, backup, widget editor
│   ├── week-planner/   the planner split into memoized parts
│   ├── tasks/          bulk and single-task editors
│   ├── landing/        visual components used by /intro
│   └── ui/             shared primitives: button, TaskItem, CustomDatePicker
├── widgets/            standalone pages embedded through an iframe (/w/*)
├── store/              14 Zustand stores
├── services/           Google Drive client
├── hooks/              useCloudSync, useWeekPlanner
├── utils/              task parsing, date helpers, sync helpers
├── data/               widget catalog, theme catalog, in-app release notes
└── types/              Task, Project, Theme
```

Routes:

| Route | What it is |
|---|---|
| `/` | the dashboard grid |
| `/tasks` | full task list with bulk operations |
| `/projects` | long-term projects and routines |
| `/planner` | week planner, tasks grouped into cycles |
| `/store` | widget catalog, where widgets are turned on |
| `/themes` | theme gallery and customization |
| `/wiki` | syntax reference, shortcuts and project information |
| `/intro` | landing page |
| `/w/snake`, `/w/water`, `/w/bio` | built-in embeddable widgets |
| `/w/custom/:id` | a user-written custom widget |

## Stack

| Dependency | Version | What it does here |
|---|---|---|
| react, react-dom | 19.1 | the whole UI |
| typescript | 5.8 | types, with `tsc -b` in the build |
| vite | 7.0 | dev server and build |
| tailwindcss | 3.4 | styling, driven by CSS variables the theme engine writes |
| zustand | 5.0 | global state, with the `persist` and `immer` middlewares |
| immer | 10.2 | the draft updates the two stores that change widgets and layout together |
| react-grid-layout | 1.5 | the draggable and resizable grid |
| react-router-dom | 7.6 | routing |
| date-fns | 4.1 | date math in the planner and the calendars |
| lucide-react | 0.525 | icons |
| @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge | | the shadcn/ui style primitive layer |
| tailwindcss-animate, tw-animate-css | | the transitions |
| eslint, typescript-eslint | 9.x, 8.x | linting |

## Getting started

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta/frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173` and works fully offline from the first load. No
configuration is needed for anything except Google Drive sync.

### Enabling Google Drive sync

Cloud sync asks for the `drive.file` scope and writes a single file, `dynabox_backup_v1.json`,
to your Drive. It is plain JSON and only the account you authorize can read it. To use it you
need your own OAuth client ID from the Google Cloud console:

```bash
cp .env.example .env
# then fill in VITE_GOOGLE_CLIENT_ID
```

Without that variable the rest of the app runs normally and only the sync buttons fail.

### Other commands

```bash
npm run build     # tsc -b, then vite build
npm run lint      # eslint
npm run preview   # serve the production build
```

## Usage

### The widgets

| Widget | What it does |
|---|---|
| Tasks | the day's task list, scoped to the active workspace |
| Progress | how much of today is done |
| Pomodoro | focus timer that keeps running across navigation |
| Notepad | quick notes |
| Mini Calendar | compact month view |
| Presence Calendar | attendance tracking for recurring events |
| Countdown | time left until a date |
| Habit Tracker | daily consistency grid |
| Three Frogs | the three hardest tasks of the day |
| Monthly Goals | goals for the month |
| Activity Goals | cumulative metrics by tag, with week and month views |
| Meta Tags | hour goals per tag, which feed the progress widgets |
| Tags | tag management |
| Risk Tracker | limit tracking, by percentage or absolute count |
| Project Overview | status of the active projects |
| Book Tracker | pages read and reading progress |
| Cozy Library | visual collection shelf |
| Quick Links | bookmarks, organized into tabs |
| Code Snippet | saved commands and code fragments |
| Automation | simple if/then rules |
| Quick Workout | short exercise routines |
| RPG Profile | XP and levels earned from finished tasks |
| Pixel Garden | plants that grow as tasks are completed |
| Theme | theme switching from inside the grid |
| Embedded | an iframe for YouTube, Spotify, Notion or any URL |

Plus three embeddable pages of their own, `snake`, `water` and `bio`, and any custom widget
written in the editor.

### Writing tasks as text

Tasks are typed, not filled into a form. One line is one task, and the same syntax works in the
quick input, in bulk creation and in the edit modal:

```
- review the pull request >45min >>14:00 [work] {sprint 12}
- [x] water the plants
```

| Token | Meaning |
|---|---|
| `>45min` or `>2h` | how long it takes |
| `>>14:00` | what time it happens |
| `[tag]` | the tag, which is what goal tracking counts |
| `{group}` | the cycle or group it belongs to |
| `- [x]` | already done |

## Technical decisions

**Local-first, with `localStorage` as the source of truth.** There is no backend and no account.
That makes the app instant and private by default, and it is the reason the data model had to be
small enough to serialize whole. The cost is that nothing syncs between devices on its own, which
is exactly the hole the opt-in Drive backup fills.

**Zustand instead of Context.** The app started on Context providers and moved off them in 0.2.0.
The reason was concrete: with the Pomodoro ticking once a second, a single context at the top of
the tree re-rendered the sidebar and the header every second. Fourteen small stores with
`useShallow` selectors mean a tick only touches the timer.

**One chunk per widget.** Every box is loaded with `React.lazy` behind a `Suspense` fallback, so
the build emits a separate file per widget and a dashboard only downloads the widgets its layout
actually uses.

**Themes as injected CSS variables, not a class per theme.** A single applicator writes the
variables onto `:root`. That is why the whole gallery plus any color the user invents costs no
extra CSS, and why a color change previews live instead of after a reload.

**Custom widgets run inside an iframe route.** User-written HTML, CSS and JS is served at
`/w/custom/:id` and embedded, so it cannot reach the app's state or styles. The three built-in
embeds use the same mechanism, which means there is one path to maintain instead of two.

**Tasks as a text script.** Typing `>45min [work]` is faster than four form fields, and keeping
one parser (`TaskParser.ts`) for creation, bulk input and editing means the three paths cannot
drift apart.

**Immer only where the state is nested.** Two stores use it, `useDashboardStore` and
`useProjectStore`, because both update the widget array and the layout array together and have to
stay atomic. The other twelve are flat enough that plain updates read better.

## Tests

There is no automated test suite yet. What is verified today:

```bash
npm run build     # tsc -b plus vite build, passing
npm run lint      # eslint, clean
```

Everything else is checked by hand: the sync round trip (back up in one browser, restore in
another), layout persistence across a reload, and the gamification widgets reacting to a finished
task. [`FEATURES.md`](FEATURES.md) documents the system widget by widget.

## License

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE). Use and adapt it freely
with credit, but not commercially.
