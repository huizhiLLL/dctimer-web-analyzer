import type { Database, QueryExecResult } from 'sql.js'
import type { DctimerSchemaCheck, SqliteSchemaSnapshot, SqliteTableColumn } from './types'

const RESULT_TABLE_PATTERN = /^(resulttb|result\d+|resultstb)$/i

function mapRows<T>(result?: QueryExecResult): T[] {
  if (!result) {
    return []
  }

  return result.values.map((row: (string | number | null | Uint8Array)[]) => {
    return result.columns.reduce<Record<string, unknown>>((record, column, index) => {
      record[column] = row[index]
      return record
    }, {}) as T
  })
}

export function inspectSchema(db: Database): SqliteSchemaSnapshot {
  const tableRows = mapRows<{ name: string }>(
    db.exec(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;`)[0],
  )

  const tables = tableRows.map(({ name }) => ({
    name,
    columns: mapRows<SqliteTableColumn>(db.exec(`PRAGMA table_info(${JSON.stringify(name)});`)[0]),
  }))

  return {
    tableNames: tables.map((table) => table.name),
    tables,
  }
}

export function checkDctimerSchema(schema: SqliteSchemaSnapshot): DctimerSchemaCheck {
  const hasSessionTable = schema.tableNames.includes('sessiontb')
  const resultTables = schema.tableNames.filter((name) => RESULT_TABLE_PATTERN.test(name))

  return {
    isSqlite: true,
    hasSessionTable,
    resultTables,
    isLikelyDctimer: hasSessionTable && resultTables.length > 0,
  }
}
