import { Knex } from "knex";

export interface Schema {
  [tableName: string]: string[];
}

export async function extractSchema(knex: Knex, dbName: string): Promise<Schema> {
  let rows: any[];

  if (knex.client.config.client === "pg") {
    const result = await knex.raw(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    rows = result.rows;
  } else if (knex.client.config.client === "mysql") {
    const [result] = await knex.raw(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = ?
      ORDER BY table_name, ordinal_position;
    `, [dbName]);
    rows = result;
  } else if (knex.client.config.client === "mysql2") {
    const [result] = await knex.raw(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = ?
      ORDER BY table_name, ordinal_position;
    `, [dbName]);
    rows = result;
  }
   else {
    throw new Error(`Unsupported database client: ${knex.client.config.client}`);
  }

  const schema: Schema = {};
  rows.forEach(r => {
    const table = r.table_name || r.TABLE_NAME;
    const column = r.column_name || r.COLUMN_NAME;
    if (!schema[table]) schema[table] = [];
    schema[table].push(column);
  });

  return schema;
}
