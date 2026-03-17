import type { SessionEntity } from '../db/types'
import type { AnalyzerFilter, EnrichedSolveEntity, FilteredDataset } from './types'

type BuildFilteredDatasetInput = {
  filter: AnalyzerFilter
  sessions: SessionEntity[]
  solves: EnrichedSolveEntity[]
}

export function buildFilteredDataset(input: BuildFilteredDatasetInput): FilteredDataset {
  const includedIds = new Set(input.filter.includedSessionIds)
  const solves = input.solves.filter((solve) => {
    if (includedIds.size > 0 && !includedIds.has(solve.sessionId)) {
      return false
    }

    if (input.filter.selectedYear === 'all') {
      return true
    }

    return solve.recordedYear === input.filter.selectedYear
  })

  const activeSessionIds = new Set(solves.map((solve) => solve.sessionId))
  const sessions = input.sessions.filter((session) => activeSessionIds.has(session.id))

  return {
    filter: input.filter,
    sessions,
    solves,
    includedSessionMap: new Map(sessions.map((session) => [session.id, session])),
  }
}
