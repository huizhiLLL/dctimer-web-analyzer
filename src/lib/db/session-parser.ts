import type { Database } from 'sql.js'
import { decodePuzzleType, type PuzzleTypeInfo } from './puzzle-type'

export type RawSessionRow = {
  id: number
  name: string | null
  type: number | null
  mulp: number | null
  ra: number | null
  sorting?: number | null
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

type QueryRow = Record<string, unknown>

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

function normalizeSessionName(name: string | null, id: number) {
  const normalized = name?.trim()
  return normalized ? normalized : `Session ${id}`
}

export function parseSessions(db: Database): SessionEntity[] {
  const result = db.exec('SELECT id, name, type, mulp, ra, sorting FROM sessiontb ORDER BY sorting ASC, id ASC;')[0]

  if (!result) {
    return []
  }

  const rows = mapRows<RawSessionRow>(result.columns, result.values)

  return rows.map((row, index) => {
    const puzzleTypeCode = toNullableNumber(row.type)
    const id = typeof row.id === 'number' ? row.id : index

    return {
      id,
      name: normalizeSessionName(toNullableString(row.name), id),
      puzzleTypeCode,
      puzzle: decodePuzzleType(puzzleTypeCode),
      multiPhase: toNullableNumber(row.mulp) ?? 0,
      averageSetting: toNullableNumber(row.ra),
      sorting: toNullableNumber(row.sorting) ?? id,
      solveCount: 0,
      firstSolveAt: null,
      lastSolveAt: null,
    }
  })
}
