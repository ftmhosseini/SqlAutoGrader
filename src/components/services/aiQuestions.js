const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Helper function to pause execution for exponential backoff.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enhanced fetch that handles 429 (Rate Limit) errors with Exponential Backoff.
 */
async function fetchWithRetry(url, options, maxRetries = 5) {
  let delay = 1000; // Start with 1 second

  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, options);

    if (res.ok) return res;

    // If we hit a rate limit (429), wait and try again
    if (res.status === 429 && i < maxRetries - 1) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
      await sleep(delay);
      delay *= 2; // Exponential increase: 1s, 2s, 4s, 8s, 16s
      continue;
    }

    // For other errors (401, 400, 500) or if we ran out of retries
    let errorDetail = "";
    try {
      const errData = await res.json();
      errorDetail = errData.error?.message || JSON.stringify(errData);
    } catch (e) {
      errorDetail = res.statusText;
    }
    
    throw new Error(`Groq API error: ${res.status} - ${errorDetail}`);
  }
}

export async function generateQuestionsFromSchema(tableSchemas) {
  const tableNames = Object.keys(tableSchemas);
  const tableCount = tableNames.length;
  const perTable = 10;
  const joinCount = tableCount > 1 ? 10 : 0;
  const total = tableCount * perTable + joinCount;

  const schemaText = Object.entries(tableSchemas)
    .map(([table, cols]) => {
      const colDefs = cols.map((c) => `  ${c.name} ${c.type}`).join("\n");
      return `Table: ${table}\n${colDefs}`;
    })
    .join("\n\n");

  const prompt = `You are a SQL instructor. Given the following database schema, generate exactly ${total} UNIQUE SQL practice questions (variation seed: ${Math.random().toString(36).slice(2)}):
- ${perTable} questions per table (each question must query ONLY that single table, no joins)
${tableCount > 1 ? `- ${joinCount} questions that use JOINs across multiple tables` : ''}
- Every question must have a different SQL answer — no duplicate queries allowed

Schema:
${schemaText}

Return ONLY a valid JSON array with no markdown, no explanation. Each item must have:
- "id": number (1 to ${total})
- "question": string (the question prompt for the student)
- "answer": string (the correct SQL query)
- "mark": number (1-7 based on difficulty)
- "max_attempts": number (4-7 based on difficulty)
- "orderMatters": boolean (true if ORDER BY is required)
- "aliasStrict": boolean (true if column aliases are required)
- "tables": array of table names used in the answer (e.g. ["Employees"] or ["Employees","Departments"])

Example format:
 [{"id":1,"question":"...","answer":"SELECT ...","mark":2,"orderMatters":false,"aliasStrict":false,"max_attempts":3,"tables":["Employees"]}]`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 1.0,
    }),
  });

  if (!res.ok) {
    return res;
    const err = await res.json();
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e){
    const lastComplete = cleaned.lastIndexOf('},');
    if (lastComplete === -1) throw new Error("Could not parse AI response",e.message);
    return JSON.parse(cleaned.slice(0, lastComplete + 1) + ']');
  }
}

/**
 * Filters presets based on whether the tables in the preset match the selected tables.
 */
export const filteredPresets = (questionId, selectedTable, presets) => {
  const tables = selectedTable[questionId] || [];

  return tables.length > 0
    ? presets.filter(p => {
        if (!Array.isArray(p.tables) || p.tables.length !== tables.length) {
          return false;
        }
        const sortedP = [...p.tables].sort();
        const sortedSelected = [...tables].sort();
        return sortedP.every((val, index) => val === sortedSelected[index]);
      })
    : presets;
};
