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
  } else if (knex.client.config.client === "sqlite3") {
    const tableRows = await knex.raw(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`);

    const allColumns: any[] = [];
    for (const table of tableRows) {
      const columnRows = await knex.raw(`PRAGMA table_info(${table.name});`);
      columnRows.forEach((col: any) => {
        allColumns.push({
          table_name: table.name,
          column_name: col.name,
        });
      });
    }
    rows = allColumns;
  } else if (knex.client.config.client === "mssql") {
    const result = await knex.raw(`
      SELECT
        t.name AS table_name,
        c.name AS column_name
      FROM
        sys.tables AS t
      INNER JOIN
        sys.columns AS c ON t.object_id = c.object_id
      ORDER BY
        t.name, c.column_id;
    `);
    rows = result.recordset;
  } else {
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