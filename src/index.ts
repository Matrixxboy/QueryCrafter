// src/index.ts

import knex, { Knex } from "knex";
import { extractSchema as defaultExtractSchema, Schema } from "./schema";
import { askLLM as defaultAskLLM, LLMConfig } from "./llm/index";
import { validateSQL } from "./validator";

interface QueryCrafterConfig {
  db: Knex.Config;
  llm: LLMConfig;
  extractSchema?: (knex: Knex, dbName: string) => Promise<Schema>;
  askLLM?: (query: string, schema: Schema, config: LLMConfig, dbName: string) => Promise<string>;
}

export class QueryCrafter {
  private knex: Knex;
  private llmConfig: LLMConfig;
  private dbName: string;
  private dbClient?: string;
  private extractSchema: (knex: Knex, dbName: string) => Promise<Schema>;
  private askLLM: (query: string, schema: Schema, config: LLMConfig, dbName: string) => Promise<string>;

  constructor({ db, llm, extractSchema = defaultExtractSchema, askLLM = defaultAskLLM }: QueryCrafterConfig) {
    this.knex = knex(db);
    if (!llm || !llm.provider) {
      throw new Error("LLM provider is required in the constructor.");
    }
    if (llm.provider !== 'ollama' && !llm.apiKey) {
      throw new Error("API key is required for the selected LLM provider.");
    }
    this.llmConfig = {
      provider: llm.provider,
      apiKey: llm.apiKey,
      model: llm.model,
      dbClient: db.client as string,
    };
    if (typeof db.connection === 'object' && db.connection !== null && 'database' in db.connection) {
      this.dbName = (db.connection as any).database;
    } else if (typeof db.connection === 'string') {
      throw new Error("Database connection string not supported for dbName extraction.");
    } else {
      throw new Error("Could not determine database name from db configuration.");
    }
    this.extractSchema = extractSchema;
    this.askLLM = askLLM;
  }

  async convert(nlpQuery: string): Promise<string> {
    const schema = await this.extractSchema(this.knex, this.dbName);
    const sql = await this.askLLM(nlpQuery, schema, this.llmConfig, this.dbName);
    
    // The key change: The validateSQL function now returns the cleaned SQL string
    const cleanSql = validateSQL(sql, schema);
    
    return cleanSql;
  }

  async execute(nlpQuery: string): Promise<{ sql: string, result: any }> {
    const sql = await this.convert(nlpQuery);
    const [rows] = await this.knex.raw(sql);
    return { sql, result: rows };
  }
}