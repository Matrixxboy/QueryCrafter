import fetch from "node-fetch";
import { LLMConfig } from "./index";
import { Schema } from "../schema";

export async function askOllama(query: string, schema: Schema, config: LLMConfig): Promise<string> {
  const prompt = `
You are an expert SQL generator.

Database Schema:
${JSON.stringify(schema, null, 2)}

Question:
"${query}"

Strict Output Rules:
1. Return ONLY the SQL query.
2. Do NOT add explanations, comments, markdown, or formatting.
3. Do NOT include words like "SQL", "query", "answer", "output", or any extra text.
4. Output must be exactly ONE valid SQL statement ending with a semicolon.
5. Use only tables and columns from the schema.
6. Generate SQL for a ${config.dbClient} database.
7. Do NOT use semicolons inside except at the very end.
8. The entire SQL must be returned in a **single line** without line breaks or indentation.

Now generate the SQL:
`;

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model || "llama3",
      prompt: prompt,
      stream: false,
    }),
  });

  const data: any = await res.json();

  if (!data || !data.response) {
    console.error("❌ Ollama returned unexpected response:", data);
    throw new Error("Ollama did not return a valid SQL response.");
  }

  let sqlQuery = data.response.trim();
  console.log(`ollama raw result : ${sqlQuery}`);

  // Remove markdown fences if present
  const sqlRegex = /```(?:sql)?\s*([\s\S]*?)\s*```/i;
  const match = sqlQuery.match(sqlRegex);

  if (match && match[1]) {
    sqlQuery = match[1].trim();
  }

  // Force it into one line
  sqlQuery = sqlQuery.replace(/\s+/g, " ").trim();

  console.log(`ollama cleaned SQL : ${sqlQuery}`);
  return sqlQuery;
}
