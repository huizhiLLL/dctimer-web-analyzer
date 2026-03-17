import { describe, expect, it } from 'vitest'
import { buildFilteredDataset } from './filter-dataset'
import type { SessionEntity } from '../db/types'
import type { AnalyzerFilter, EnrichedSolveEntity } from './types'

const sessions: SessionEntity[] = [
  {
    id: 1,
    name: 'A',
    puzzleTypeCode: 0,
    puzzle: null,
    multiPhase: 0,
    averageSetting: null,
    sorting: 1,
    solveCount: 3,
    firstSolveAt: '2024-01-01 10:00:00',
    lastSolveAt: '2025-01-01 10:00:00',
  },
  {
    id: 2,
    name: 'B',
    puzzleTypeCode: 1,
    puzzle: null,
    multiPhase: 0,
    averageSetting: null,
    sorting: 2,
    solveCount: 1,
    firstSolveAt: '2024-01-01 10:00:00',
    lastSolveAt: '2024-01-01 10:00:00',
  },
]

const solves: EnrichedSolveEntity[] = [
  {
    id: 1,
    sessionId: 1,
    baseTimeMs: 1000,
    penalty: 0,
    isDnf: false,
    finalTimeMs: 1000,
    scramble: null,
    recordedAt: '2025-01-01 10:00:00',
    note: null,
    phases: [],
    moves: null,
    sourceTable: 'resulttb',
    recordedYear: 2025,
    recordedMonth: '2025-01',
    recordedDate: '2025-01-01',
    recordedHour: 10,
    recordedWeekday: 3,
    hasNote: false,
    hasMoves: false,
    phaseCount: 0,
  },
  {
    id: 2,
    sessionId: 1,
    baseTimeMs: 1000,
    penalty: 0,
    isDnf: false,
    finalTimeMs: 1000,
    scramble: null,
    recordedAt: '2024-01-01 10:00:00',
    note: null,
    phases: [],
    moves: null,
    sourceTable: 'resulttb',
    recordedYear: 2024,
    recordedMonth: '2024-01',
    recordedDate: '2024-01-01',
    recordedHour: 10,
    recordedWeekday: 1,
    hasNote: false,
    hasMoves: false,
    phaseCount: 0,
  },
]

describe('buildFilteredDataset', () => {
  it('filters solves by selected year and selected sessions', () => {
    const filter: AnalyzerFilter = { selectedYear: 2025, includedSessionIds: [1, 2] }
    const result = buildFilteredDataset({ filter, sessions, solves })

    expect(result.solves).toHaveLength(1)
    expect(result.solves[0]?.sessionId).toBe(1)
    expect(result.sessions.map((item) => item.id)).toEqual([1])
  })

  it('respects explicitly selected session ids', () => {
    const filter: AnalyzerFilter = { selectedYear: 'all', includedSessionIds: [2] }
    const result = buildFilteredDataset({ filter, sessions, solves })

    expect(result.solves).toHaveLength(0)
    expect(result.sessions).toEqual([])
  })
})
