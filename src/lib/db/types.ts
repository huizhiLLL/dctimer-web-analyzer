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

export type ImportDatabaseSummary = {
  fileName: string
  fileSize: number
  inspectedAt: string
  schema: SqliteSchemaSnapshot
  check: DctimerSchemaCheck
  sessions: SessionEntity[]
}
