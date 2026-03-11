<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Layers3, CalendarRange, CheckCheck, Eraser } from 'lucide-vue-next'
import { useAnalyzerStore } from '../stores/analyzer'

const router = useRouter()
const analyzer = useAnalyzerStore()

const hasSummary = computed(() => Boolean(analyzer.summary))
const selectedCount = computed(() => analyzer.filter.includedSessionIds.length)

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Analyzer Filters</p>
        <h1 class="brand">分组筛选</h1>
      </div>
      <button class="btn btn-secondary topbar-button" type="button" @click="goHome">返回导入页</button>
    </header>

    <main class="page-wrap">
      <section v-if="!hasSummary" class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">No Data</p>
          <h3>还没有导入数据库喵</h3>
          <p>先回首页导入 `.db` 文件，筛选页才会有东西可以选。</p>
        </div>
      </section>

      <template v-else>
        <section class="hero-card filter-hero-card">
          <div class="hero-copy">
            <p class="hero-kicker">Year + Sessions</p>
            <h2 class="hero-title">先把要分析的范围圈出来。</h2>
            <p class="hero-text">
              先选年份，再挑要纳入报告的分组。后面生成年报、趋势图和故事文案都会基于这里的结果。
            </p>
          </div>

          <div class="hero-panel filter-summary-panel">
            <div class="mini-card">
              <span class="mini-label">当前年份</span>
              <strong>{{ analyzer.filter.selectedYear === 'all' ? '全部时间' : analyzer.filter.selectedYear }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">已选分组</span>
              <strong>{{ selectedCount }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">可选年份</span>
              <strong>{{ analyzer.availableYears.length || '—' }}</strong>
            </div>
            <div class="mini-card">
              <span class="mini-label">筛后分组</span>
              <strong>{{ analyzer.filteredSessions.length }}</strong>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Step 1</p>
            <h3>选择年份</h3>
            <p>首版先提供全部时间和按年份切换，后面再补自定义时间范围。</p>
          </div>

          <div class="filter-toolbar">
            <button
              class="pill-button"
              :data-active="analyzer.filter.selectedYear === 'all'"
              type="button"
              @click="analyzer.setSelectedYear('all')"
            >
              <CalendarRange :size="16" />
              全部时间
            </button>

            <button
              v-for="year in analyzer.availableYears"
              :key="year"
              class="pill-button"
              :data-active="analyzer.filter.selectedYear === year"
              type="button"
              @click="analyzer.setSelectedYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Step 2</p>
            <h3>选择分组</h3>
            <p>先保留有价值的训练分组，把测试组、临时组和噪音数据剔掉。</p>
          </div>

          <div class="filter-toolbar filter-toolbar-actions">
            <button class="pill-button" type="button" @click="analyzer.selectAllSessions()">
              <CheckCheck :size="16" />
              全选
            </button>
            <button class="pill-button" type="button" @click="analyzer.clearSessions()">
              <Eraser :size="16" />
              全不选
            </button>
          </div>

          <div class="filter-session-grid">
            <label
              v-for="session in analyzer.filteredSessions"
              :key="session.id"
              class="filter-session-card"
              :data-selected="analyzer.filter.includedSessionIds.includes(session.id)"
            >
              <input
                class="hidden-input"
                type="checkbox"
                :checked="analyzer.filter.includedSessionIds.includes(session.id)"
                @change="analyzer.toggleSession(session.id)"
              />

              <div class="filter-session-head">
                <div class="feature-icon">
                  <Layers3 :size="18" />
                </div>
                <span>#{{ session.id }}</span>
              </div>

              <strong>{{ session.name }}</strong>
              <p>{{ session.puzzle?.displayName ?? 'Unknown puzzle type' }}</p>

              <div class="filter-session-meta">
                <span>{{ session.solveCount }} solves</span>
                <span v-if="session.lastSolveAt">{{ session.lastSolveAt }}</span>
              </div>
            </label>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
