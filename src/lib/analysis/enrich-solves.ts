import type { SolveEntity } from '../db/types'
import type { EnrichedSolveEntity } from './types'

function parseRecordedAtParts(recordedAt: string | null) {
  if (!recordedAt || recordedAt.length < 13) {
    return {
      recordedYear: null,
      recordedMonth: null,
      recordedDate: null,
      recordedHour: null,
      recordedWeekday: null,
    }
  }

  const recordedYear = Number.parseInt(recordedAt.slice(0, 4), 10)
  const recordedMonth = recordedAt.slice(0, 7)
  const recordedDate = recordedAt.slice(0, 10)
  const recordedHour = Number.parseInt(recordedAt.slice(11, 13), 10)
  const isoLike = recordedAt.replace(' ', 'T')
  const date = new Date(isoLike)

  return {
    recordedYear: Number.isNaN(recordedYear) ? null : recordedYear,
    recordedMonth: recordedMonth.length === 7 ? recordedMonth : null,
    recordedDate: recordedDate.length === 10 ? recordedDate : null,
    recordedHour: Number.isNaN(recordedHour) ? null : recordedHour,
    recordedWeekday: Number.isNaN(date.getTime()) ? null : date.getDay(),
  }
}

export function enrichSolves(solves: SolveEntity[]): EnrichedSolveEntity[] {
  return solves.map((solve) => ({
    ...solve,
    ...parseRecordedAtParts(solve.recordedAt),
    hasNote: Boolean(solve.note?.trim()),
    hasMoves: Boolean(solve.moves?.trim()),
    phaseCount: solve.phases.length,
  }))
}
