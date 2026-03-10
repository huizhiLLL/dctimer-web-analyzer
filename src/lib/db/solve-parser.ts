import type { Database } from 'sql.js'

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

type QueryRow = Record<string, unknown>

type SolveTablePlan = {
  tableName: string
  sessionId: number | null
  usesSid: boolean
}

const FIXED_TABLES: SolveTablePlan[] = [
  { tableName: 'resulttb', sessionId: 0, usesSid: false },
  { tableName: 'result2', sessionId: 1, usesSid: false },
  { tableName: 'result3', sessionId: 2, usesSid: false },
  { tableName: 'result4', sessionId: 3, usesSid: false },
  { tableName: 'result5', sessionId: 4, usesSid: false },
  { tableName: 'result6', sessionId: 5, usesSid: false },
  { tableName: 'result7', sessionId: 6, usesSid: false },
  { tableName: 'result8', sessionId: 7, usesSid: false },
  { tableName: 'result9', sessionId: 8, usesSid: false },
  { tableName: 'result10', sessionId: 9, usesSid: false },
  { tableName: 'result11', sessionId: 10, usesSid: false },
  { tableName: 'result12', sessionId: 11, usesSid: false },
  { tableName: 'result13', sessionId: 12, usesSid: false },
  { tableName: 'result14', sessionId: 13, usesSid: false },
  { tableName: 'result15', sessionId: 14, usesSid: false },
  { tableName: 'resultstb', sessionId: null, usesSid: true },
]

function mapRows<T>(columns: string[], values: unknown[][]): T[] {
  return values.map((row) => {
    return columns.reduce<QueryRow>((record, column, index) => {
      record[column] = row[index]
      return record
    }, {}) as T
  })
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function normalizePenalty(resp: number | null, resd: number | null): 0 | 1 | 2 {
  if (resd === 0) return 2
  if (resp === 1) return 1
  if (resp === 2) return 2
  return 0
}

function normalizePhases(row: QueryRow) {
  return ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
    .map((key) => toNullableNumber(row[key]))
    .filter((value): value is number => value !== null)
}

function buildSelectSql(plan: SolveTablePlan) {
  const sidField = plan.usesSid ? 'sid' : `${plan.sessionId} AS sid`

  return `
    SELECT
      id,
      ${sidField},
      rest,
      resp,
      resd,
      scr,
      time,
      note,
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      moves
    FROM ${plan.tableName}
    ORDER BY id ASC;
  `
}

export function parseSolves(db: Database, tableNames: string[]): SolveEntity[] {
  const availableTables = new Set(tableNames)
  const solves: SolveEntity[] = []

  for (const plan of FIXED_TABLES) {
    if (!availableTables.has(plan.tableName)) {
      continue
    }

    const result = db.exec(buildSelectSql(plan))[0]

    if (!result) {
      continue
    }

    const rows = mapRows<QueryRow>(result.columns, result.values)

    for (const row of rows) {
      const id = toNullableNumber(row.id)
      const sessionId = toNullableNumber(row.sid)
      const rest = toNullableNumber(row.rest)
      const resp = toNullableNumber(row.resp)
      const resd = toNullableNumber(row.resd)

      if (id === null || sessionId === null || rest === null) {
        continue
      }

      const penalty = normalizePenalty(resp, resd)
      const isDnf = penalty === 2

      solves.push({
        id,
        sessionId,
        baseTimeMs: rest,
        penalty,
        isDnf,
        finalTimeMs: isDnf ? null : rest + (penalty === 1 ? 2000 : 0),
        scramble: toNullableString(row.scr),
        recordedAt: toNullableString(row.time),
        note: toNullableString(row.note),
        phases: normalizePhases(row),
        moves: toNullableString(row.moves),
        sourceTable: plan.tableName,
      })
    }
  }

  return solves
}
