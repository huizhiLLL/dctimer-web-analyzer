import { describe, expect, it } from 'vitest'
import { enrichSolves } from './enrich-solves'
import type { SolveEntity } from '../db/types'

describe('enrichSolves', () => {
  it('extracts time parts from recordedAt', () => {
    const solves: SolveEntity[] = [
      {
        id: 1,
        sessionId: 2,
        baseTimeMs: 1000,
        penalty: 0,
        isDnf: false,
        finalTimeMs: 1000,
        scramble: null,
        recordedAt: '2025-03-08 21:30:00',
        note: 'pb',
        phases: [300, 700],
        moves: "R U R'",
        sourceTable: 'resultstb',
      },
    ]

    const result = enrichSolves(solves)

    expect(result[0]?.recordedYear).toBe(2025)
    expect(result[0]?.recordedMonth).toBe('2025-03')
    expect(result[0]?.recordedDate).toBe('2025-03-08')
    expect(result[0]?.recordedHour).toBe(21)
    expect(result[0]?.phaseCount).toBe(2)
    expect(result[0]?.hasNote).toBe(true)
    expect(result[0]?.hasMoves).toBe(true)
  })

  it('keeps date fields null when recordedAt is missing', () => {
    const solves: SolveEntity[] = [
      {
        id: 1,
        sessionId: 2,
        baseTimeMs: 1000,
        penalty: 2,
        isDnf: true,
        finalTimeMs: null,
        scramble: null,
        recordedAt: null,
        note: null,
        phases: [],
        moves: null,
        sourceTable: 'resulttb',
      },
    ]

    const result = enrichSolves(solves)

    expect(result[0]?.recordedYear).toBeNull()
    expect(result[0]?.recordedMonth).toBeNull()
    expect(result[0]?.recordedDate).toBeNull()
    expect(result[0]?.recordedHour).toBeNull()
    expect(result[0]?.hasNote).toBe(false)
    expect(result[0]?.hasMoves).toBe(false)
  })
})
