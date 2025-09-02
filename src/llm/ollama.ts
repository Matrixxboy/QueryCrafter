
import fetch from "node-fetch";
import { LLMConfig } from "./index";
import { Schema } from "../schema";

export async function askOllama(query: string, schema: Schema, config: LLMConfig): Promise<string> {
    const prompt = `
You are an SQL generator.
Database Schema: ${JSON.stringify(schema, null, 2)}
Question: "${query}"
Rules:
- Return ONLY a valid SQL query (no explanation).
- Use only tables and columns from the schema.
- Generate SQL for a ${config.dbClient} database.
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
