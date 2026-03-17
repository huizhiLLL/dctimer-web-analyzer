export type SqliteTableColumn = {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: string | null
  pk: number
}

export type SqliteSchemaTable = {
  name: string
  columns: SqliteTableColumn[]
}

export type SqliteSchemaSnapshot = {
  tableNames: string[]
  tables: SqliteSchemaTable[]
}

export type DctimerSchemaCheck = {
  isSqlite: boolean
  hasSessionTable: boolean
  resultTables: string[]
  isLikelyDctimer: boolean
}

export type ParserWarning = {
  code:
    | 'MISSING_OPTIONAL_COLUMN'
    | 'UNKNOWN_PUZZLE_TYPE'
    | 'INVALID_TIME_STRING'
    | 'UNKNOWN_RESULT_TABLE'
    | 'PARTIAL_PARSE'
  message: string
  detail?: Record<string, unknown>
}

export type ParserError = {
  code:
    | 'INVALID_SQLITE_FILE'
    | 'NOT_DCTIMER_DB'
    | 'MISSING_SESSION_TABLE'
    | 'READ_FAILED'
  message: string
  detail?: Record<string, unknown>
}

export type PuzzleTypeInfo = {
  code: number
  idx: number | null
  sub: number | null
  categoryName: string | null
  itemName: string | null
  displayName: string
}

export type SessionEntity = {
  id: number
  name: string
  puzzleTypeCode: number | null
  puzzle: PuzzleTypeInfo | null
  multiPhase: number
  averageSetting: number | null
  sorting: number
  solveCount: number
  firstSolveAt: string | null
  lastSolveAt: string | null
}

export type SolveEntity = {
  id: number
  sessionId: number
  baseTimeMs: number
  penalty: 0 | 1 | 2
  isDnf: boolean
  finalTimeMs: number | null
  scramble: string | null
  recordedAt: string | null
  note: string | null
  phases: number[]
  moves: string | null
  sourceTable: string
}

export type DatabaseOverview = {
  sessionCount: number
  solveCount: number
  validSolveCount: number
  dnfCount: number
  plus2Count: number
  yearRange: number[]
  firstSolveAt: string | null
  lastSolveAt: string | null
}

export type ImportDatabaseSummary = {
  fileName: string
  fileSize: number
  inspectedAt: string
  schema: SqliteSchemaSnapshot
  check: DctimerSchemaCheck
  overview: DatabaseOverview
  sessions: SessionEntity[]
  solves: SolveEntity[]
  warnings: ParserWarning[]
  errors: ParserError[]
}
