import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { enrichSolves } from '../lib/analysis/enrich-solves'
import { buildFilteredDataset } from '../lib/analysis/filter-dataset'
import { buildPuzzleStats } from '../lib/analysis/puzzle-stats'
import { buildSessionStats } from '../lib/analysis/session-stats'
import { buildSummaryMetrics } from '../lib/analysis/summary-metrics'
import type {
  AnalyzerFilter,
  FilteredDataset,
  PuzzleStats,
  SessionStats,
  SummaryMetrics,
} from '../lib/analysis/types'
import type { ImportDatabaseSummary, SessionEntity } from '../lib/db/types'

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
  const enrichedSolves = computed(() => enrichSolves(summary.value?.solves ?? []))

  const filteredDataset = computed<FilteredDataset | null>(() => {
    if (!summary.value) {
      return null
    }

    return buildFilteredDataset({
      filter: filter.value,
      sessions: sessions.value,
      solves: enrichedSolves.value,
    })
  })

  const filteredSessions = computed(() => filteredDataset.value?.sessions ?? [])
  const filteredSolves = computed(() => filteredDataset.value?.solves ?? [])
  const summaryMetrics = computed<SummaryMetrics | null>(() =>
    filteredDataset.value ? buildSummaryMetrics(filteredDataset.value.solves) : null,
  )
  const sessionStats = computed<SessionStats[]>(() =>
    filteredDataset.value ? buildSessionStats(filteredDataset.value) : [],
  )
  const puzzleStats = computed<PuzzleStats[]>(() =>
    filteredDataset.value ? buildPuzzleStats(filteredDataset.value) : [],
  )

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
    enrichedSolves,
    filteredDataset,
    filteredSessions,
    filteredSolves,
    summaryMetrics,
    sessionStats,
    puzzleStats,
    setSummary,
    setSelectedYear,
    toggleSession,
    selectAllSessions,
    clearSessions,
  }
})
