import type { FilteredDataset, PuzzleStats } from './types'

export function buildPuzzleStats(dataset: FilteredDataset): PuzzleStats[] {
  const sessionMap = new Map(dataset.sessions.map((session) => [session.id, session]))
  const bucket = new Map<string, PuzzleStats>()

  for (const solve of dataset.solves) {
    const session = sessionMap.get(solve.sessionId)
    const puzzleDisplayName = session?.puzzle?.displayName ?? '未知项目'
    const key = `${session?.puzzleTypeCode ?? 'null'}:${puzzleDisplayName}`
    const current = bucket.get(key)

    if (current) {
      current.solveCount += 1
    } else {
      bucket.set(key, {
        puzzleTypeCode: session?.puzzleTypeCode ?? null,
        puzzleDisplayName,
        solveCount: 1,
      })
    }
  }

  return Array.from(bucket.values()).sort((a, b) => b.solveCount - a.solveCount || a.puzzleDisplayName.localeCompare(b.puzzleDisplayName))
}
