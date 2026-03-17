<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { TrendingUp } from 'lucide-vue-next'
import { useAnalyzerStore } from '../stores/analyzer'

const router = useRouter()
const analyzer = useAnalyzerStore()

const hasSummary = computed(() => Boolean(analyzer.summary))
const hasFilteredSessions = computed(() => analyzer.filteredSessions.length > 0)
const overview = computed(() => analyzer.summaryMetrics)

const topSessions = computed(() => analyzer.sessionStats.slice(0, 5))
const puzzleDistribution = computed(() => analyzer.puzzleStats.slice(0, 6))

const yearDistribution = computed(() => {
  const bucket = new Map<string, number>()

  for (const solve of analyzer.filteredSolves) {
    const year = solve.recordedYear === null ? '未知' : String(solve.recordedYear)
    bucket.set(year, (bucket.get(year) ?? 0) + 1)
  }

  return Array.from(bucket.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
})

const insights = computed(() => {
  const topSession = analyzer.sessionStats[0] ?? null
  const topPuzzle = analyzer.puzzleStats[0] ?? null
  const topYear = [...yearDistribution.value].sort((a, b) => b.count - a.count)[0] ?? null
  const latestSession = [...analyzer.sessionStats]
    .filter((session) => session.lastSolveAt)
    .sort((a, b) => (b.lastSolveAt ?? '').localeCompare(a.lastSolveAt ?? ''))[0] ?? null

  return [
    {
      title: 'Most active session',
      value: topSession?.sessionName ?? 'No data',
      meta: topSession ? `${topSession.solveCount} solves recorded` : 'Import and select sessions to populate this card.',
    },
    {
      title: 'Most practiced puzzle',
      value: topPuzzle?.puzzleDisplayName ?? 'No data',
      meta: topPuzzle ? `${topPuzzle.solveCount} solves recorded` : 'Import and select sessions to populate this card.',
    },
    {
      title: 'Busiest year',
      value: topYear?.year ?? 'No data',
      meta: topYear ? `${topYear.count} solves recorded` : 'Import and select sessions to populate this card.',
    },
    {
      title: 'Latest session touched',
      value: latestSession?.sessionName ?? 'No data',
      meta: latestSession?.lastSolveAt ?? 'Import and select sessions to populate this card.',
    },
  ]
})

const maxSessionCount = computed(() => Math.max(...topSessions.value.map((item) => item.solveCount), 1))
const maxPuzzleCount = computed(() => Math.max(...puzzleDistribution.value.map((item) => item.solveCount), 1))
const maxYearCount = computed(() => Math.max(...yearDistribution.value.map((item) => item.count), 1))

function barWidth(value: number, max: number) {
  return `${Math.max((value / max) * 100, 8)}%`
}

function goFilters() {
  router.push('/filters')
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Analysis Result / 分析结果</p>
        <h1 class="brand">训练报告</h1>
        <p class="topbar-tagline">把筛选后的练习数据整理成更柔和、更易读的一页结果摘要。</p>
      </div>
      <button class="btn btn-secondary topbar-button" type="button" @click="goFilters">返回筛选页</button>
    </header>

    <main class="page-wrap">
      <section v-if="!hasSummary" class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">No Report Yet / 暂无报告</p>
          <h3>现在还没有可以展示的内容。</h3>
          <p>请先导入数据库并完成分组筛选，之后这里才会生成对应的训练结果摘要。</p>
        </div>
      </section>

      <section v-else-if="!hasFilteredSessions" class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">Empty Range / 当前为空</p>
          <h3>这一组筛选条件下没有留下可分析的数据。</h3>
          <p>返回筛选页调整年份或分组后，再回来生成报告会更合适。</p>
        </div>
      </section>

      <template v-else>
        <section class="hero-card filter-hero-card">
          <div class="hero-copy">
            <p class="hero-kicker">Result Overview / 结果总览</p>
            <h2 class="hero-title">把这段训练历史，收成一页更有秩序的快照。</h2>
            <p class="hero-text">
              这一页先展示基础统计、训练分布和关键发现，帮助你更快读懂这次筛选后的训练结果。
            </p>
          </div>

          <div class="hero-panel filter-summary-panel">
            <div class="mini-card">
              <span class="mini-label">时间范围</span>
              <strong>{{ analyzer.filter.selectedYear === 'all' ? '全部时间' : analyzer.filter.selectedYear }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">分组</span>
              <strong>{{ analyzer.filteredSessions.length }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">成绩</span>
              <strong>{{ overview?.totalSolves ?? 0 }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">有效成绩</span>
              <strong>{{ overview?.totalValidSolves ?? 0 }}</strong>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Overview / 基础概览</p>
            <h3>基础指标</h3>
          </div>

          <div class="report-grid report-grid-overview">
            <div class="mini-card"><span class="mini-label">DNF</span><strong>{{ overview?.totalDnf ?? 0 }}</strong></div>
            <div class="mini-card"><span class="mini-label">+2</span><strong>{{ overview?.totalPlus2 ?? 0 }}</strong></div>
            <div class="mini-card"><span class="mini-label">最早记录</span><strong>{{ overview?.firstSolveAt ?? '暂无' }}</strong></div>
            <div class="mini-card"><span class="mini-label">最近记录</span><strong>{{ overview?.lastSolveAt ?? '暂无' }}</strong></div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Distribution / 分布情况</p>
            <h3>训练量主要落在哪里</h3>
          </div>

          <div class="report-grid report-grid-distribution">
            <article class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">By Session / 按分组</span>
                <span class="table-list-meta">当前筛选范围内，成绩数量最多的几个分组。</span>
              </div>
              <ul class="bar-list">
                <li v-for="session in topSessions" :key="session.sessionId" class="bar-item">
                  <div class="bar-row">
                    <strong>{{ session.sessionName }}</strong>
                    <span>{{ session.solveCount }}</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(session.solveCount, maxSessionCount) }"></div></div>
                </li>
              </ul>
            </article>

            <article class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">By Puzzle / 按项目</span>
                <span class="table-list-meta">筛选后各项目类型的成绩分布。</span>
              </div>
              <ul class="bar-list">
                <li v-for="item in puzzleDistribution" :key="item.puzzleDisplayName" class="bar-item">
                  <div class="bar-row">
                    <strong>{{ item.puzzleDisplayName }}</strong>
                    <span>{{ item.solveCount }}</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(item.solveCount, maxPuzzleCount) }"></div></div>
                </li>
              </ul>
            </article>

            <article class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">By Year / 按年份</span>
                <span class="table-list-meta">当前筛选结果中的年份分布。</span>
              </div>
              <ul class="bar-list">
                <li v-for="item in yearDistribution" :key="item.year" class="bar-item">
                  <div class="bar-row">
                    <strong>{{ item.year }}</strong>
                    <span>{{ item.count }}</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(item.count, maxYearCount) }"></div></div>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Insights / 重点发现</p>
            <h3>快速读数</h3>
          </div>

          <div class="insight-grid">
            <article v-for="item in insights" :key="item.title" class="feature-card insight-card">
              <div class="feature-icon">
                <TrendingUp :size="20" />
              </div>
              <h4>{{ item.title }}</h4>
              <strong class="insight-value">{{ item.value }}</strong>
              <p>{{ item.meta }}</p>
            </article>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Session List / 分组列表</p>
            <h3>本次报告纳入的全部分组</h3>
          </div>

          <ul class="session-list session-list-dense">
            <li v-for="session in analyzer.sessionStats" :key="session.sessionId" class="session-item session-item-stacked">
              <div>
                <strong>{{ session.sessionName }}</strong>
                <p>{{ session.puzzleDisplayName ?? '未知项目' }}</p>
              </div>
              <div class="session-side-meta">
                <span>{{ session.solveCount }} 条成绩</span>
                <span>{{ session.firstSolveAt ?? '起始时间未知' }} 至 {{ session.lastSolveAt ?? '结束时间未知' }}</span>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>
