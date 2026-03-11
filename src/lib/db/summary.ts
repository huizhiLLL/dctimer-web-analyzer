import type { SessionEntity, SolveEntity } from './types'

function compareRecordedAt(a: string | null, b: string | null) {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}

function collectYears(solves: SolveEntity[]) {
  const years = new Set<number>()

  for (const solve of solves) {
    if (!solve.recordedAt) continue

    const year = Number.parseInt(solve.recordedAt.slice(0, 4), 10)
    if (!Number.isNaN(year)) {
      years.add(year)
    }
  }

  return Array.from(years).sort((a, b) => a - b)
}

export function enrichSessionsWithSolveStats(sessions: SessionEntity[], solves: SolveEntity[]) {
  const bucket = new Map<number, SolveEntity[]>()

  for (const solve of solves) {
    const list = bucket.get(solve.sessionId)
    if (list) {
      list.push(solve)
    } else {
      bucket.set(solve.sessionId, [solve])
    }
  }

  return sessions.map((session) => {
    const sessionSolves = bucket.get(session.id) ?? []
    const datedSolves = sessionSolves
      .map((solve) => solve.recordedAt)
      .filter((value): value is string => Boolean(value))
      .sort(compareRecordedAt)

    return {
      ...session,
      solveCount: sessionSolves.length,
      firstSolveAt: datedSolves[0] ?? null,
      lastSolveAt: datedSolves[datedSolves.length - 1] ?? null,
    }
  })
}

export function buildDatabaseOverview(sessions: SessionEntity[], solves: SolveEntity[]) {
  const validSolves = solves.filter((solve) => !solve.isDnf)
  const datedSolves = solves
    .map((solve) => solve.recordedAt)
    .filter((value): value is string => Boolean(value))
    .sort(compareRecordedAt)

  return {
    sessionCount: sessions.length,
    solveCount: solves.length,
    validSolveCount: validSolves.length,
    dnfCount: solves.filter((solve) => solve.isDnf).length,
    plus2Count: solves.filter((solve) => solve.penalty === 1).length,
    yearRange: collectYears(solves),
    firstSolveAt: datedSolves[0] ?? null,
    lastSolveAt: datedSolves[datedSolves.length - 1] ?? null,
  }
}
