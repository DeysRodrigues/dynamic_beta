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

[What it is](#what-it-is) · [Status](#status) · [Architecture](#architecture) · [Stack](#stack) · [Two ways to run it](#two-ways-to-run-it) · [Usage](#usage) · [Technical decisions](#technical-decisions) · [Tests](#tests) · [License](#license)

</div>

---

## What it is

DynaBox is a single-page dashboard where each feature is a widget ("box") you drop onto a
resizable grid. You pick which widgets to show, where they sit and how the whole thing looks,
and the arrangement is yours. By default there is no account, no server and no database:
everything lives in `localStorage`, and data only leaves the browser if you export a JSON backup
yourself. If you want an account and a copy of your data in a database (to use more than one
device), you can connect the app to a DynaBox server that you run yourself with Docker. Both ways
are covered in [Two ways to run it](#two-ways-to-run-it).

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
| Theme engine: 7 color palettes, 18 wallpapers, 4 ready setups (dev, focused study, relaxed study, exam week), plus free color choice | works |
| Tasks: text-script input, bulk edit, isolation per workspace | works |
| Week planner with native drag and drop, per-cycle stats | works |
| Projects: dedicated page and a project-focused dashboard | works |
| Wiki (`/wiki`) and landing page (`/intro`) | works |
| Local backup: full state export and import as JSON | works |
| Optional account and sync with your own server (PostgreSQL), chosen inside the app | works; the screen has only been exercised by automated tests so far |
| Docker: one command for the app, the API and the database | works, checked in CI by a smoke test |
| Automated tests | 480 in the app (sync engine, account screen, slow and failing storage, markdown, stores, migrations, render tests) and 77 in the server, which run against a real PostgreSQL |
| Continuous integration | GitHub Actions: lint, build and test on every push and PR |
| Mobile layout | responsive, verified by hand only |

One limit worth stating up front: the test suite is young. It covers the pure logic, the stores
and the main screens' rendering, but not the drag-and-drop of the grid or most widgets' inner
behavior. The app chunk is **242 kB** (64.6 kB gzipped); the libraries are split into six vendor
chunks (react, router, grid, icons, dates, zod) and every widget is its own lazy chunk.

## Architecture

A React app, plus an optional server. State lives in Zustand stores, each one persisted to
`localStorage` under its own key, and nothing is fetched on load. Signing in to a server does not
change that: the app still reads and writes `localStorage`, and a sync engine copies it to the
server and back.

```
local only:   component -> Zustand store -> localStorage

with a server:  component -> Zustand store -> localStorage <-> sync engine <-> API -> PostgreSQL
```

```
dynamic_beta/
├── frontend/           the React app (+ Dockerfile and nginx.conf)
├── backend/            the API: Fastify, Drizzle, PostgreSQL, argon2 + JWT
├── docker-compose.yml  web + api + db, one command
└── scripts/            smoke test, theme thumbnails
```

```
frontend/src
├── pages/              the 8 routed screens
├── components/
│   ├── layout/         app shell: DashboardLayout, theme and pomodoro managers
│   │   ├── boxes/      the widgets that live in the grid
│   │   └── modals/     layout manager, personalization, backup, widget editor
│   ├── week-planner/   the planner split into memoized parts
│   ├── tasks/          bulk and single-task editors
│   ├── landing/        visual components used by /intro
│   └── ui/             shared primitives: button, TaskItem, CustomDatePicker
├── features/
│   ├── dashboard/      the grid page: header, workspace tabs, add menu, grid, box frame
│   └── sidebar/        the sidebar: profile, nav, settings drawer
├── widgets/            the widget registry (boxes/<id>.tsx) and the iframe pages (/w/*)
├── store/              14 Zustand stores
├── persistence/        the registry of saved keys, the storage adapter, migrations, backup and hydration
├── sync/               the optional server connection: session, API client, sync engine
├── hooks/              useWeekPlanner
├── utils/              task parsing, date helpers
├── data/               theme catalog, iframe widget list, in-app release notes
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
| zod | 4.6 | the shape of what the heavier widgets save, checked on every read and write |
| immer | 10.2 | the draft updates the two stores that change widgets and layout together |
| react-markdown, remark-gfm | 10, 4 | the markdown preview of the notepad, GitHub flavour, without raw HTML |
| react-grid-layout | 1.5 | the draggable and resizable grid |
| react-router-dom | 7.6 | routing |
| date-fns | 4.1 | date math in the planner and the calendars |
| lucide-react | 0.525 | icons |
| @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge | | the shadcn/ui style primitive layer |
| tailwindcss-animate, tw-animate-css | | the transitions |
| eslint, typescript-eslint | 9.x, 8.x | linting |

The optional server in `backend/` (details in [`backend/README.md`](backend/README.md)):

| Dependency | What it does there |
|---|---|
| Fastify 5 + Zod 4 | the HTTP server, and validation of every request |
| Drizzle ORM + postgres.js | typed SQL; the migrations are plain `.sql` files in `backend/drizzle/` |
| PostgreSQL 17 | the database; one `jsonb` document per user and key |
| @node-rs/argon2 | password hashing (argon2id) |
| @fastify/jwt, cors, rate-limit | login tokens, the allowed websites, and a limit on sign-in attempts |
| Vitest + Testcontainers | tests against a real PostgreSQL started in Docker |

## Two ways to run it

The app is the same in both. The difference is only whether a server keeps a copy of your data.

### 1. Local only (the default)

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta/frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173` and works fully offline from the first load. No
configuration is needed, there is no account, and the data stays in this browser. This is also
what the published site does.

### 2. With an account and a database (Docker)

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta
cp .env.example .env        # then fill JWT_SECRET and POSTGRES_PASSWORD in it
openssl rand -hex 32        # a value for JWT_SECRET
openssl rand -hex 16        # a value for POSTGRES_PASSWORD
docker compose up --build -d
```

Open `http://localhost:8080`, go to **Conta** in the menu and create an account. The app in this
container already points at its own server. Three containers run:

| Service | What it is | Reachable from your machine? |
|---|---|---|
| `web` | the app, served by nginx; it forwards `/api` to the API | yes, on port 8080 (`WEB_PORT`) |
| `api` | the server (Fastify) | no, only through `web` |
| `db` | PostgreSQL 17, data in the `dynabox_pgdata` volume | no |

```bash
docker compose logs -f api    # follow the server
docker compose down           # stop it; your data stays in the volume
docker compose down -v        # stop it AND delete the database
./scripts/smoke.sh            # check a running server end to end (needs only curl)
```

Once your own account exists, set `ALLOW_REGISTRATION=false` in `.env` and run
`docker compose up -d` again, so nobody else can create one. To reach the API or the database
from tools such as curl or psql while developing, add
`-f docker-compose.dev.yml` (API on `127.0.0.1:3000`, database on `127.0.0.1:5433`).

Everything about this setup (the `.env` variables, backups, updating, putting it on a cloud
server, common problems) is in **[docs/DOCKER.md](docs/DOCKER.md)**.

### Using the published site with your own server

The published site starts in local-only mode. To sync it with a server you run yourself:

1. Start the server as above, and put the site's address in `.env` so the server accepts it:
   `CORS_ORIGINS=https://dynabox.space`, then `docker compose up -d`.
2. In the site, open **Conta**, type `http://localhost:8080` (the app finds the `/api` part by
   itself), press **Testar conexão**, then sign in or create the account.

The same step-by-step for starting your own server is in the app's Wiki, in the section
"Ter o seu servidor" (`/wiki?secao=server`), and the Conta page links to it.

Browsers allow an https page to call `http://localhost`, but Safari does not, and a server on
another machine needs its own https address. In those cases use the app served by your Docker
(step 2 above). The screen detects the problem and says so before trying.

### How the sync behaves

The browser's storage stays the source of truth, so the app is instant and works offline. After
you change something, the engine sends it a moment later, naming the revision it last saw so the
server can refuse a stale write. News from other devices arrives when you return to the tab,
when the network comes back, and every minute. If the same data changed in both places the app
asks which version to keep, key by key; it cannot merge two versions, and it never overwrites
before you answer. **Sair** returns to local-only mode without deleting anything.

### Security notes

Passwords are stored as argon2id hashes. Login tokens are signed with `JWT_SECRET`, last two
weeks and are kept in the browser's storage, so a script injected into the page could read one
(no such script exists today, but it is the trade-off). Sign-in and sign-up are rate limited. On
a server open to the internet put it behind https, set `CORS_ORIGINS` to your site, and turn
`ALLOW_REGISTRATION` off once you have your account. There is no password recovery by e-mail and
no button to delete the account itself yet, only its saved data.

### Other commands

```bash
npm run build     # tsc -b, then vite build
npm run lint      # eslint
npm run preview   # serve the production build
./scripts/make-theme-thumbs.sh   # light WebP thumbnails of the theme wallpapers (needs ImageMagick)
```

The themes page shows small WebP thumbnails instead of the full wallpapers; the full image is
only loaded when a theme is applied. After adding or changing a wallpaper in
`public/images-themes/`, run the script and commit the new thumbnails. A test fails if a theme
points at a wallpaper without one.

## Usage

### The widgets

| Widget | What it does |
|---|---|
| Tasks | the day's task list, scoped to the active workspace |
| Progress | how much of today is done |
| Pomodoro | focus timer that keeps running across navigation |
| Notepad | quick notes, written in markdown with a preview and clickable checklists |
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
| Pixel Garden | a potted plant in pixel art that grows through five stages as tasks are completed today |
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

**Local-first, with `localStorage` as the source of truth.** By default there is no backend and no
account. That makes the app instant and private, and it is the reason the data model had to be small
enough to serialize whole. Syncing to a server is an addition on top of that, not a replacement:
the server is a copy, so the app never waits for it and keeps working when it is down.

**A document per key, with a revision, instead of one table per widget.** The server stores exactly
what the browser stores, one JSON document per user and key, and does not look inside it. That
kept the 25 widgets out of the server's schema, and the write is a single atomic statement that
only succeeds if the revision the client names is the one on record. The price is that a conflict
is settled by choosing a whole version, never by merging fields.

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

What is verified today, locally and in CI on every push:

```bash
cd frontend && npm run build && npm run lint && npm test   # the app
cd backend  && npm run lint && npm test                    # the server (needs Docker running)
./scripts/smoke.sh                                         # a running server, end to end
SYNC_E2E_URL=http://localhost:8080/api npx vitest run src/sync/e2e.test.ts   # the app's real stores against a real server
```

The server's tests start a real PostgreSQL in Docker (Testcontainers), so what they check is what
runs. CI builds the three containers and runs the smoke test against them.

The tests cover the task text grammar (`TaskParser`), the date and task helpers, the
dashboard store actions and the backup round trip (export, clear, import). Everything else is checked by hand: the same round trip across two browsers, layout persistence across a reload, and the gamification widgets reacting to a finished
task. [`FEATURES.md`](FEATURES.md) documents the system widget by widget.

## License

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE). Use and adapt it freely
with credit, but not commercially.
