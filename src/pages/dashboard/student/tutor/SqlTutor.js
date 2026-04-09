import { useState, useRef, useEffect } from "react";
import { askSqlTutor } from "../../../../components/services/aiTutor";

const SUGGESTED = [
  "What is a JOIN and when should I use it?",
  "Explain GROUP BY with an example",
  "What's the difference between WHERE and HAVING?",
  "How do subqueries work?",
  "What are aggregate functions?",
];

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "#4e73df" : "#f0f0f0",
        color: isUser ? "#fff" : "#333",
        whiteSpace: "pre-wrap",
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        {text}
      </div>
    </div>
  );
}

function SqlTutor() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const send = async (message) => {
    const text = message ?? input.trim();
    if (!text) return;
    setInput("");

    const userMsg = { role: "user", text };
    setHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await askSqlTutor(history, text);
      setHistory((prev) => [...prev, { role: "model", text: reply }]);
    } catch (e) {
      console.error("askSqlTutor error:", e);
      setHistory((prev) => [...prev, { role: "model", text: "⚠️ Error: " + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 800, margin: "0 auto" }}>
      <h4 className="mb-3">🤖 SQL Tutor</h4>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: 8 }}>
        {history.length === 0 && (
          <div>
            <p className="text-muted text-center mt-4">Ask me anything about SQL! Try one of these:</p>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
              {SUGGESTED.map((s) => (
                <button key={s} className="btn btn-outline-primary btn-sm" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {history.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ padding: "10px 14px", background: "#f0f0f0", borderRadius: "18px 18px 18px 4px", color: "#888", fontSize: 14 }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="d-flex mt-2 gap-2">
        <textarea
          className="form-control"
          rows={2}
          placeholder="Ask a SQL question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={loading}
          style={{ resize: "none" }}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ whiteSpace: "nowrap" }}>
          Send
        </button>
      </div>
      <p className="text-muted small mt-1">Press Enter to send, Shift+Enter for new line</p>
    </div>
  );
}

export default SqlTutor;
