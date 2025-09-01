import knex, { Knex } from "knex";
import { extractSchema as defaultExtractSchema, Schema } from "./schema";
import { askLLM as defaultAskLLM, LLMConfig } from "./llm/index";
import { validateSQL } from "./validator";

interface QueryCrafterConfig {
  db: Knex.Config;
  llm: LLMConfig;
  extractSchema?: (knex: Knex, dbName: string) => Promise<Schema>;
  askLLM?: (query: string, schema: Schema, config: LLMConfig) => Promise<string>;
}

export class QueryCrafter {
  private knex: Knex;
  private llmConfig: LLMConfig;
  private dbName: string;
  private extractSchema: (knex: Knex, dbName: string) => Promise<Schema>;
  private askLLM: (query: string, schema: Schema, config: LLMConfig) => Promise<string>;

  constructor({ db, llm, extractSchema = defaultExtractSchema, askLLM = defaultAskLLM }: QueryCrafterConfig) {
    this.knex = knex(db);

    if (!llm || !llm.provider || !llm.apiKey) {
      throw new Error("LLM provider and API key are required in the constructor.");
    }

    this.llmConfig = {
      provider: llm.provider,
      apiKey: llm.apiKey,
      model: llm.model
    };

    // Safely extract dbName
    if (typeof db.connection === 'object' && db.connection !== null && 'database' in db.connection) {
      this.dbName = (db.connection as any).database; // Cast to any to access database property
    } else if (typeof db.connection === 'string') {
      // Handle connection string if necessary, or throw an error
      throw new Error("Database connection string not supported for dbName extraction.");
    } else {
      throw new Error("Could not determine database name from db configuration.");
    }

    this.extractSchema = extractSchema;
    this.askLLM = askLLM;
  }

  async convert(nlpQuery: string): Promise<string> {
    const schema = await this.extractSchema(this.knex, this.dbName);
    const sql = await this.askLLM(nlpQuery, schema, this.llmConfig);
    validateSQL(sql, schema);
    return sql;
  }

  async execute(nlpQuery: string): Promise<{ sql: string, result: any }> {
    const sql = await this.convert(nlpQuery);
    const result = await this.knex.raw(sql);
    return { sql, result };
  }
}
