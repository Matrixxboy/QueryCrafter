import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMConfig } from './index';
import { Schema } from '../schema';

export async function askGemini(query: string, schema: Schema, config: LLMConfig): Promise<string> {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });

  const prompt = `
You are an SQL generator.
Database Schema: ${JSON.stringify(schema, null, 2)}
Question: "${query}"
Rules:
- Return ONLY a valid SQL query (no explanation).
- Use only tables and columns from the schema.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  return text.trim();
}
