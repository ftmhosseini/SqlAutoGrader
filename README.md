# SQL Auto-Grader Lite

A web-based educational platform for learning SQL through hands-on practice. SQL runs entirely in the browser using SQLite WASM — no server-side database required. Students get instant automated feedback by comparing their query results against hidden reference solutions.

---

## Tech Stack

- **React 19** — UI framework
- **Firebase** — Authentication (email/password) + Firestore (user data, assignments, questions)
- **sql.js** — SQLite compiled to WebAssembly, runs SQL in the browser via Web Worker
- **react-router-dom v7** — Client-side routing
- **CRACO** — Create React App config override (for WASM support)
- **Font Awesome 5** — Icons
- **Groq API (llama-3.3-70b)** — AI-powered SQL tutor and question generation
- **Cypress** — End-to-end testing

---

## Features

### Authentication
- Register as **student** or **teacher**
- Email verification required before login
- Firebase Auth + Firestore stores user profile (name, email, role)

### Student Dashboard
- **Assignments** — View and start SQL assignments with status tracking; tabs for active and submitted
- **Quizzes** — View quiz list with status badges (New / Due / Completed) and marks
- **Results** — View grades, marks, percentage per assignment; graded by the assignment's grading policy
- **Cohorts** — Join cohorts via code; suggests `SIM77` (Test Cohort) if not yet a member
- **SQL Tutor** — AI-powered chat widget (floating bubble on all pages) + full tutor page with:
  - **Lessons tab** — 7 structured lessons (SELECT, WHERE, CREATE, INSERT, DROP, Aggregates, JOIN) with live sandbox SQL editor; schema sidebar updates live as tables are created/dropped
  - **Quiz tab** — AI generates questions from the live sandbox schema; graded instantly with correct answer shown on wrong submissions
- **Anti-cheat system** — Disables copy/paste, right-click, text selection; detects tab switching and window blur; prompts fullscreen on assignment start

### Teacher Dashboard
- **Datasets** — Create and manage datasets and tables; define schemas via column builder; insert/fetch data; empty state messages; duplicate table name prevention
- **Cohorts** — Group students into cohorts; join code management
- **Assignments** — Create multi-step assignments with:
  - Title, description, due date, grading policy (best / first / latest attempt)
  - Assign to a student cohort
  - AI-generated preset questions from dataset schema (via Groq API)
  - Per-question settings: difficulty, max attempts, marks, order matters, alias strict
  - Shared SQL code editor to test queries while building questions
- **Edit Questions** — Expand any assignment to edit its questions inline
- **Submission Status** — View per-student attempt results and override marks

### UI / UX
- **Responsive design** — All pages adapt to mobile; navbar collapses to hamburger with user profile header in mobile menu
- **PageTitle component** — Sticky secondary topbar with page title and ← Back button on every dashboard page
- **Role-aware routing** — `RoleRoute` waits for Firebase auth before rendering student vs teacher views (fixes race condition)

---

## Grading System

### Query Execution
- Only `SELECT` statements are allowed; multi-statement queries are blocked
- Student queries are lower-cased before execution
- SQL runs in a **Web Worker** — long-running queries are terminated via `worker.terminate()` after 5 seconds without freezing the UI

### Result Comparison
- Grading compares result sets, not query text
- Rows compared as a **multiset** (order ignored unless *Order Matters* is enabled per question)
- Column names normalized to lowercase
- String values compared case-insensitively

### Grading Policy (per assignment)
| Policy | Behaviour |
|---|---|
| **Best** | Correct attempt wins; if tied, most recent |
| **First** | Earliest submitted attempt is used |
| **Latest** | Most recently submitted attempt is used |

---

## SQL Tutor — Sandbox Database

The tutor uses an isolated in-memory SQLite database (separate from Firestore datasets):

| Table | Columns |
|---|---|
| **Students** | studentId (PK), name, age, city |
| **Grades** | gradeId (PK), studentId (FK), subject, score |

- Students can CREATE/DROP/INSERT freely without affecting any real data
- The live schema sidebar reflects all changes in real time
- The Quiz tab generates questions only from tables that have data

---

## Database Architecture

Datasets are **not** stored as physical `.sqlite` files. Instead:
- Dataset schemas and seed data are defined as SQL statements stored in Firestore (`sqliteConfigs/mainConfig`)
- On each app load, the config is fetched and builds **in-memory SQLite databases** using `sql.js`
- Teachers can add new datasets/tables dynamically — changes are saved back to Firestore
- Duplicate `CREATE TABLE` errors on reload are silently skipped (tables already exist in config)

### Bundled Datasets
| Dataset | Tables | Use |
|---|---|---|
| **datasetA** | Employees, Departments | Joins, filters, aggregates, subqueries, window functions |
| **datasetB** | Customers, Orders | Subqueries, grouping, date filters, totals, window functions |

---

## Security

Firestore security rules (`firestore.rules`) enforce:
- Users can only read/write their own profile
- Students can only create attempts for themselves; `is_correct` must be `false` on create (grading is client-side)
- Teachers can override attempt marks
- Only teachers can write assignments, cohorts, questions, datasets, and preset questions
- All authenticated users can read assignments and datasets

---

## Project Structure

```
src/
├── data/                       # DEV ONLY seed files (remove before production push)
│   ├── devSeed.js              # All seed functions — delete this before pushing to GitHub
│   ├── seedData.json           # Sample cohorts, assignments, questions
│   └── db-config.json          # SQLite schema + seed data for in-browser databases
│
├── components/
│   ├── bars/                   # Navbar, Footer, PageTitle, components.css
│   ├── comparison/             # SQL result comparison logic (multiset + ordered)
│   ├── db/
│   │   ├── queryValidation.js  # SELECT-only enforcement + query normalization
│   │   ├── service/            # AppContext (global DB state), setupDatabases (Web Worker calls)
│   │   └── setup/              # Firebase DB setup
│   ├── hooks/                  # useAntiCheat hook (fullscreen, copy/paste, tab detection)
│   ├── model/                  # Firestore data models (assignments, questions, cohorts, attempts)
│   └── services/
│       ├── aiTutor.js          # Groq API — chat tutor (429 → "finished today's usage")
│       └── aiQuestions.js      # Groq API — generate quiz questions from schema
│
├── pages/
│   ├── home/
│   ├── about/
│   ├── login/
│   ├── register/
│   ├── profile/
│   └── dashboard/
│       ├── layout/             # Dashboard shell (sidebar + sticky PageTitle topbar + outlet)
│       ├── leftmenu/           # Sidebar navigation
│       ├── dashboard/          # Dashboard home (role-aware cards)
│       ├── student/
│       │   ├── assignments/    # Assignments list (tabs) + anti-cheat question detail
│       │   ├── cohort/         # Cohort join page with SIM77 suggestion
│       │   ├── quizzes/        # Quiz list + quiz detail
│       │   ├── results/        # Results list + submitted questions detail
│       │   └── tutor/          # SqlTutor (lessons + quiz) + SqlTutorWidget (floating chat)
│       └── teacher/
│           ├── assignmentform/ # AssignmentForm (multi-step) + AssignmentList
│           ├── cohorts/        # CohortManager
│           ├── datasets/       # DatabaseManager (create/schema/insert/fetch)
│           └── submissionstatus/ # Per-student attempt viewer + mark override
│
public/
├── sql-wasm.wasm               # SQLite WASM binary
├── sql-wasm.js                 # sql.js loader (used by Web Worker)
└── sqlWorker.js                # Web Worker — builds DB from Firestore config, runs queries

cypress/
└── e2e/                        # Cypress end-to-end tests (login, navigation, all pages)

firestore.rules                 # Firestore security rules
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication and Firestore enabled
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Install
```bash
npm install
```

### Configure Environment
Create a `.env` file in the project root:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Run
```bash
npm start
```

### Run Tests
```bash
npm run cypress:open   # interactive
npm run cypress:run    # headless
```

### First-Time Setup
1. Log in as a teacher
2. Go to **Dataset Manager** and create datasets/tables, or upload `db-config.json` via the seed function
3. Students can join the **Test Cohort** using code `SIM77`

---

## Routes

| Path | Access | Component |
|---|---|---|
| `/` | Public | Home |
| `/about` | Public | About |
| `/register` | Public | Register |
| `/login` | Public | Login |
| `/dashboard` | Protected | Dashboard (role-aware) |
| `/dashboard/assignments` | Student | Assignments list (tabs) |
| `/dashboard/assignments/:id` | Student | Assignment detail (anti-cheat) |
| `/dashboard/quizzes` | Student | Quizzes list |
| `/dashboard/quizzes/:id` | Student | Quiz detail |
| `/dashboard/results` | Student | Results |
| `/dashboard/results/:id` | Student | Submitted questions detail |
| `/dashboard/cohorts` | Student | Cohort join page |
| `/dashboard/tutor` | Student | SQL Tutor (lessons + quiz) |
| `/dashboard/assignments` | Teacher | Assignment list + create form |
| `/dashboard/cohorts` | Teacher | Cohort manager |
| `/dashboard/datasets` | Teacher | Dataset manager |
| `/dashboard/submissionstatus` | Teacher | Submission status |
| `/dashboard/profile` | Both | Profile |

---

## Anti-Cheat System

During assignments, `useAntiCheat` hook:
- Prompts fullscreen on question load; logs `exited_fullscreen` if student exits
- Disables text selection, copy, and paste
- Detects tab switching (`visibilitychange`) and window blur
- Disables right-click context menu
- Logs each violation with a timestamp
