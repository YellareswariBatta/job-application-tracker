# Job Tracker: Application Guide

A plain-language guide to what this application does, how it works and how it is built. You do not need a technical background to read the first half. The second half explains the code for anyone who wants to go deeper.

**Contents**

1. [What it is](#1-what-it-is)
2. [A tour of the pages](#2-a-tour-of-the-pages)
3. [Features explained](#3-features-explained)
4. [Where your data lives](#4-where-your-data-lives)
5. [Security: what is protected and what is not](#5-security-what-is-protected-and-what-is-not)
6. [The rules and calculations](#6-the-rules-and-calculations)
7. [How it is built](#7-how-it-is-built)
8. [The data model](#8-the-data-model)
9. [Testing and quality](#9-testing-and-quality)
10. [Running and deploying](#10-running-and-deploying)
11. [Limitations and future ideas](#11-limitations-and-future-ideas)
12. [Glossary](#12-glossary)

---

## 1. What it is

**Job Tracker** helps someone keep track of every job they apply for. Instead of a messy spreadsheet, each application is a card on a board. You move the card along as things progress: **Applied, Interviewing, Offer, Rejected**.

Around the board there are tools that answer practical questions:

- Which applications need chasing today?
- Which have gone quiet?
- How many of my applications turn into interviews, and which source works best?
- Which of my job offers is really the better deal once commuting and holiday are counted?

It is a **front-end only** application. There is no server and no database: everything runs in the web browser and is stored on the visitor's own device.

---

## 2. A tour of the pages

| Page | Address | Who can see it | What it is for |
| --- | --- | --- | --- |
| Landing page | `/` | Everyone | Introduces the app. Buttons for sign-up, login and the live demo. |
| Log in | `/login` | Signed-out visitors | Enter an existing account. |
| Create account | `/register` | Signed-out visitors | Make a new account. |
| Board | `/board` | Signed-in users | The main workspace: the four columns of cards. |
| Application detail | `/applications/<id>` | Signed-in users | Everything about one application, plus its history. |
| Dashboard | `/dashboard` | Signed-in users | Statistics and charts. |
| Compare offers | `/offers` | Signed-in users | Side-by-side offer comparison. |
| Not found | anything else | Everyone | A friendly "page not found" with a Home button. |

**The usual journey**

```
Landing page ──► Create account (or Try the live demo)
                        │
                        ▼
                  Board  ◄──────────────┐
        add / paste advert / drag cards │
                        │               │
        ┌───────────────┼───────────────┤
        ▼               ▼               ▼
  Application      Dashboard        Compare offers
    detail
```

If a signed-out visitor types a protected address such as `/board`, they are sent to the login page and returned to where they were heading after logging in.

---

## 3. Features explained

### The board
- Four coloured columns. Each card shows the company, role, date applied and salary range.
- **Drag a card** to another column to change its status. It works with a mouse, a finger on a touch screen, or the keyboard.
- **Drag a card to the "Drop here to delete" zone** that appears at the bottom while dragging. The app asks you to confirm.
- A card dropped into **Offer** triggers confetti and a congratulations message.
- Cards show warnings: **Follow-up overdue**, **Follow up today**, or **Quiet for N days**.
- The **search bar and filters** narrow the board by company or role, status and a date range.

### Adding and editing applications
A form with: company and role (required), date applied, status, salary range, job link, **source** (where you found it), follow-up reminder date, interview date and notes. Every field is checked, and clear messages appear for mistakes (for example, "Job link must be a valid URL").

### Paste a job advert
Click **Paste job advert** on the board banner.

1. Paste the text of an advert. The app picks out the role, company, salary and link, and guesses the source (for example LinkedIn).
2. Optionally paste your CV. The app compares important words and shows a **match percentage**, words your CV is missing and words it already covers.
3. **Create application** opens the normal form, pre-filled. Missing keywords are added to the notes.

Your CV is only used inside that window. It is never saved or sent anywhere. The match is a rough word-based guide, not a judgement of your suitability.

### Quick-add bookmarklet
Inside the same window there is a **Save to Job Tracker** button. Drag it to your browser's bookmarks bar. On any job page, clicking it opens the Add form with the page title and link filled in.

### Application detail page
All details and notes, **Edit** and **Delete** buttons, a **status history timeline** (every status the application has been through, newest first), and **Add to calendar** to download its interview and follow-up dates.

### Undo
After deleting, moving, editing or importing, a bar appears at the bottom left with an **Undo** button for about eight seconds. It reverses the most recent change only.

### Dashboard
- **Total applications**, **response rate**, **days to first reply** and **interviews this week**.
- **Status pie chart** and **applications per week** bar chart (last eight weeks).
- **Weekly goal ring**: set a target number of applications per week (default 5) and watch it fill.
- **Hiring funnel**: how many applications reached the interview and offer stages, with conversion percentages.
- **Where replies come from**: reply rate for each source, and which source is currently best.

### Compare offers
Choose two or three applications, then fill in for each: base salary, bonus, employer pension, holiday, remote days per week and commute time. The page shows the yearly package, commuting hours per year and an **effective hourly rate** that counts unpaid commuting time. The best figure in each row is marked, with a summary sentence at the top. It is an estimate before tax, not financial advice.

### Export and import
The **Export** menu offers three downloads:

- **Backup (JSON):** everything, which can be imported again.
- **Spreadsheet (CSV):** opens in Excel or Google Sheets. Cells that could be misread as formulas are made safe.
- **Calendar (.ics):** interviews and follow-ups as all-day events for Google, Outlook or Apple Calendar.

**Import** reads a JSON backup. The file is checked carefully first, and it replaces your current data (after a warning). You can also drag a JSON file anywhere onto the page.

### Look and feel
- **Dark and light mode**, remembered between visits.
- **Five colour themes** (Indigo, Ocean, Emerald, Sunset, Rose) from the palette button.
- Floating bubbles, a welcome banner, animated numbers and, on computers with a mouse, a glowing cursor with a sparkle trail. All motion is switched off for people who have asked their device for reduced motion, and the cursor effects are skipped on touch screens.

### The live demo
**Try the live demo** signs a visitor into a shared demo account with 12 applications from fictional companies. Dates are relative to today so reminders, interviews and charts always look current. A banner explains it and offers **Reset sample data** or **Create my account**.

---

## 4. Where your data lives

Everything is saved in the browser's **localStorage**. Nothing is sent to a server.

| Stored under | What it holds |
| --- | --- |
| `jat.users` | Accounts: name, email, salted password hash |
| `jat.session` | Who is signed in and when the session started and was last used |
| `jat.lockouts` | Failed-login counters |
| `jat.applications.<user id>` | That user's applications |
| `jat.weeklyGoal.<user id>` | That user's weekly goal |
| `jat.theme`, `jat.palette` | Light/dark mode and colour theme |

**What this means in practice**

- Every change is saved immediately. There is no save button.
- Data survives closing the tab and restarting the computer.
- Each account has its own data, so two people on one browser do not see each other's applications.
- Data belongs to **one browser profile and one web address**. A different browser, a different device, a different port (such as `localhost:5173` versus `5174`) or a private window starts empty.
- Clearing site data deletes everything. **Export a backup regularly.**

You can inspect it yourself: press F12, open **Application**, then **Local Storage**.

---

## 5. Security: what is protected and what is not

**What the app does**

- **Passwords are never stored.** Only a one-way, salted scramble (PBKDF2-SHA256 with 210,000 rounds) is kept, compared in a way that does not leak timing.
- **Strong passwords are required:** at least 10 characters with upper case, lower case and a number, with a live strength meter.
- **Lockout:** five wrong attempts lock that email for five minutes. Wrong passwords and unknown emails give the same message, so nobody can use the login to discover which emails have accounts.
- **Sessions expire:** after 30 minutes without activity, or 12 hours in total. Logging out in one tab logs out the others.
- **Protected pages:** signed-out visitors cannot reach the board, dashboard or offers.
- **Imports are validated** (size limit 5 MB, strict shape checks), and job links must start with `http://` or `https://`.
- **CSV files are formula-safe.**

**What it cannot do**

Because there is no server, the login is a convenience that keeps accounts apart on one device. It is **not** equivalent to real server-side authentication:

- Anyone with access to the browser profile and developer tools can read or change stored data.
- There is **no password reset** (there is no server to send an email), so a forgotten password means that account's data cannot be recovered unless you exported a backup.
- It should not hold sensitive or confidential information. For anything real, add a backend with proper authentication.

---

## 6. The rules and calculations

| Item | Rule |
| --- | --- |
| **Response rate** | Share of all applications whose current status is not "Applied", rounded to a whole percent. |
| **Interviews this week** | Applications with an interview date from Monday to Sunday of the current week. Weeks start on Monday. |
| **Applications per week** | The last eight Monday-to-Sunday weeks, with empty weeks shown as zero. |
| **Quiet application** | Status Applied or Interviewing and no movement for 14 days or more. Finished applications are never "quiet". |
| **Follow-up warnings** | "Today" when the reminder date is today, "overdue" when it is in the past. |
| **Funnel** | Counts every application that **ever** reached Interviewing or Offer, using its history. A rejected application that got an interview still counts as interviewed. |
| **Days to first reply** | Average whole days from "Applied" to the first move past it, across applications that have moved. |
| **Reply rate by source** | Applications from a source that moved beyond "Applied", divided by all from that source. A source needs at least two applications to be named "best". |
| **Effective hourly rate** | Package (base + bonus + employer pension) divided by paid working hours plus unpaid commuting hours. |
| **Offer assumptions** | 260 weekdays a year, 8 bank holidays, 7.5-hour days, 25 holiday days if left blank, commute minutes are per office day (return trip). |
| **Weekly goal** | Default 5 applications a week, adjustable from 1 to 50, remembered per user. |
| **Drag sensitivity** | A card must move about 6 pixels before it counts as a drag, so ordinary clicks still open the card. |

Note: the **response rate** uses current status, while the **funnel** uses full history, so a rejected-after-interview application counts as "responded" in the funnel but not in the response rate.

---

## 7. How it is built

### Technology

| Technology | What it does here |
| --- | --- |
| **React 18** | Builds the screens from small reusable pieces called components. |
| **Vite** | Runs the app while developing and bundles it for release. |
| **React Router** | Gives each page its own address and protects the private ones. |
| **Material UI** | Ready-made, accessible interface parts (buttons, dialogs, date pickers), themed in the app's colours. |
| **Tailwind CSS** | Base styling and the dark-mode switch. Most visual styling is Material UI. |
| **dnd-kit** | The drag-and-drop engine, including keyboard support. |
| **React Hook Form + Zod** | Forms, and the rules that check what is typed in (and what is imported). |
| **Recharts** | The pie and bar charts. |
| **Iconify (Lucide icons)** | Icons, bundled into the app so no internet is needed for them. |
| **Web Crypto API** | The browser's built-in password hashing. |
| **Vitest + Testing Library** | Automated tests. |
| **Fonts** | Plus Jakarta Sans and Sora, bundled with the app. |

### The big picture

```
Browser
 └─ App
     ├─ Theme provider        light/dark + colour palette
     ├─ Auth provider         who is signed in; login, logout, sessions
     └─ Routes
         ├─ Public pages      landing, login, register
         └─ Protected shell   (only if signed in)
             ├─ Applications provider   the user's applications + undo
             └─ Layout (header, banners) → Board / Detail / Dashboard / Offers
```

**How a change flows.** You drag a card. The board asks the applications provider to change that card's status. The provider updates the list, records the change in the card's history, remembers the previous list for **Undo**, and saves the new list to localStorage. React then redraws the affected parts of the screen.

### Folder map

```
src/
  App.jsx, main.jsx, ProtectedApp.jsx     routes, entry point, signed-in shell
  components/                             shared pieces: layout, modal, icons, empty states,
                                          bubbles, confetti, and magic/ (cursor effects)
  hooks/                                  useLocalStorage, useCountUp, usePageTitle
  lib/                                    date helpers, file download helper
  features/
    applications/    board, cards, form, filters, status logic, history, schema, context
    auth/            password hashing, sessions, lockout, login and sign-up pages, route guards
    dashboard/       statistics, funnel and source analytics, charts, weekly goal
    offers/          offer comparison page and its maths
    jobhelper/       advert parsing, CV keyword match, bookmarklet
    calendar/        .ics calendar file builder
    data/            export menu, JSON import, CSV
    demo/            sample data and the demo banner
    landing/         landing page
    theme/           light/dark mode and colour palettes
  test/              test set-up
```

Each folder under `features/` is one area of the product. Code that is only logic (no screens), such as the statistics, funnel, offer maths and advert parsing, lives in plain files so it can be tested easily.

### Ideas worth knowing

- **Context providers** share information (the signed-in user, the applications) with any screen that needs it, without passing it down by hand.
- **`useLocalStorage`** is a small custom hook that behaves like normal React state but also saves to, and reads from, localStorage. It copes with corrupt data and a full or blocked store.
- **Per-user storage.** The applications provider is given a storage key containing the user's id, and is remounted when the account changes.
- **Schemas (Zod)** describe what a valid application looks like once, and are reused for the form, for stored data and for imports.
- **Lazy loading.** Everything behind login is downloaded only when needed. The landing page is small and fast, and the charts library only arrives when you open the dashboard.
- **Accessibility.** Controls have labels, drag and drop works from the keyboard, focus is visible, and motion respects the reduced-motion setting.

---

## 8. The data model

One application, as stored:

| Field | Meaning | Required |
| --- | --- | --- |
| `id` | Unique identifier, generated | Yes |
| `company` | Company name (up to 100 characters) | Yes |
| `role` | Job title (up to 100 characters) | Yes |
| `dateApplied` | Date in `YYYY-MM-DD` form | Yes |
| `status` | Applied, Interviewing, Offer or Rejected | Yes |
| `source` | LinkedIn, Indeed, Company website, Referral, Recruiter or agency, Job board or Other | No |
| `salaryMin`, `salaryMax` | Advertised range in pounds (maximum must not be below minimum) | No |
| `jobLink` | A web address starting `http://` or `https://` | No |
| `followUpDate` | Reminder date | No |
| `interviewDate` | Interview date | No |
| `notes` | Free text, up to 5,000 characters | No |
| `history` | List of `{ status, at }`: every status and when it began | Added automatically |
| `offer` | Offer details used by the comparison: base salary, bonus %, pension %, holiday days, remote days, commute minutes | No |
| `createdAt`, `updatedAt` | Timestamps | Added automatically |

A JSON backup is `{ version, exportedAt, applications: [...] }`. Backups made before history and offers existed still import correctly.

---

## 9. Testing and quality

At the time of writing there are **140 automated tests in 20 files**. They cover:

- the validation rules (every form field, imports, history and offer details);
- status changes and history recording, statistics, funnel and source analytics, quiet-application detection;
- offer maths, advert parsing and CV matching, CSV and calendar file creation;
- the storage hook, including corrupt data and a full store;
- password hashing, lockout, session expiry and route protection;
- the sign-up, login and application forms;
- **whole-app journeys** using the real app: landing page, demo, logging out, undoing a delete, the status timeline, comparing offers, the dashboard and pasting a job advert.

Run them with `npm test`. When the project is pushed to GitHub, the deployment workflow runs them first and refuses to publish if any fail.

What the tests do not cover: how things look (spacing, colours, animation), real drag-and-drop with a mouse, the cursor effects, and opening exported files in Excel or a calendar app. Those need checking by eye.

---

## 10. Running and deploying

```powershell
cd C:\Users\Yellareswari.B\job-application-tracker
npm run dev        # start; open the address it prints (usually http://localhost:5173)
npm test           # run the tests
npm run build      # make the release build in dist/
npm run preview    # try the release build locally
```

**Deploying to GitHub Pages** is covered step by step in the main `README.md`. In short: push to a GitHub repository, set **Settings → Pages → Source** to **GitHub Actions**, and the included workflow tests, builds and publishes the site at `https://<username>.github.io/<repository>/`.

---

## 11. Limitations and future ideas

**Current limitations**

- Data lives in one browser only, so there is no sync between devices.
- No password reset, and the login is not server-grade security (see section 5).
- Undo reverses only the latest change.
- The advert reader and CV match are word-based and best-effort.
- Offer comparisons are estimates before tax and use England and Wales bank holidays.
- No browser extension that autofills application forms, and no email or AI features.

**Ideas for the future**

- A backend (for example Supabase or Firebase) for real accounts, password reset and sync across devices.
- Interview-preparation notes and follow-up email templates per application.
- Contacts per application, tags, priorities and an archive.
- A progressive web app so it installs like a mobile app and sends reminders.
- Optional AI help for CV tailoring and cover letters, opt-in because it would send text to a third party.

---

## 12. Glossary

| Term | Meaning |
| --- | --- |
| **Front-end only** | Runs entirely in the browser, with no server of its own. |
| **localStorage** | A small storage area inside the browser that keeps data between visits. |
| **Component** | A reusable piece of screen, such as a card or a button. |
| **Provider / context** | A way for one part of the app to share information with many screens. |
| **Hook** | A reusable piece of React behaviour, such as `useLocalStorage`. |
| **Schema (Zod)** | A written description of valid data, used to check forms and imports. |
| **Hash / salt** | A one-way scramble of a password, with a random extra ingredient so identical passwords look different. |
| **PBKDF2** | A standard, deliberately slow hashing method that makes password guessing expensive. |
| **Session** | The period you stay signed in. |
| **Funnel** | The shrinking path from applying, to interviewing, to receiving an offer. |
| **Bookmarklet** | A bookmark that runs a tiny action on the page you are viewing. |
| **.ics file** | The standard calendar file format that calendar apps can import. |
| **CSV** | A plain table file that spreadsheets can open. |
| **Lazy loading** | Downloading part of the app only when it is first needed. |
| **PWA** | A website that can install and behave like a mobile app. |
