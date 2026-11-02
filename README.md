# Job Tracker

A colourful, drag-and-drop job application tracker. Add applications, move them across a Kanban board as you progress, get follow-up reminders, and see your progress on a dashboard.

It is a **front-end only** app: there is no server or database. Everything is stored in your browser.

> **Live demo:** _add your GitHub Pages link here after deploying_ (use the **Try the live demo** button on the landing page to explore with sample data).

## Features

- **Landing page** with a one-click live demo (sample data from fictional companies).
- **Accounts and login** (local to the browser): salted PBKDF2 password hashing, login lockout after repeated failures, idle and maximum session expiry, protected routes and separate data per user.
- **Kanban board** (Applied, Interviewing, Offer, Rejected) with drag and drop by mouse, touch or keyboard. Drop a card on the delete zone to remove it, or into Offer to celebrate.
- **Add and edit applications** with validated forms (company, role, dates, salary range, job link, status, follow-up reminder, interview date, notes).
- **Detail page** with overdue and due-today follow-up highlighting, a status history timeline and an "Add to calendar" button.
- **Quiet-application nudges**: applications with no movement for 14 days are flagged on the board.
- **Undo** for deletes, moves, edits and imports.
- **Dashboard**: total applications, response rate, average days to first reply, interviews this week, status pie chart, weekly bar chart, adjustable weekly goal ring, hiring funnel (applied, interviewed, offered) and reply rate by source.
- **Offer comparison**: put up to three opportunities side by side and see an effective hourly rate that accounts for bonus, pension, holiday, remote days and commute (an estimate, not financial advice).
- **Job advert helper**: paste an advert to pre-fill the form (role, company, salary, link, source) and compare keywords against your CV, entirely in the browser. A "Save to Job Tracker" bookmarklet pre-fills the form from any job page.
- **Search and filters** by company or role, status and date range.
- **Import and export**: JSON backup (validated on import; drop a file anywhere on the page to import), CSV for spreadsheets (formula-safe), and a calendar file (.ics) of interviews and follow-ups.
- **Light and dark mode** plus five colour themes, remembered between visits.
- **Responsive** layout and accessible controls. Motion respects the "reduce motion" setting, and cursor effects are switched off on touch devices.

## Tech stack

React 18, Vite, React Router, Material UI, Tailwind CSS (base styles and dark-mode variant), dnd-kit, React Hook Form with Zod, Recharts, Iconify (Lucide icons, bundled), Web Crypto API, Vitest and React Testing Library.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # start the dev server (usually http://localhost:5173)
npm test           # run the tests once
npm run test:watch # re-run tests as you edit
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  App.jsx, main.jsx, ProtectedApp.jsx   routes, entry point, signed-in shell
  components/                           shared UI: layout, modal, icons, empty states, magic/ (cursor effects)
  hooks/                                useLocalStorage, useCountUp, usePageTitle
  lib/dates.js                          date helpers (local calendar days, Monday-start weeks)
  features/
    applications/                       board, cards, form, filters, status logic, Zod schema, context
    auth/                               hashing, sessions, lockout, login and sign-up pages, route guards
    dashboard/                          stats, funnel and source analytics, charts, weekly goal
    offers/                             offer comparison page and maths
    jobhelper/                          job advert parsing, CV keyword match, bookmarklet
    calendar/                           .ics calendar file builder
    data/                               JSON import, export menu, CSV
    demo/                               sample data and the demo banner
    landing/                            landing page
    theme/                              light/dark mode, colour palettes
```

## Where is my data stored?

Only in your browser's `localStorage`, under these keys. Nothing is sent to a server.

| Key | Contents |
| --- | --- |
| `jat.users` | Accounts: name, email, salted password hash |
| `jat.session` | The signed-in user and session timestamps |
| `jat.lockouts` | Failed-login counters |
| `jat.applications.<userId>` | That user's applications |
| `jat.weeklyGoal.<userId>` | That user's weekly goal |
| `jat.theme`, `jat.palette` | Light/dark mode and colour theme |

Data persists between visits, but it is specific to one browser profile **and one web address**. It disappears if you clear site data or use a private window. Use **Export** regularly to keep a backup.

## Security notes and limitations

This is a client-side project, so the login is a convenience that keeps accounts separate on one device. It is **not** equivalent to server-side authentication:

- Anyone with access to the browser profile (and developer tools) can read or change the stored data.
- There is no password reset, because there is no server to send an email.
- Do not store sensitive or confidential information in it. For anything real, add a backend with proper authentication.

What is done well within those limits: passwords are never stored (PBKDF2-SHA256, 210,000 iterations, per-user salt, constant-time comparison), login errors do not reveal whether an email exists, repeated failures lock the account temporarily, sessions expire when idle, imported files are schema-validated, and job links must be `http(s)` URLs.

## Testing

Unit, component and integration tests cover the Zod schemas, status-change logic and history, statistics, funnel analytics, offer maths, advert parsing and CV matching, CSV and calendar export, filters, the storage hook, password hashing, lockout and sessions, route guards, the sign-up and login pages, the application form, and full-app flows (landing page, demo, log out, undo, offer comparison, dashboard, pasting a job advert).

```bash
npm test
```

## Deploying to GitHub Pages

The repository includes `.github/workflows/deploy.yml`, which runs the tests, builds the site and publishes it.

1. Push the project to a GitHub repository whose default branch is `main`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. The site appears at `https://<your-username>.github.io/<repository-name>/`.

Notes:

- The workflow sets the base path to the repository name automatically. If you deploy to a user site (`<your-username>.github.io`) or a custom domain, change `VITE_BASE` in the workflow to `/`.
- GitHub Pages cannot rewrite routes, so the workflow copies `index.html` to `404.html`. This lets a page refresh on `/board` still load the app.
- Because data lives in each visitor's own browser, every visitor starts with an empty app (or the demo).

## Licence

Add a licence of your choice (for example MIT) before publishing.
