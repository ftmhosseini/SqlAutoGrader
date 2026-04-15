# SQL Auto-Grader — React Web App

A web-based educational platform where **teachers** create SQL assignments and quizzes, and **students** solve them with instant automated feedback. SQL runs entirely in the browser using SQLite WebAssembly — no server-side database required.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Concepts You Need to Know First](#concepts-you-need-to-know-first)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [How the App Starts](#how-the-app-starts)
6. [Authentication Flow](#authentication-flow)
7. [Routing — How Pages Connect](#routing--how-pages-connect)
8. [Global State — AppContext](#global-state--appcontext)
9. [In-Browser SQLite — How SQL Grading Works](#in-browser-sqlite--how-sql-grading-works)
10. [Grading Logic](#grading-logic)
11. [AI Integration — Groq API](#ai-integration--groq-api)
12. [Anti-Cheat System](#anti-cheat-system)
13. [Data Models — Firestore Collections](#data-models--firestore-collections)
14. [Key React Patterns Used](#key-react-patterns-used)
15. [Setup & Running](#setup--running)
16. [Routes Reference](#routes-reference)
17. [First-Time Walkthrough](#first-time-walkthrough)

---

## What This App Does

- **Teachers** create datasets (tables + seed data), multi-question assignments, and quizzes, then assign them to student cohorts.
- **Students** write SQL answers in a code editor, which runs against a live in-memory SQLite database in the browser, and get instant correct/incorrect feedback.
- An **AI tutor** (Groq / llama-3.3-70b) helps students learn SQL through 7 structured lessons with a live sandbox, and generates quiz questions from the sandbox schema.
- An **anti-cheat system** detects tab switching, window blur, and disables copy/paste during assignments.

---

## Concepts You Need to Know First

### What is React?

React is a JavaScript library for building user interfaces. The core idea is that your UI is a **function of your state** — when state changes, React re-renders the affected parts of the page automatically.

```jsx
// A React component is just a function that returns JSX (HTML-like syntax)
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

### useState and useEffect

These are the two most important React hooks:

```jsx
import { useState, useEffect } from 'react';

function AssignmentList() {
  // useState: declare a state variable + a function to update it
  const [assignments, setAssignments] = useState([]);  // starts as empty array
  const [loading, setLoading] = useState(true);

  // useEffect: runs after the component renders
  // The [] dependency array means "run once when the component mounts"
  useEffect(() => {
    fetchAssignments().then(data => {
      setAssignments(data);   // triggers a re-render with the new data
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;
  return <ul>{assignments.map(a => <li key={a.id}>{a.title}</li>)}</ul>;
}
```

### What is Firebase?

Firebase is Google's backend-as-a-service. This app uses:

- **Firebase Auth** — handles user registration and login. You never store passwords yourself.
- **Cloud Firestore** — a NoSQL cloud database. Data is stored as **documents** inside **collections**. Each document is a JSON object.

```
Firestore structure:
  users/{uid}                  ← one doc per user: fullName, email, role
  assignments/{id}             ← title, questions[], due_date, owner_user_id, student_class
  student_assignments/{id}     ← student_user_id, assignment_id, status, earned_point
  question_attempts/{id}       ← student_user_id, question_id, submitted_sql, is_correct
  cohorts/{id}                 ← name, student_uids[], owner_user_id
  quizzes/{id}                 ← title, questionText, answer, student_class
  sqliteConfigs/mainConfig     ← single doc: all dataset SQL statements
```

### What is a Web Worker?

A Web Worker is a JavaScript file that runs in a **background thread**, separate from the main UI thread. This app uses a Web Worker (`public/sqlWorker.js`) to run SQL queries. If a query takes too long, the worker is terminated without freezing the browser tab.

```js
// Main thread: send a message to the worker
worker.postMessage({ type: 'run', sql: 'SELECT * FROM Employees' });

// Main thread: receive the result
worker.onmessage = (e) => {
  if (e.data.type === 'result') console.log(e.data.rows);
};

// Terminate if it takes too long
setTimeout(() => worker.terminate(), 5000);
```

### What is Context in React?

React Context lets you share data across the entire component tree without passing props down manually at every level. This app uses `AppContext` to share the in-memory SQLite database functions globally.

```jsx
// Any component can access the database functions like this:
const { runSelectQuery, allDataset, allTables } = useAppContext();
```

### What is CRACO?

Create React App doesn't support WebAssembly (WASM) out of the box. CRACO (Create React App Configuration Override) lets you customize the webpack config without ejecting. This app uses it to add the WASM MIME type and cross-origin headers needed for `sql.js`.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Firebase Auth | — | Email/password authentication |
| Cloud Firestore | — | Database (user data, assignments, attempts) |
| sql.js | — | SQLite compiled to WebAssembly, runs in browser |
| react-router-dom | v7 | Client-side routing |
| CRACO | — | Webpack config override for WASM |
| Groq API (llama-3.3-70b) | — | AI tutor + question generation |
| Font Awesome 5 | — | Icons |
| Cypress | — | End-to-end testing |

---

## Project Structure

```
src/
├── App.js                          ← Root component, sets up routes
├── firebase.js                     ← Firebase initialization
│
├── data/                           ← DEV ONLY — remove before production
│   ├── devSeed.js                  ← Seed functions for Firestore
│   ├── seedData.json               ← Sample cohorts, assignments, questions
│   └── db-config.json              ← SQLite schema + seed data
│
├── components/
│   ├── bars/
│   │   ├── Navbar.js               ← Top navigation bar (responsive)
│   │   ├── Footer.js
│   │   └── PageTitle.js            ← Sticky secondary topbar with back button
│   │
│   ├── comparison/
│   │   └── resultComparison.js     ← Multiset + ordered result comparison logic
│   │
│   ├── db/
│   │   ├── queryValidation.js      ← SELECT-only enforcement + normalization
│   │   └── service/
│   │       ├── context.js          ← AppContext (global DB state + functions)
│   │       └── setupDatabases.js   ← Web Worker calls, DB initialization
│   │
│   ├── hooks/
│   │   └── useAntiCheat.js         ← Fullscreen, copy/paste, tab detection
│   │
│   ├── model/                      ← All Firestore read/write functions
│   │   ├── assignments.js
│   │   ├── studentAssignments.js
│   │   ├── questions.js
│   │   ├── cohorts.js
│   │   ├── users.js
│   │   ├── quizzes.js
│   │   ├── questionAttempts.js
│   │   └── presetQuestions.js
│   │
│   └── services/
│       ├── aiTutor.js              ← Groq API chat (429 → "finished today's usage")
│       └── aiQuestions.js          ← Groq API question generation from schema
│
├── pages/
│   ├── home/                       ← Public landing page
│   ├── about/                      ← About page
│   ├── login/                      ← Login form
│   ├── register/                   ← Register form (student or teacher)
│   ├── profile/                    ← User profile
│   └── dashboard/
│       ├── layout/                 ← Dashboard shell (sidebar + PageTitle + outlet)
│       ├── leftmenu/               ← Sidebar navigation (role-aware)
│       ├── dashboard/              ← Dashboard home (role-aware cards)
│       ├── student/
│       │   ├── assignments/        ← Assignment list (tabs) + question detail (anti-cheat)
│       │   ├── cohort/             ← Cohort join page
│       │   ├── quizzes/            ← Quiz list + quiz detail
│       │   ├── results/            ← Results list + submitted question detail
│       │   └── tutor/              ← SQL Tutor (lessons + quiz) + floating chat widget
│       └── teacher/
│           ├── assignmentform/     ← AssignmentForm (multi-step) + AssignmentList
│           ├── cohorts/            ← CohortManager
│           ├── datasets/           ← DatabaseManager
│           └── submissionstatus/   ← Per-student attempt viewer + mark override
│
public/
├── sql-wasm.wasm                   ← SQLite WebAssembly binary
├── sql-wasm.js                     ← sql.js loader
└── sqlWorker.js                    ← Web Worker: builds DB, runs queries
```

---

## How the App Starts

**`src/index.js`** — mounts the React app into the HTML page:

```jsx
root.render(
  <AppProvider>       {/* wraps everything with the global DB context */}
    <App />
  </AppProvider>
);
```

**`src/App.js`** — defines all routes and wraps them with `RoleRoute`:

```jsx
// RoleRoute waits for Firebase auth to resolve before rendering
// This prevents a race condition where the page renders before
// we know if the user is logged in
function RoleRoute({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return unsub;  // cleanup: unsubscribe when component unmounts
  }, []);
  if (!ready) return null;
  return children;
}
```

**`src/firebase.js`** — initializes Firebase once and exports `auth` and `db`:

```js
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global auth listener: redirect to home if logged out
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname !== '/') {
    window.location.replace('/');
  }
});
```

---

## Authentication Flow

### Registration (`pages/register/`)

1. User fills in name, email, password, and selects role (student/teacher)
2. `createUserWithEmailAndPassword(auth, email, password)` creates the Firebase Auth account
3. `sendEmailVerification(user)` sends a verification email
4. A user document is written to Firestore: `users/{uid}` with `{ fullName, email, role }`
5. User is redirected to login

### Login (`pages/login/`)

1. `signInWithEmailAndPassword(auth, email, password)`
2. Check `user.emailVerified` — if not verified, show error
3. Fetch user doc from Firestore to get the role
4. Store in `userSession` (a module-level variable, like a global)
5. Redirect to `/dashboard`

### `UserSession` (`components/services/UserSession.js`)

A simple module that holds the current user in memory:

```js
// Any file can import this and call userSession.uid, userSession.role
const userSession = { uid: null, role: null, email: null };
export default userSession;
```

---

## Routing — How Pages Connect

Routes are defined in `App.js` using `react-router-dom v7`. The dashboard uses a **layout route** — `DashboardLayout` is the persistent frame (sidebar + topbar), and `<Outlet />` renders the matched child page inside it.

```jsx
<Route path="/dashboard" element={<RoleRoute><DashboardLayout /></RoleRoute>}>
  <Route index element={<Dashboard />} />
  <Route path="assignments" element={<Assignments />} />
  <Route path="assignments/:id" element={<AssignmentDetail />} />
  {/* ... */}
</Route>
```

**Why layout routes?** The sidebar and topbar don't re-render when you navigate between dashboard pages — only the `<Outlet />` content changes. This is more efficient and avoids layout flicker.

**Navigation in code:**
```jsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard/assignments');       // go to page
navigate(-1);                             // go back
```

---

## Global State — AppContext

`AppContext` (`components/db/service/context.js`) provides database functions to every component without prop drilling.

```jsx
// How to use it in any component:
import { useAppContext } from '../../components/db/service/context';

function MyComponent() {
  const { runSelectQuery, allDataset, allTables } = useAppContext();

  const handleRun = async () => {
    const result = await runSelectQuery('datasetA', 'SELECT * FROM Employees');
    // result: { isSuccessful: true, data: [{ columns: [...], values: [[...]] }] }
  };
}
```

**Available functions:**

| Function | What it does |
|---|---|
| `allDataset()` | Returns all dataset names |
| `allTables(datasetName)` | Returns all table names in a dataset |
| `runSelectQuery(dataset, sql)` | Runs a SELECT query, returns `{ isSuccessful, data, message }` |
| `fetchItems(dataset, sql)` | Fetches rows from a table |
| `createTable(dataset, tableName, columns)` | Creates a new table |
| `getTableSchemaInTable(dataset, table)` | Returns column definitions |

---

## In-Browser SQLite — How SQL Grading Works

This is the core technical feature. SQL runs entirely in the browser using `sql.js` (SQLite compiled to WebAssembly).

### Architecture

```
Firestore (sqliteConfigs/mainConfig)
    ↓  fetch SQL strings on app load
Web Worker (public/sqlWorker.js)
    ↓  execute CREATE TABLE + INSERT INTO statements
In-memory SQLite database
    ↓  run student SQL + expected SQL
Result comparison
    ↓
is_correct: true/false
```

### Web Worker (`public/sqlWorker.js`)

The worker runs in a background thread. The main thread sends messages to it:

```js
// Main thread sends:
{ type: 'init', config: { datasetA: { queries: ['CREATE TABLE...', 'INSERT...'] } } }
{ type: 'run', dbname: 'datasetA', sql: 'SELECT * FROM Employees' }

// Worker replies:
{ type: 'ready' }
{ type: 'result', columns: ['name', 'salary'], values: [['Alice', 50000]] }
{ type: 'error', message: 'no such table: Employees' }
```

**Why a Web Worker?** SQL queries can be slow. Running them in the main thread would freeze the UI. The worker runs independently, and if it takes more than 5 seconds, `worker.terminate()` kills it without affecting the page.

### Query Validation (`components/db/queryValidation.js`)

Before running any student query:

```js
// Only SELECT statements are allowed
function validateQuery(sql) {
  const normalized = sql.trim().toLowerCase();
  if (!normalized.startsWith('select')) {
    return { valid: false, message: 'Only SELECT statements are allowed.' };
  }
  // Block multiple statements (SQL injection prevention)
  if (normalized.includes(';') && normalized.indexOf(';') < normalized.length - 1) {
    return { valid: false, message: 'Multiple statements are not allowed.' };
  }
  return { valid: true };
}
```

---

## Grading Logic

### Result Comparison (`components/comparison/resultComparison.js`)

Grading compares **result sets**, not query text. Two modes:

**Multiset (order ignored):**
```js
// Rows are sorted before comparison so ORDER BY doesn't matter
// Column names are lowercased
// String values are compared case-insensitively
function compareMultiset(studentRows, expectedRows) {
  const normalize = rows => rows.map(r =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()]))
  ).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  return JSON.stringify(normalize(studentRows)) === JSON.stringify(normalize(expectedRows));
}
```

**Ordered (when "Order Matters" is enabled):**
Row order must match exactly.

### Grading Policy (per assignment)

| Policy | Behaviour |
|---|---|
| `best` | Correct attempt wins; if tied, most recent |
| `first` | Earliest submitted attempt is used |
| `latest` | Most recently submitted attempt is used |

```js
// From questionAttempts.js
function pickBetterAttempt(currentBest, candidate) {
  if (candidate.is_correct && !currentBest.is_correct) return candidate;
  if (!candidate.is_correct && currentBest.is_correct) return currentBest;
  // Both same correctness → pick most recent
  return new Date(candidate.submitted_on) > new Date(currentBest.submitted_on)
    ? candidate : currentBest;
}
```

---

## AI Integration — Groq API

### Question Generation (`components/services/aiQuestions.js`)

When a teacher selects a dataset, the app sends the schema to Groq and gets back 5 SQL questions:

```js
async function generateQuestionsFromSchema(schemaMap) {
  const schemaText = Object.entries(schemaMap)
    .map(([table, cols]) => `Table: ${table}\n${cols.map(c => `  ${c.name} ${c.type}`).join('\n')}`)
    .join('\n\n');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Generate 5 SQL questions for:\n${schemaText}\nReturn JSON array only.` }],
    }),
  });
  // Parse and return the JSON array of questions
}
```

### AI Tutor Chat (`components/services/aiTutor.js`)

The floating chat widget sends the conversation history to Groq on each message. If the API returns a 429 (rate limit), it shows "You've finished today's usage" instead of an error.

---

## Anti-Cheat System

The `useAntiCheat` hook (`components/hooks/useAntiCheat.js`) activates during assignments:

```js
function useAntiCheat(assignmentId, enabled) {
  useEffect(() => {
    if (!enabled) return;

    // Prompt fullscreen
    document.documentElement.requestFullscreen();

    // Log violations
    const log = (type) => saveViolation(assignmentId, { type, timestamp: new Date() });

    // Detect tab switch
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) log('tab_switch');
    });

    // Detect window blur (alt+tab, clicking outside)
    window.addEventListener('blur', () => log('window_blur'));

    // Disable copy/paste
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());

    // Disable right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable text selection
    document.body.style.userSelect = 'none';

    return () => { /* cleanup all listeners */ };
  }, [assignmentId, enabled]);
}
```

---

## Data Models — Firestore Collections

### `assignments`
```js
{
  assignment_id: string,
  title: string,
  description: string,
  due_date: 'YYYY-MM-DD',
  dataset: string,           // e.g. 'datasetA'
  student_class: string,     // cohort_id
  questions: [{
    question_id: string,
    question: string,
    answer: string,          // expected SQL
    mark: number,
    max_attempts: number,
    orderMatters: boolean,
    aliasStrict: boolean,
    difficulty: string,
  }],
  total_marks: number,
  grading_policy: 'best' | 'first' | 'latest',
  owner_user_id: string,
  created_on: Timestamp,
}
```

### `student_assignments`
```js
{
  student_assignment_id: string,
  assignment_id: string,
  student_user_id: string,
  status: 'assigned' | 'submitted' | 'completed',
  assigned_on: Timestamp,
  submissionDate: Timestamp | null,
  due_on: 'YYYY-MM-DD',
  earned_point: number,      // set by grading or teacher override
}
```

### `question_attempts`
```js
{
  attempt_id: string,
  question_id: string,
  student_user_id: string,
  submitted_sql: string,
  is_correct: boolean,
  submitted_on: Timestamp,
}
```

### `cohorts`
```js
{
  cohort_id: string,         // also the join code (document ID)
  name: string,
  owner_user_id: string,
  student_uids: string[],
}
```

### `sqliteConfigs/mainConfig`
```js
{
  db: { queries: ['INSERT INTO Datasets...', 'INSERT INTO Tables...'] },
  datasetA: { queries: ['CREATE TABLE Employees...', 'INSERT INTO Employees...'] },
  datasetB: { queries: ['CREATE TABLE Customers...', ...] },
}
```

---

## Key React Patterns Used

### Custom Hooks

Reusable logic extracted into functions starting with `use`:

```js
// useAntiCheat.js — encapsulates all anti-cheat event listeners
function useAntiCheat(assignmentId, enabled) {
  useEffect(() => { /* setup */ return () => { /* cleanup */ }; }, [assignmentId, enabled]);
}

// Usage in a component:
useAntiCheat(assignment.id, isAssignmentActive);
```

### useCallback for stable function references

```js
// Without useCallback, a new function is created on every render,
// causing child components to re-render unnecessarily
const runQuery = useCallback(async (sql) => {
  return await worker.run(sql);
}, []); // [] = never recreate this function
```

### Conditional rendering patterns

```jsx
// Pattern 1: early return
if (loading) return <Spinner />;
if (error) return <ErrorMessage text={error} />;

// Pattern 2: inline ternary
{loading ? <Spinner /> : <DataTable rows={rows} />}

// Pattern 3: short-circuit (only render if truthy)
{error && <p className="text-danger">{error}</p>}
```

### Async data fetching in useEffect

```js
useEffect(() => {
  // Can't make useEffect itself async, so define an inner async function
  const load = async () => {
    const data = await fetchAssignments(userSession.uid);
    setAssignments(data);
  };
  load();
}, []); // run once on mount
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication (email/password) and Firestore enabled
- A free [Groq API key](https://console.groq.com)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

### 3. Deploy Firestore security rules
```bash
firebase deploy --only firestore:rules
```

### 4. Run
```bash
npm start
```

### 5. Run tests
```bash
npm run cypress:open   # interactive browser
npm run cypress:run    # headless CI mode
```

---

## Routes Reference

| Path | Access | Component |
|---|---|---|
| `/` | Public | Home |
| `/about` | Public | About |
| `/register` | Public | Register |
| `/login` | Public | Login |
| `/dashboard` | Both | Dashboard home |
| `/dashboard/assignments` | Student | Assignment list |
| `/dashboard/assignments/:id` | Student | Assignment detail (anti-cheat) |
| `/dashboard/quizzes` | Student | Quiz list |
| `/dashboard/quizzes/:id` | Student | Quiz detail |
| `/dashboard/results` | Student | Results list |
| `/dashboard/results/:id` | Student | Submitted question detail |
| `/dashboard/cohorts` | Student | Cohort join page |
| `/dashboard/tutor` | Student | SQL Tutor (lessons + quiz) |
| `/dashboard/assignments` | Teacher | Assignment list + create form |
| `/dashboard/cohorts` | Teacher | Cohort manager |
| `/dashboard/datasets` | Teacher | Dataset manager |
| `/dashboard/submissionstatus` | Teacher | Submission status |
| `/dashboard/profile` | Both | Profile |

---

## First-Time Walkthrough

1. **Register as teacher** → creates `users/{uid}` in Firestore with `role: 'teacher'`
2. **Datasets** → go to Dataset Manager, create a dataset, add tables, define columns, insert rows
3. **Cohorts** → create a cohort; the document ID becomes the join code
4. **Assignments** → create an assignment: pick dataset, AI generates questions, assign to cohort, save → then click **Publish Now** to distribute to students
5. **Register as student** (different account) → verify email → join cohort with the code
6. **Student: Assignments** → open assignment, write SQL in the editor, run it, submit
7. **Teacher: Submission Status** → see each student's result, override marks if needed

---

## Shared Firebase Database

This React app shares the same Firestore database with the companion Flutter mobile app. Both apps read and write to the same collections. Firestore security rules (`firestore.rules`) enforce:

- Users can only read/write their own profile
- Students can only create attempts for themselves; `is_correct` must be `false` on create
- Teachers can override attempt marks
- Only teachers can write assignments, cohorts, questions, datasets
- All authenticated users can read assignments and datasets
