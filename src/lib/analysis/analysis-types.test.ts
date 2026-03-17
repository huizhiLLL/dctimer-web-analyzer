import { describe, expect, it } from 'vitest'
import type { SummaryMetrics } from './types'

describe('analysis types', () => {
  it('supports summary metrics shape', () => {
    const summary: SummaryMetrics = {
      totalSolves: 1,
      totalValidSolves: 1,
      totalDnf: 0,
      dnfRate: 0,
      totalPlus2: 0,
      plus2Rate: 0,
      bestSingleMs: 1234,
      firstSolveAt: '2026-01-01 10:00:00',
      lastSolveAt: '2026-01-01 10:00:00',
    }

    expect(summary.totalSolves).toBe(1)
  })
})
