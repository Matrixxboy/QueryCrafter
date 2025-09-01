declare module 'sql-parser' {
  export function parse(sql: string): any;

  export interface AST {
    fields: any[];
    source: { 
      name: { 
        value: string; 
        value2: string | null; 
        nested: boolean; 
        values: string[]; 
      }; 
      alias: string | null; 
      win: any; 
      winFn: any; 
      winArg: any; 
    };
    distinct: boolean;
    joins: any[];
    unions: any[];
    order: any;
    group: any;
    where: any;
    limit: any;
    from: any[];
    columns: any[];
  }
}
