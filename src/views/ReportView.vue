<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { TrendingUp } from 'lucide-vue-next'
import { useAnalyzerStore } from '../stores/analyzer'

const router = useRouter()
const analyzer = useAnalyzerStore()

const hasSummary = computed(() => Boolean(analyzer.summary))
const selectedSessionIds = computed(() => new Set(analyzer.filter.includedSessionIds))

const filteredSolves = computed(() => {
  const solves = analyzer.summary?.solves ?? []
  const year = analyzer.filter.selectedYear

  return solves.filter((solve) => {
    if (!selectedSessionIds.value.has(solve.sessionId)) {
      return false
    }

    if (year === 'all') {
      return true
    }

    if (!solve.recordedAt) {
      return false
    }

    return solve.recordedAt.startsWith(String(year))
  })
})

const overview = computed(() => {
  const solves = filteredSolves.value
  const dated = solves
    .map((solve) => solve.recordedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b))

  return {
    year: analyzer.filter.selectedYear,
    sessionCount: analyzer.filteredSessions.length,
    solveCount: solves.length,
    validSolveCount: solves.filter((solve) => !solve.isDnf).length,
    dnfCount: solves.filter((solve) => solve.isDnf).length,
    plus2Count: solves.filter((solve) => solve.penalty === 1).length,
    firstSolveAt: dated[0] ?? null,
    lastSolveAt: dated[dated.length - 1] ?? null,
  }
})

const topSessions = computed(() => {
  return [...analyzer.filteredSessions]
    .sort((a, b) => b.solveCount - a.solveCount || a.sorting - b.sorting || a.id - b.id)
    .slice(0, 5)
})

const puzzleDistribution = computed(() => {
  const map = new Map<string, number>()

  for (const session of analyzer.filteredSessions) {
    const key = session.puzzle?.displayName ?? '未知项目'
    map.set(key, (map.get(key) ?? 0) + session.solveCount)
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

const yearDistribution = computed(() => {
  const map = new Map<string, number>()

  for (const solve of filteredSolves.value) {
    const key = solve.recordedAt?.slice(0, 4) ?? '未知'
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
})

const insights = computed(() => {
  const sessions = analyzer.filteredSessions

  const topSession = [...sessions].sort((a, b) => b.solveCount - a.solveCount || a.id - b.id)[0] ?? null
  const latestSession = [...sessions]
    .filter((session) => session.lastSolveAt)
    .sort((a, b) => (b.lastSolveAt ?? '').localeCompare(a.lastSolveAt ?? ''))[0] ?? null

  const topPuzzle = puzzleDistribution.value[0] ?? null
  const topYear = [...yearDistribution.value].sort((a, b) => b.count - a.count)[0] ?? null

  return [
    {
      title: '练得最多的分组',
      value: topSession ? topSession.name : '暂无',
      meta: topSession ? `${topSession.solveCount} 条成绩` : '还没有可用数据',
    },
    {
      title: '记录最多的项目',
      value: topPuzzle ? topPuzzle.name : '暂无',
      meta: topPuzzle ? `${topPuzzle.count} 条成绩` : '还没有可用数据',
    },
    {
      title: '最活跃的年份',
      value: topYear ? topYear.year : '暂无',
      meta: topYear ? `${topYear.count} 条成绩` : '还没有可用数据',
    },
    {
      title: '最近还在练的分组',
      value: latestSession ? latestSession.name : '暂无',
      meta: latestSession?.lastSolveAt ?? '还没有可用数据',
    },
  ]
})

const maxSessionCount = computed(() => Math.max(...topSessions.value.map((item) => item.solveCount), 1))
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
        <p class="eyebrow">结果报告</p>
        <h1 class="brand">训练结果</h1>
      </div>
      <button class="btn btn-secondary topbar-button" type="button" @click="goFilters">返回筛选</button>
    </header>

    <main class="page-wrap">
      <section v-if="!hasSummary" class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">尚无数据</p>
          <h3>还没有可查看的报告</h3>
          <p>先导入数据库并完成筛选，这里才会生成结果。</p>
        </div>
      </section>

      <template v-else>
        <section class="hero-card filter-hero-card">
          <div class="hero-copy">
            <p class="hero-kicker">结果概览</p>
            <h2 class="hero-title">这是一份基于当前筛选条件生成的训练结果。</h2>
            <p class="hero-text">
              先看总览，再看分布和重点结论。后面的页面可以继续在这版基础上补充图表和叙事。
            </p>
          </div>

          <div class="hero-panel filter-summary-panel">
            <div class="mini-card">
              <span class="mini-label">当前范围</span>
              <strong>{{ overview.year === 'all' ? '全部时间' : overview.year }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">分组数</span>
              <strong>{{ overview.sessionCount }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">成绩数</span>
              <strong>{{ overview.solveCount }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">有效成绩</span>
              <strong>{{ overview.validSolveCount }}</strong>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">总览</p>
            <h3>基础情况</h3>
            <p>先看这次筛选之后还剩下多少数据。</p>
          </div>

          <div class="report-grid report-grid-overview">
            <div class="mini-card"><span class="mini-label">DNF</span><strong>{{ overview.dnfCount }}</strong></div>
            <div class="mini-card"><span class="mini-label">+2</span><strong>{{ overview.plus2Count }}</strong></div>
            <div class="mini-card"><span class="mini-label">最早记录</span><strong>{{ overview.firstSolveAt ?? '暂无' }}</strong></div>
            <div class="mini-card"><span class="mini-label">最近记录</span><strong>{{ overview.lastSolveAt ?? '暂无' }}</strong></div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">分布</p>
            <h3>训练分布</h3>
            <p>先用简单条目把重点分布排出来。</p>
          </div>

          <div class="report-grid report-grid-distribution">
            <article class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">分组成绩数</span>
                <span class="table-list-meta">按当前筛选后的分组统计。</span>
              </div>
              <ul class="bar-list">
                <li v-for="session in topSessions" :key="session.id" class="bar-item">
                  <div class="bar-row">
                    <strong>{{ session.name }}</strong>
                    <span>{{ session.solveCount }}</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(session.solveCount, maxSessionCount) }"></div></div>
                </li>
              </ul>
            </article>

            <article class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">年份分布</span>
                <span class="table-list-meta">按成绩记录时间统计。</span>
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
            <p class="section-kicker">结论</p>
            <h3>重点发现</h3>
            <p>先把最容易读懂的几条信息提出来。</p>
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
            <p class="section-kicker">分组列表</p>
            <h3>筛选后的分组</h3>
            <p>这里保留完整分组列表，方便继续核对。</p>
          </div>

          <ul class="session-list session-list-dense">
            <li v-for="session in analyzer.filteredSessions" :key="session.id" class="session-item session-item-stacked">
              <div>
                <strong>{{ session.name }}</strong>
                <p>{{ session.puzzle?.displayName ?? '未知项目' }}</p>
              </div>
              <div class="session-side-meta">
                <span>{{ session.solveCount }} 条成绩</span>
                <span>{{ session.firstSolveAt ?? '时间未知' }} → {{ session.lastSolveAt ?? '时间未知' }}</span>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>
