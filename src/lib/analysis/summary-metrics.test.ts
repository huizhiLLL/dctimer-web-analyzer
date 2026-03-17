import { describe, expect, it } from 'vitest'
import { buildSummaryMetrics } from './summary-metrics'
import type { EnrichedSolveEntity } from './types'

describe('buildSummaryMetrics', () => {
  it('computes summary counts from filtered solves', () => {
    const solves = [
      { finalTimeMs: 1000, isDnf: false, penalty: 0, recordedAt: '2025-01-01 10:00:00' },
      { finalTimeMs: 1200, isDnf: false, penalty: 1, recordedAt: '2025-01-02 10:00:00' },
      { finalTimeMs: null, isDnf: true, penalty: 2, recordedAt: '2025-01-03 10:00:00' },
    ] as EnrichedSolveEntity[]

    const result = buildSummaryMetrics(solves)

    expect(result.totalSolves).toBe(3)
    expect(result.totalValidSolves).toBe(2)
    expect(result.totalDnf).toBe(1)
    expect(result.totalPlus2).toBe(1)
    expect(result.bestSingleMs).toBe(1000)
  })
})
