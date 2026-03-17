import { describe, expect, it } from 'vitest'
import { buildPuzzleStats } from './puzzle-stats'
import type { FilteredDataset } from './types'

describe('buildPuzzleStats', () => {
  it('groups filtered solves by puzzle display name', () => {
    const dataset = {
      filter: { selectedYear: 'all', includedSessionIds: [1, 2] },
      sessions: [
        {
          id: 1,
          name: '3x3 Main',
          puzzleTypeCode: 0,
          puzzle: { code: 0, idx: 0, sub: 0, categoryName: 'WCA', itemName: '3x3x3', displayName: 'WCA · 3x3x3' },
          multiPhase: 0,
          averageSetting: null,
          sorting: 1,
          solveCount: 10,
          firstSolveAt: null,
          lastSolveAt: null,
        },
        {
          id: 2,
          name: 'OH',
          puzzleTypeCode: 5,
          puzzle: { code: 5, idx: 0, sub: 5, categoryName: 'WCA', itemName: '3x3 OH', displayName: 'WCA · 3x3 OH' },
          multiPhase: 0,
          averageSetting: null,
          sorting: 2,
          solveCount: 10,
          firstSolveAt: null,
          lastSolveAt: null,
        },
      ],
      solves: [
        {
          id: 1, sessionId: 1, baseTimeMs: 1000, penalty: 0, isDnf: false, finalTimeMs: 1000, scramble: null,
          recordedAt: '2025-01-01 10:00:00', note: null, phases: [], moves: null, sourceTable: 'resulttb',
          recordedYear: 2025, recordedMonth: '2025-01', recordedDate: '2025-01-01', recordedHour: 10,
          recordedWeekday: 3, hasNote: false, hasMoves: false, phaseCount: 0,
        },
        {
          id: 2, sessionId: 1, baseTimeMs: 1100, penalty: 0, isDnf: false, finalTimeMs: 1100, scramble: null,
          recordedAt: '2025-01-01 10:00:00', note: null, phases: [], moves: null, sourceTable: 'resulttb',
          recordedYear: 2025, recordedMonth: '2025-01', recordedDate: '2025-01-01', recordedHour: 10,
          recordedWeekday: 3, hasNote: false, hasMoves: false, phaseCount: 0,
        },
        {
          id: 3, sessionId: 2, baseTimeMs: 1200, penalty: 0, isDnf: false, finalTimeMs: 1200, scramble: null,
          recordedAt: '2025-01-01 10:00:00', note: null, phases: [], moves: null, sourceTable: 'resulttb',
          recordedYear: 2025, recordedMonth: '2025-01', recordedDate: '2025-01-01', recordedHour: 10,
          recordedWeekday: 3, hasNote: false, hasMoves: false, phaseCount: 0,
        },
      ],
      includedSessionMap: new Map(),
    } as FilteredDataset

    const result = buildPuzzleStats(dataset)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      puzzleDisplayName: 'WCA · 3x3x3',
      solveCount: 2,
    })
  })
})
