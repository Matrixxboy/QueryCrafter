
import fetch from "node-fetch";
import { LLMConfig } from "./index";
import { Schema } from "../schema";

export async function askOllama(query: string, schema: Schema, config: LLMConfig, dbName: string): Promise<string> {
    const prompt = `
You are an expert SQL generator.
Database Schema:
${JSON.stringify(schema, null, 2)}

Task:
- Convert the following natural language question into ONE valid SQL query for the database named '${dbName}'.
- Use ONLY the tables/columns in the schema.
- Do NOT invent tables/columns.
- Output the SQL query ONLY, nothing else.
- Do NOT wrap in quotes, explanations, or markdown.
- If the user asks to see the tables, use the information_schema.tables to get the list of tables.

-- Example
-- Question: "show me the database tables"
-- SQL: SELECT table_name FROM information_schema.tables WHERE table_schema = '${dbName}';

Question: "${query}"

Return format:
<SQL>
`;


  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model || "llama3",
      prompt: prompt,
      stream: false,
    }),
  });

  const data: any = await res.json();
  return data.response.trim();
}
