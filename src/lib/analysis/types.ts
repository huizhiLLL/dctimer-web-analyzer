import type { SessionEntity, SolveEntity } from '../db/types'

export type EnrichedSolveEntity = SolveEntity & {
  recordedYear: number | null
  recordedMonth: string | null
  recordedDate: string | null
  recordedHour: number | null
  recordedWeekday: number | null
  hasNote: boolean
  hasMoves: boolean
  phaseCount: number
}

export type AnalyzerFilter = {
  selectedYear: number | 'all'
  includedSessionIds: number[]
}

export type FilteredDataset = {
  filter: AnalyzerFilter
  sessions: SessionEntity[]
  solves: EnrichedSolveEntity[]
  includedSessionMap: Map<number, SessionEntity>
}

export type SummaryMetrics = {
  totalSolves: number
  totalValidSolves: number
  totalDnf: number
  dnfRate: number
  totalPlus2: number
  plus2Rate: number
  bestSingleMs: number | null
  firstSolveAt: string | null
  lastSolveAt: string | null
}

export type SessionStats = {
  sessionId: number
  sessionName: string
  puzzleTypeCode: number | null
  puzzleDisplayName: string | null
  solveCount: number
  validSolveCount: number
  dnfCount: number
  dnfRate: number
  bestSingleMs: number | null
  firstSolveAt: string | null
  lastSolveAt: string | null
}

export type PuzzleStats = {
  puzzleTypeCode: number | null
  puzzleDisplayName: string
  solveCount: number
}
