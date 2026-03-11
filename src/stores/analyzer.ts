import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ImportDatabaseSummary, SessionEntity } from '../lib/db/types'

export type AnalyzerFilter = {
  selectedYear: number | 'all'
  includedSessionIds: number[]
}

function sortSessions(sessions: SessionEntity[]) {
  return [...sessions].sort((a, b) => {
    if (a.sorting !== b.sorting) {
      return a.sorting - b.sorting
    }

    return a.id - b.id
  })
}

export const useAnalyzerStore = defineStore('analyzer', () => {
  const summary = ref<ImportDatabaseSummary | null>(null)
  const filter = ref<AnalyzerFilter>({
    selectedYear: 'all',
    includedSessionIds: [],
  })

  const availableYears = computed(() => summary.value?.overview.yearRange ?? [])
  const sessions = computed(() => sortSessions(summary.value?.sessions ?? []))
  const allSessionIds = computed(() => sessions.value.map((session) => session.id))

  const filteredSessions = computed(() => {
    const selectedIds = new Set(filter.value.includedSessionIds)

    return sessions.value.filter((session) => {
      if (selectedIds.size > 0 && !selectedIds.has(session.id)) {
        return false
      }

      if (filter.value.selectedYear === 'all') {
        return true
      }

      if (!session.lastSolveAt && !session.firstSolveAt) {
        return false
      }

      const targets = [session.firstSolveAt, session.lastSolveAt].filter((value): value is string => Boolean(value))
      return targets.some((value) => value.startsWith(String(filter.value.selectedYear)))
    })
  })

  function setSummary(nextSummary: ImportDatabaseSummary) {
    summary.value = nextSummary
    const years = nextSummary.overview.yearRange
    let latestYear: AnalyzerFilter['selectedYear'] = 'all'

    if (years.length > 0) {
      const candidate = years[years.length - 1]
      if (candidate !== undefined) {
        latestYear = candidate
      }
    }

    filter.value = {
      selectedYear: latestYear,
      includedSessionIds: sortSessions(nextSummary.sessions).map((session) => session.id),
    }
  }

  function setSelectedYear(year: number | 'all') {
    filter.value.selectedYear = year
  }

  function toggleSession(sessionId: number) {
    const selected = new Set(filter.value.includedSessionIds)

    if (selected.has(sessionId)) {
      selected.delete(sessionId)
    } else {
      selected.add(sessionId)
    }

    filter.value.includedSessionIds = Array.from(selected)
  }

  function selectAllSessions() {
    filter.value.includedSessionIds = allSessionIds.value
  }

  function clearSessions() {
    filter.value.includedSessionIds = []
  }

  return {
    summary,
    filter,
    availableYears,
    sessions,
    filteredSessions,
    setSummary,
    setSelectedYear,
    toggleSession,
    selectAllSessions,
    clearSessions,
  }
})
