import fetch from "node-fetch";
import { LLMConfig } from "./index";
import { Schema } from "../schema";

export async function askOpenAI(query: string, schema: Schema, config: LLMConfig): Promise<string> {
  const prompt = `
You are an SQL generator.
Database Schema: ${JSON.stringify(schema, null, 2)}
Question: "${query}"
Rules:
- Return ONLY a valid SQL query (no explanation).
- Use only tables and columns from the schema.
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data: any = await res.json();
  return data.choices[0].message.content.trim();
}
