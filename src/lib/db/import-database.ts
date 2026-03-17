import { openSqliteDatabase } from './sql-engine'
import { checkDctimerSchema, inspectSchema } from './schema-inspector'
import { parseSessions } from './session-parser'
import { parseSolves } from './solve-parser'
import { buildDatabaseOverview, enrichSessionsWithSolveStats } from './summary'
import type { ImportDatabaseSummary, ParserError, ParserWarning } from './types'

export async function importDatabaseSummary(file: File): Promise<ImportDatabaseSummary> {
  let db = null

  try {
    const warnings: ParserWarning[] = []
    const errors: ParserError[] = []

    db = await openSqliteDatabase(file)
    const schema = inspectSchema(db)
    const check = checkDctimerSchema(schema)
    const solves = parseSolves(db, schema.tableNames)
    const rawSessions = check.hasSessionTable ? parseSessions(db) : []
    const sessions = enrichSessionsWithSolveStats(rawSessions, solves)
    const overview = buildDatabaseOverview(sessions, solves)

    if (!check.hasSessionTable) {
      errors.push({
        code: 'MISSING_SESSION_TABLE',
        message: '数据库缺少 sessiontb，无法识别为完整的 DCTimer 数据库。',
      })
    }

    if (!check.isLikelyDctimer) {
      errors.push({
        code: 'NOT_DCTIMER_DB',
        message: '文件可以打开，但表结构看起来不像 DCTimer 数据库。',
      })
    }

    const unknownPuzzleSessions = sessions.filter((session) => session.puzzleTypeCode !== null && session.puzzle?.categoryName === null)
    for (const session of unknownPuzzleSessions) {
      warnings.push({
        code: 'UNKNOWN_PUZZLE_TYPE',
        message: `发现未知项目类型编码：${session.puzzleTypeCode}`,
        detail: {
          sessionId: session.id,
          puzzleTypeCode: session.puzzleTypeCode,
        },
      })
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      inspectedAt: new Date().toISOString(),
      schema,
      check,
      overview,
      sessions,
      solves,
      warnings,
      errors,
    }
  } catch (error) {
    throw error
  } finally {
    db?.close()
  }
}
