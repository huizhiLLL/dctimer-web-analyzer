import { openSqliteDatabase } from './sql-engine'
import { checkDctimerSchema, inspectSchema } from './schema-inspector'
import { parseSessions } from './session-parser'
import { parseSolves } from './solve-parser'
import { buildDatabaseOverview, enrichSessionsWithSolveStats } from './summary'
import type { ImportDatabaseSummary } from './types'

export async function importDatabaseSummary(file: File): Promise<ImportDatabaseSummary> {
  let db = null

  try {
    db = await openSqliteDatabase(file)
    const schema = inspectSchema(db)
    const check = checkDctimerSchema(schema)
    const solves = parseSolves(db, schema.tableNames)
    const rawSessions = check.hasSessionTable ? parseSessions(db) : []
    const sessions = enrichSessionsWithSolveStats(rawSessions, solves)
    const overview = buildDatabaseOverview(sessions, solves)

    return {
      fileName: file.name,
      fileSize: file.size,
      inspectedAt: new Date().toISOString(),
      schema,
      check,
      overview,
      sessions,
      solves,
    }
  } finally {
    db?.close()
  }
}
