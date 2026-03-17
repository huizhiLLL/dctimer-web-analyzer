import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAnalyzerStore } from './analyzer'
import type { ImportDatabaseSummary } from '../lib/db/types'

const summaryFixture: ImportDatabaseSummary = {
  fileName: 'sample.db',
  fileSize: 1024,
  inspectedAt: '2026-03-17T00:00:00.000Z',
  schema: {
    tableNames: ['sessiontb', 'resulttb'],
    tables: [],
  },
  check: {
    isSqlite: true,
    hasSessionTable: true,
    resultTables: ['resulttb'],
    isLikelyDctimer: true,
  },
  overview: {
    sessionCount: 2,
    solveCount: 3,
    validSolveCount: 2,
    dnfCount: 1,
    plus2Count: 1,
    yearRange: [2024, 2025],
    firstSolveAt: '2024-01-01 10:00:00',
    lastSolveAt: '2025-02-01 10:00:00',
  },
  warnings: [],
  errors: [],
  sessions: [
    {
      id: 1,
      name: 'Main 3x3',
      puzzleTypeCode: 0,
      puzzle: { code: 0, idx: 0, sub: 0, categoryName: 'WCA', itemName: '3x3x3', displayName: 'WCA · 3x3x3' },
      multiPhase: 0,
      averageSetting: null,
      sorting: 1,
      solveCount: 3,
      firstSolveAt: '2024-01-01 10:00:00',
      lastSolveAt: '2025-02-01 10:00:00',
    },
    {
      id: 2,
      name: 'Old Session',
      puzzleTypeCode: 5,
      puzzle: { code: 5, idx: 0, sub: 5, categoryName: 'WCA', itemName: '3x3 OH', displayName: 'WCA · 3x3 OH' },
      multiPhase: 0,
      averageSetting: null,
      sorting: 2,
      solveCount: 1,
      firstSolveAt: '2024-01-02 10:00:00',
      lastSolveAt: '2024-01-02 10:00:00',
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
    },
    {
      id: 2,
      sessionId: 1,
      baseTimeMs: 1100,
      penalty: 1,
      isDnf: false,
      finalTimeMs: 3100,
      scramble: null,
      recordedAt: '2025-02-01 10:00:00',
      note: null,
      phases: [],
      moves: null,
      sourceTable: 'resulttb',
    },
    {
      id: 3,
      sessionId: 2,
      baseTimeMs: 1200,
      penalty: 2,
      isDnf: true,
      finalTimeMs: null,
      scramble: null,
      recordedAt: '2024-01-02 10:00:00',
      note: null,
      phases: [],
      moves: null,
      sourceTable: 'resulttb',
    },
  ],
}

describe('analyzer store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updates filtered results when year changes', () => {
    const store = useAnalyzerStore()
    store.setSummary(summaryFixture)

    expect(store.filter.selectedYear).toBe(2025)
    expect(store.filteredSolves).toHaveLength(2)
    expect(store.filteredSessions.map((session) => session.id)).toEqual([1])

    store.setSelectedYear(2024)

    expect(store.filteredSolves).toHaveLength(1)
    expect(store.filteredSessions.map((session) => session.id)).toEqual([2])
  })

  it('updates summary metrics from filtered solves', () => {
    const store = useAnalyzerStore()
    store.setSummary(summaryFixture)

    expect(store.summaryMetrics?.totalSolves).toBe(2)
    expect(store.summaryMetrics?.totalPlus2).toBe(1)

    store.setSelectedYear(2024)

    expect(store.summaryMetrics?.totalSolves).toBe(1)
    expect(store.summaryMetrics?.totalDnf).toBe(1)
  })
})
