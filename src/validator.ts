import { parse, AST } from 'sql-parser';
import { Schema } from './schema';

export function validateSQL(sql: string, schema: Schema): boolean {
  try {
    // 1. Extract the SQL from a potential code block
    let cleanSql = sql.trim();
    const match = cleanSql.match(/```(?:sql|SQL)\n([\s\S]*)\n```/);
    if (match && match[1]) {
      cleanSql = match[1];
    }

    // 2. Remove any remaining trailing whitespace and semicolons
    cleanSql = cleanSql.trim().replace(/;$/, '');

    const ast: AST = parse(cleanSql);

    // 3. The rest of your validation logic...
    if (!ast.fields || !ast.source) {
      throw new Error('Only SELECT statements are allowed.');
    }

    if (!ast.from) {
      return true;
    }

    const tables = ast.from.map((f: any) => f.table);
    for (const table of tables) {
      if (!schema[table]) {
        throw new Error(`Table "${table}" not found in the schema.`);
      }
    }

    if (Array.isArray(ast.fields)) {
      for (const column of ast.fields) {
        if (column.expr && column.expr.type === 'column_ref') {
          const table = column.expr.table;
          if (table && !schema[table]) {
            throw new Error(`Table "${table}" not found in the schema.`);
          }
          const targetTable = table || (tables.length === 1 ? tables[0] : null);
          if (targetTable && !schema[targetTable].includes(column.expr.column)) {
            throw new Error(`Column "${column.expr.column}" not found in table "${targetTable}".`);
          }
        }
      }
    }

    return true;
  } catch (e: any) {
    throw new Error(`Invalid SQL: ${e.message}`);
  }
}