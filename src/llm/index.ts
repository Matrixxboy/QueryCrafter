import { askOpenAI } from './openai';
import { askGemini } from './gemini';
import { askGroq } from './groq';
import { askOllama } from './ollama';
import { Schema } from '../schema';

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  dbClient?: string;
}

export async function askLLM(query: string, schema: Schema, config: LLMConfig): Promise<string> {
  switch (config.provider) {
    case 'openai':
      return askOpenAI(query, schema, config);
    case 'gemini':
      return askGemini(query, schema, config);
    case 'groq':
      return askGroq(query, schema, config);
    case 'ollama':
      return askOllama(query, schema, config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
