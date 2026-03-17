import { describe, expect, it } from 'vitest'
import { buildSessionStats } from './session-stats'
import type { FilteredDataset } from './types'

describe('buildSessionStats', () => {
  it('builds stats from filtered solves instead of original session counts', () => {
    const dataset = {
      filter: { selectedYear: 2025, includedSessionIds: [1] },
      sessions: [
        {
          id: 1,
          name: '3x3 Main',
          puzzleTypeCode: 0,
          puzzle: { code: 0, idx: 0, sub: 0, categoryName: 'WCA', itemName: '3x3x3', displayName: 'WCA · 3x3x3' },
          multiPhase: 0,
          averageSetting: null,
          sorting: 1,
          solveCount: 999,
          firstSolveAt: '2024-01-01 10:00:00',
          lastSolveAt: '2025-01-01 10:00:00',
        },
      ],
      solves: [
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
      ],
      includedSessionMap: new Map(),
    } as FilteredDataset

    const result = buildSessionStats(dataset)

    expect(result[0]?.solveCount).toBe(1)
    expect(result[0]?.bestSingleMs).toBe(1000)
  })
})
