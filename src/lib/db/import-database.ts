import { openSqliteDatabase } from './sql-engine'
import { checkDctimerSchema, inspectSchema } from './schema-inspector'
import { parseSessions } from './session-parser'
import type { ImportDatabaseSummary } from './types'

export async function importDatabaseSummary(file: File): Promise<ImportDatabaseSummary> {
  let db = null

  try {
    db = await openSqliteDatabase(file)
    const schema = inspectSchema(db)
    const check = checkDctimerSchema(schema)
    const sessions = check.hasSessionTable ? parseSessions(db) : []

    return {
      fileName: file.name,
      fileSize: file.size,
      inspectedAt: new Date().toISOString(),
      schema,
      check,
      sessions,
    }
  } finally {
    db?.close()
  }
}
