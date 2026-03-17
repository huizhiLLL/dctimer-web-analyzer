import type { FilteredDataset, SessionStats } from './types'

export function buildSessionStats(dataset: FilteredDataset): SessionStats[] {
  return dataset.sessions
    .map((session) => {
      const solves = dataset.solves.filter((solve) => solve.sessionId === session.id)
      const validSolves = solves.filter((solve) => !solve.isDnf && solve.finalTimeMs !== null)
      const dated = solves
        .map((solve) => solve.recordedAt)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => a.localeCompare(b))
      const dnfCount = solves.filter((solve) => solve.isDnf).length

      return {
        sessionId: session.id,
        sessionName: session.name,
        puzzleTypeCode: session.puzzleTypeCode,
        puzzleDisplayName: session.puzzle?.displayName ?? null,
        solveCount: solves.length,
        validSolveCount: validSolves.length,
        dnfCount,
        dnfRate: solves.length === 0 ? 0 : dnfCount / solves.length,
        bestSingleMs: validSolves.length === 0 ? null : Math.min(...validSolves.map((solve) => solve.finalTimeMs as number)),
        firstSolveAt: dated[0] ?? null,
        lastSolveAt: dated[dated.length - 1] ?? null,
      }
    })
    .sort((a, b) => b.solveCount - a.solveCount || a.sessionId - b.sessionId)
}
