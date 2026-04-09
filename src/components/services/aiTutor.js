const API_KEY = process.env.REACT_APP_GROQ_API_KEY;
console.log("GROQ KEY:", API_KEY);

export async function askSqlTutor(history, userMessage) {
  const messages = [
    {
      role: "system",
      content: "You are an expert SQL tutor. Help students learn SQL clearly and concisely. When showing SQL, always use code blocks. Keep answers focused on SQL (SQLite dialect when relevant).",
    },
    ...history.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Groq error:", err);
    throw new Error(`Groq API error: ${res.status} ${API_KEY}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}
