import { useState, useRef, useEffect } from "react";
import { askSqlTutor } from "../../../../components/services/aiTutor";

const SUGGESTED = [
  "What is a JOIN?",
  "Explain GROUP BY",
  "WHERE vs HAVING?",
  "How do subqueries work?",
];

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{
        maxWidth: "80%", padding: "8px 12px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#4e73df" : "#f0f0f0",
        color: isUser ? "#fff" : "#333",
        whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5,
      }}>{text}</div>
    </div>
  );
}

export default function SqlTutorWidget() {
  const [open, setOpen] = useState(false);
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
      setHistory((prev) => [...prev, { role: "model", text: "⚠️ " + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div style={{
          width: 360, height: 500, background: "#fff", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", display: "flex",
          flexDirection: "column", marginBottom: 12, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "#4e73df", color: "#fff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>🤖 SQL Tutor</span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {history.length === 0 && (
              <div>
                <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginTop: 8 }}>Ask me anything about SQL!</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {SUGGESTED.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      style={{ fontSize: 12, padding: "4px 10px", borderRadius: 12, border: "1px solid #4e73df", background: "#fff", color: "#4e73df", cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {history.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
            {loading && (
              <div style={{ color: "#888", fontSize: 13, padding: "6px 12px", background: "#f0f0f0", borderRadius: "16px 16px 16px 4px", display: "inline-block" }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1, border: "1px solid #ddd", borderRadius: 20, padding: "6px 12px", fontSize: 13, outline: "none" }}
              placeholder="Ask a SQL question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{ background: "#4e73df", color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setOpen((o) => !o)} style={{
        width: 52, height: 52, borderRadius: "50%", background: "#4e73df",
        color: "#fff", border: "none", fontSize: 22, cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
}
