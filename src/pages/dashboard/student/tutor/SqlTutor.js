import { useState, useEffect, useRef } from "react";
import { askSqlTutor } from "../../../../components/services/aiTutor";
import { generateQuestionsFromSchema } from "../../../../components/services/aiQuestions";
import { initSQL } from "../../../../components/db/setup/setupFirebaseDb";
import userSession from "../../../../components/services/UserSession";
import { PageTitle } from "../../../../components/bars/PageTitle";
import "./SqlTutor.css";

// ── Sandbox DB schema ──────────────────────────────────────────────────────────
const SANDBOX_SCHEMA = {
  Students: [
    { name: "studentId", type: "INTEGER", primaryKey: true },
    { name: "name",      type: "VARCHAR" },
    { name: "age",       type: "INTEGER" },
    { name: "city",      type: "VARCHAR" },
  ],
  Grades: [
    { name: "gradeId",   type: "INTEGER", primaryKey: true },
    { name: "studentId", type: "INTEGER", foreignKey: true },
    { name: "subject",   type: "VARCHAR" },
    { name: "score",     type: "INTEGER" },
  ],
};

const SANDBOX_SEED = [
  "CREATE TABLE Students (studentId INTEGER PRIMARY KEY, name VARCHAR, age INTEGER, city VARCHAR)",
  "CREATE TABLE Grades (gradeId INTEGER PRIMARY KEY, studentId INTEGER, subject VARCHAR, score INTEGER, FOREIGN KEY(studentId) REFERENCES Students(studentId))",
  "INSERT INTO Students VALUES (1,'Alice',20,'Toronto'),(2,'Bob',22,'Calgary'),(3,'Carol',21,'Vancouver'),(4,'Dan',23,'Ottawa')",
  "INSERT INTO Grades VALUES (1,1,'Math',88),(2,1,'Science',92),(3,2,'Math',75),(4,2,'Science',68),(5,3,'Math',95),(6,3,'Science',80),(7,4,'Math',60),(8,4,'Science',72)",
];

// ── Lessons ────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: "select",
    title: "SELECT – Fetch Data",
    explanation: `SELECT retrieves rows from a table.\n\nSyntax:\n  SELECT column1, column2 FROM table;\n  SELECT * FROM table;  -- all columns\n\nExample: Get all students.`,
    starter: "SELECT * FROM Students;",
  },
  {
    id: "where",
    title: "WHERE – Filter Rows",
    explanation: `WHERE filters rows by a condition.\n\nSyntax:\n  SELECT * FROM table WHERE condition;\n\nExample: Students older than 21.`,
    starter: "SELECT * FROM Students WHERE age > 21;",
  },
  {
    id: "create",
    title: "CREATE TABLE",
    explanation: `CREATE TABLE defines a new table.\n\nSyntax:\n  CREATE TABLE name (col type, ...);\n\nExample: Create a Courses table.`,
    starter: "CREATE TABLE Courses (courseId INTEGER PRIMARY KEY, title VARCHAR);",
  },
  {
    id: "insert",
    title: "INSERT – Add Rows",
    explanation: `INSERT adds new rows to a table.\n\nSyntax:\n  INSERT INTO table (cols) VALUES (vals);\n\nExample: Add a student.`,
    starter: "INSERT INTO Students (studentId, name, age, city) VALUES (5, 'Eve', 19, 'Halifax');",
  },
  {
    id: "drop",
    title: "DROP TABLE – Delete a Table",
    explanation: `DROP TABLE removes a table entirely.\n\nSyntax:\n  DROP TABLE table_name;\n\nExample: Drop the Courses table (create it first!).`,
    starter: "CREATE TABLE Temp (id INTEGER);\nDROP TABLE Temp;",
  },
  {
    id: "aggregate",
    title: "Aggregate Functions",
    explanation: `Aggregate functions compute a value over many rows.\n\nFunctions: COUNT, SUM, AVG, MIN, MAX\n\nExample: Average score per subject.`,
    starter: "SELECT subject, AVG(score) AS avg_score FROM Grades GROUP BY subject;",
  },
  {
    id: "join",
    title: "JOIN – Combine Tables",
    explanation: `JOIN links rows from two tables on a matching column.\n\nSyntax:\n  SELECT ... FROM A JOIN B ON A.col = B.col;\n\nExample: Student names with their scores.`,
    starter: "SELECT s.name, g.subject, g.score\nFROM Students s\nJOIN Grades g ON s.studentId = g.studentId;",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function buildSandboxDb(SQL) {
  const db = new SQL.Database();
  for (const q of SANDBOX_SEED) db.run(q);
  return db;
}

function runQuery(db, sql) {
  try {
    const stmts = sql.split(";").map(s => s.trim()).filter(Boolean);
    let last = null;
    for (const s of stmts) last = db.exec(s);
    return { ok: true, result: last };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function ResultTable({ result }) {
  if (!result || result.length === 0) return <p style={{ color: "#888", fontSize: 13 }}>Query ran successfully (no rows returned).</p>;
  const { columns, values } = result[0];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
        <thead>
          <tr>{columns.map(c => <th key={c} style={thStyle}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>{row.map((v, j) => <td key={j} style={tdStyle}>{String(v ?? "")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "4px 8px", background: "#f5f5f5", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "4px 8px" };

// ── Lesson Tab ─────────────────────────────────────────────────────────────────
function LessonTab({ db, onRun }) {
  const [idx, setIdx] = useState(0);
  const [sql, setSql] = useState(LESSONS[0].starter);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");

  const lesson = LESSONS[idx];

  const selectLesson = (i) => {
    setIdx(i);
    setSql(LESSONS[i].starter);
    setOutput(null);
    setError("");
  };

  const run = () => {
    if (!db) return;
    const { ok, result, error: err } = runQuery(db, sql);
    if (ok) { setOutput(result); setError(""); }
    else { setError(err); setOutput(null); }
    onRun();
  };

  return (
    <div className="tutor-lesson-layout" style={{ display: "flex", gap: 16 }}>
      {/* Sidebar */}
      <div className="tutor-lesson-sidebar" style={{ width: 180, flexShrink: 0 }}>
        {LESSONS.map((l, i) => (
          <div key={l.id} onClick={() => selectLesson(i)}
            style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 4,
              background: i === idx ? "#4e73df" : "#f0f0f0", color: i === idx ? "#fff" : "#333", fontSize: 13 }}>
            {l.title}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <h5 style={{ margin: 0 }}>{lesson.title}</h5>
        <pre style={{ background: "#f8f8f8", padding: 12, borderRadius: 6, fontSize: 13, whiteSpace: "pre-wrap", overflowX: "auto" }}>{lesson.explanation}</pre>

        <textarea value={sql} onChange={e => setSql(e.target.value)} rows={4}
          style={{ fontFamily: "monospace", fontSize: 13, padding: 8, borderRadius: 6, border: "1px solid #ccc", resize: "vertical", width: "100%" }} />

        <button onClick={run} style={{ alignSelf: "flex-start", background: "#4e73df", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", cursor: "pointer" }}>
          ▶ Run
        </button>

        {error && <p style={{ color: "red", fontSize: 13 }}>❌ {error}</p>}
        {output !== null && <ResultTable result={output} />}
      </div>
    </div>
  );
}

// ── Quiz Tab ───────────────────────────────────────────────────────────────────
function QuizTab({ db }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [sql, setSql] = useState("");
  const [feedback, setFeedback] = useState(null); // {correct, studentRows, expectedRows, error}
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuestions([]);
    setScore(0);
    setCurrent(0);
    setDone(false);
    setFeedback(null);
    setSql("");
    setAnswered(false);
    try {
      // build live schema — only tables that have data
      const liveSchema = {};
      const res = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table'");
      if (res.length) {
        for (const [name, ddl] of res[0].values) {
          try {
            const countRes = db.exec(`SELECT COUNT(*) FROM "${name}"`);
            if (!countRes.length || countRes[0].values[0][0] === 0) continue;
          } catch { continue; }
          const match = ddl?.match(/\((.+)\)$/s);
          if (!match) continue;
          const fkCols = new Set([...match[1].matchAll(/FOREIGN KEY\s*\((\w+)\)/gi)].map(m => m[1].toLowerCase()));
          liveSchema[name] = match[1].split(",").map(c => c.trim())
            .filter(c => !/^(FOREIGN|PRIMARY)\s+KEY/i.test(c))
            .map(c => {
              const parts = c.split(/\s+/);
              return { name: parts[0], type: parts[1] || "", primaryKey: /PRIMARY KEY/i.test(c), foreignKey: fkCols.has(parts[0].toLowerCase()) };
            });
        }
      }
      const qs = await generateQuestionsFromSchema(Object.keys(liveSchema).length ? liveSchema : SANDBOX_SCHEMA);
      const seen = new Set();
      const unique = qs.filter(q => {
        const key = q.answer?.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setQuestions(unique.slice(0, 8));
    } catch (e) {
      const msg = e.message?.includes('429')
        ? "⚠️ AI question generation is temporarily unavailable due to usage limits. Please try again in a few minutes."
        : "⚠️ " + e.message;
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!db || answered) return;
    const q = questions[current];
    const student = runQuery(db, sql);
    const expected = runQuery(db, q.answer);

    if (!student.ok) {
      setFeedback({ correct: false, error: student.error });
      setAnswered(true);
      return;
    }

    // compare as JSON strings (simple multiset)
    const normalize = (res) => {
      if (!res || res.length === 0) return "[]";
      const rows = res[0].values.map(r => [...r].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return JSON.stringify(rows);
    };

    const correct = normalize(student.result) === normalize(expected.result);
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, studentRows: student.result, expectedRows: expected.result, correctSql: q.answer });
    setAnswered(true);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSql("");
    setFeedback(null);
    setAnswered(false);
  };

  if (loading) return <p style={{ color: "#888" }}>⏳ Generating quiz questions...</p>;

  if (questions.length === 0) {
    const tableNames = (() => {
      try {
        const res = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        return res.length ? res[0].values.map(r => r[0]).join(", ") : "none";
      } catch { return "none"; }
    })();
    return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <p style={{ color: "#555" }}>Tables in sandbox: <strong>{tableNames}</strong><br />AI will generate questions based on the live schema.</p>
      <button onClick={generate} style={{ background: "#4e73df", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 15, cursor: "pointer" }}>
        🎯 Generate Quiz
      </button>
    </div>
  );}

  if (done) return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h4>Quiz Complete! 🎉</h4>
      <p style={{ fontSize: 18 }}>Score: <strong>{score} / {questions.length}</strong></p>
      <button onClick={generate} style={{ background: "#4e73df", color: "#fff", border: "none", borderRadius: 8, padding: "8px 22px", cursor: "pointer" }}>
        Try Again
      </button>
    </div>
  );

  const q = questions[current];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#888" }}>Question {current + 1} of {questions.length}</span>
        <span style={{ fontSize: 13, color: "#4e73df" }}>Score: {score}</span>
      </div>

      <div style={{ background: "#f8f8f8", padding: 12, borderRadius: 8, fontSize: 14 }}>{q.question}</div>

      <textarea value={sql} onChange={e => setSql(e.target.value)} rows={4} disabled={answered}
        placeholder="Write your SQL query here..."
        style={{ fontFamily: "monospace", fontSize: 13, padding: 8, borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }} />

      <div style={{ display: "flex", gap: 8 }}>
        {!answered && (
          <button onClick={submit} disabled={!sql.trim()}
            style={{ background: "#4e73df", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", cursor: "pointer" }}>
            Submit
          </button>
        )}
        {answered && (
          <button onClick={next}
            style={{ background: "#1cc88a", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", cursor: "pointer" }}>
            {current + 1 >= questions.length ? "See Results" : "Next →"}
          </button>
        )}
      </div>

      {feedback && (
        <div style={{ background: feedback.correct ? "#e8f8f0" : "#fff0f0", border: `1px solid ${feedback.correct ? "#1cc88a" : "#e74c3c"}`, borderRadius: 8, padding: 12 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: feedback.correct ? "#1cc88a" : "#e74c3c" }}>
            {feedback.correct ? "✅ Correct!" : "❌ Incorrect"}
          </p>
          {feedback.error && <p style={{ color: "red", fontSize: 13 }}>Error: {feedback.error}</p>}
          {!feedback.correct && !feedback.error && (
            <>
              <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Correct answer:</strong></p>
              <pre style={{ background: "#f0f0f0", padding: "6px 10px", borderRadius: 6, fontSize: 12, margin: "0 0 8px" }}>{feedback.correctSql}</pre>
              <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Your output:</strong></p>
              <ResultTable result={feedback.studentRows} />
              <p style={{ fontSize: 13, margin: "8px 0 4px" }}><strong>Expected output:</strong></p>
              <ResultTable result={feedback.expectedRows} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Schema sidebar ─────────────────────────────────────────────────────────────
function SchemaSidebar({ db, tick }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!db) return;
    try {
      const res = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table'");
      if (!res.length) { setTables([]); return; }
      setTables(res[0].values.map(([name, ddl]) => {
        const match = ddl?.match(/\((.+)\)$/s);
        if (!match) return { name, cols: [] };
        const fkCols = new Set([...match[1].matchAll(/FOREIGN KEY\s*\((\w+)\)/gi)].map(m => m[1].toLowerCase()));
        const cols = match[1].split(",").map(c => c.trim())
          .filter(c => !/^(FOREIGN|PRIMARY)\s+KEY/i.test(c))
          .map(c => {
            const parts = c.split(/\s+/);
            return { name: parts[0], type: parts[1] || "", pk: /PRIMARY KEY/i.test(c), fk: fkCols.has(parts[0].toLowerCase()) };
          });
        return { name, cols };
      }));
    } catch { setTables([]); }
  }, [db, tick]);

  return (
    <div className="tutor-schema-sidebar" style={{ width: 180, flexShrink: 0, background: "#f8f8f8", borderRadius: 8, padding: 12, fontSize: 12 }}>
      <strong style={{ fontSize: 13 }}>📋 Live Schema</strong>
      <div className="tutor-schema-tables">
      {tables.map(({ name, cols }) => (
        <div key={name} style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 600, color: "#4e73df" }}>{name}</div>
          {cols.map(c => (
            <div key={c.name} style={{ paddingLeft: 8, color: "#555" }}>
              {c.name} <span style={{ color: "#aaa" }}>{c.type}</span>
              {c.pk && <span style={{ color: "#e67e22", marginLeft: 4 }}>PK</span>}
              {c.fk && <span style={{ color: "#8e44ad", marginLeft: 4 }}>FK</span>}
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SqlTutor() {
  const [tab, setTab] = useState("lessons");
  const [db, setDb] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    initSQL().then(SQL => setDb(buildSandboxDb(SQL)));
  }, []);

  const onRun = () => setTick(t => t + 1);

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: "8px 20px", border: "none", borderBottom: tab === id ? "3px solid #4e73df" : "3px solid transparent",
      background: "none", fontWeight: tab === id ? 700 : 400, color: tab === id ? "#4e73df" : "#555", cursor: "pointer", fontSize: 14,
    }}>{label}</button>
  );

  return (
    <>
    {/* <div style={{ maxWidth: 1000, margin: "0 auto" }}> */}
<PageTitle title={"📚 SQL Tutor"}/>
      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: 20, marginLeft:20 }}>
        {tabBtn("lessons", "📖 Lessons")}
        {tabBtn("quiz",    "🎯 Quiz")}
      </div>

      <div className="tutor-main-layout" style={{ display: "flex", gap: 16 }}>
        <SchemaSidebar db={db} tick={tick} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {!db && <p style={{ color: "#888" }}>Loading sandbox database...</p>}
          <div style={{ display: tab === "lessons" ? "block" : "none" }}>
            {db && <LessonTab db={db} onRun={onRun} />}
          </div>
          <div style={{ display: tab === "quiz" ? "block" : "none" }}>
            {db && <QuizTab db={db} />}
          </div>
        </div>
      </div>
    {/* </div> */}
    </>
  );
}
