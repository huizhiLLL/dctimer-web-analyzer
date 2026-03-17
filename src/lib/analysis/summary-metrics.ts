import type { EnrichedSolveEntity, SummaryMetrics } from './types'

export function buildSummaryMetrics(solves: EnrichedSolveEntity[]): SummaryMetrics {
  const validSolves = solves.filter((solve) => !solve.isDnf && solve.finalTimeMs !== null)
  const totalDnf = solves.filter((solve) => solve.isDnf).length
  const totalPlus2 = solves.filter((solve) => solve.penalty === 1).length
  const dated = solves
    .map((solve) => solve.recordedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b))

  return {
    totalSolves: solves.length,
    totalValidSolves: validSolves.length,
    totalDnf,
    dnfRate: solves.length === 0 ? 0 : totalDnf / solves.length,
    totalPlus2,
    plus2Rate: solves.length === 0 ? 0 : totalPlus2 / solves.length,
    bestSingleMs: validSolves.length === 0 ? null : Math.min(...validSolves.map((solve) => solve.finalTimeMs as number)),
    firstSolveAt: dated[0] ?? null,
    lastSolveAt: dated[dated.length - 1] ?? null,
  }
}
