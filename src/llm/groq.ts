import Groq from 'groq-sdk';
import { LLMConfig } from './index';
import { Schema } from '../schema';

export async function askGroq(query: string, schema: Schema, config: LLMConfig): Promise<string> {
  const groq = new Groq({ apiKey: config.apiKey });

  const prompt = `
You are an SQL generator.
Database Schema: ${JSON.stringify(schema, null, 2)}
Question: "${query}"
Rules:
- Return ONLY a valid SQL query (no explanation).
- Use only tables and columns from the schema.
`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: config.model || 'gemma2-9b-it',
  });

  return chatCompletion.choices[0]?.message?.content?.trim() || '';
}
