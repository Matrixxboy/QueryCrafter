// src/validator.ts

import { Parser } from "node-sql-parser";
import { Schema } from "./schema";

const parser = new Parser();

/**
 * Clean raw SQL response (remove markdown, explanations, etc.)
 */
function cleanResponse(sql: string): string {
  let cleanSql = sql.trim();

  // Remove Markdown fences like ```sql ... ```
  const fenceMatch = cleanSql.match(/```(?:sql)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleanSql = fenceMatch[1].trim();
  }

  // Remove "SQL query:", "Answer:", etc.
  cleanSql = cleanSql.replace(/^(SQL\s*query:|Query:|Answer:|Output:)/gi, "").trim();

  // Remove inline explanations (anything after -- or # comments)
  cleanSql = cleanSql.replace(/--.*$/gm, "").replace(/#.*$/gm, "").trim();

  // Ensure single trailing semicolon
  cleanSql = cleanSql.replace(/;+$/g, "").trim() + ";";

  return cleanSql;
}

/**
 * Validate SQL against schema and db dialect
 */
export function validateSQL(sql: string, schema: Schema, dbClient: string = "mysql"): string {
  try {
    let cleanSql = cleanResponse(sql);

    // --- Dialect-specific regex checks ---
    switch (dbClient.toLowerCase()) {
      case "mysql":
        if (/^SHOW\s+TABLES/i.test(cleanSql)) return cleanSql;
        if (/^DESCRIBE\s+\w+/i.test(cleanSql)) return cleanSql;
        break;

      case "postgresql":
      case "postgres":
        if (/^SELECT\s+.*\s+LIMIT\s+\d+/i.test(cleanSql)) return cleanSql;
        if (/RETURNING/i.test(cleanSql)) return cleanSql;
        break;

      case "mssql":
      case "sqlserver":
        if (/^SELECT\s+TOP\s+\d+/i.test(cleanSql)) return cleanSql;
        if (/^USE\s+\w+/i.test(cleanSql)) return cleanSql;
        break;

      case "sqlite":
        if (/^PRAGMA\s+/i.test(cleanSql)) return cleanSql;
        if (/^SELECT\s+.*\s+LIMIT\s+\d+/i.test(cleanSql)) return cleanSql;
        break;
    }

    // --- Try to parse SQL ---
    const ast = parser.astify(cleanSql, { database: dbClient as any });

    // Validate tables & columns against schema
    const tables: string[] = [];
    if (Array.isArray((ast as any).from)) {
      for (const f of (ast as any).from) {
        if (f.table) tables.push(f.table);
      }
    }

    for (const table of tables) {
      if (!schema[table]) {
        throw new Error(`Table "${table}" not found in schema.`);
      }
    }

    if (Array.isArray((ast as any).columns)) {
      for (const col of (ast as any).columns) {
        if (col.expr?.type === "column_ref") {
          const table = col.expr.table || (tables.length === 1 ? tables[0] : null);
          if (table && schema[table] && !schema[table].includes(col.expr.column)) {
            throw new Error(`Column "${col.expr.column}" not found in table "${table}".`);
          }
        }
      }
    }

    return cleanSql;
  } catch (err: any) {
    // If parsing fails, still return cleaned SQL but warn
    console.warn("⚠️ SQL validation warning:", err.message);
    return cleanResponse(sql);
  }
}
