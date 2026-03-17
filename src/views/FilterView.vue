<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Layers3, CalendarRange, CheckCheck, Eraser, BarChart3 } from 'lucide-vue-next'
import { useAnalyzerStore } from '../stores/analyzer'

const router = useRouter()
const analyzer = useAnalyzerStore()

const hasSummary = computed(() => Boolean(analyzer.summary))
const selectedCount = computed(() => analyzer.filter.includedSessionIds.length)
const hasFilteredSessions = computed(() => analyzer.filteredSessions.length > 0)

function goHome() {
  router.push('/')
}

function goReport() {
  router.push('/report')
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Range Filter / 范围筛选</p>
        <h1 class="brand">选择这份报告要使用的数据范围</h1>
        <p class="topbar-tagline">保留你真正想写进报告里的年份和分组，把结果收束得更干净。</p>
      </div>
      <button class="btn btn-secondary topbar-button" type="button" @click="goHome">返回首页</button>
    </header>

    <main class="page-wrap">
      <section v-if="!hasSummary" class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">No Data Yet / 暂无数据</p>
          <h3>请先导入数据库，再进行筛选。</h3>
          <p>当首页完成 `.db` 文件检查后，这里就会出现可选的年份范围和分组列表。</p>
        </div>
      </section>

      <template v-else>
        <section class="section-block">
          <div class="section-heading">
            <p class="section-kicker">Step 1 / 第一步</p>
            <h3>选择时间范围</h3>
            <p>可以保留全部年份，也可以先聚焦某一年，再继续决定哪些分组要进入报告。</p>
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
            <p class="section-kicker">Step 2 / 第二步</p>
            <h3>挑选要纳入的分组</h3>
            <p>把真正能代表这份训练报告的分组留下来，让最终结果更聚焦，也更有表达性。</p>
          </div>

          <div class="filter-toolbar filter-toolbar-actions">
            <button class="pill-button" type="button" @click="analyzer.selectAllSessions()">
              <CheckCheck :size="16" />
              全选
            </button>
            <button class="pill-button" type="button" @click="analyzer.clearSessions()">
              <Eraser :size="16" />
              清空
            </button>
            <button class="pill-button pill-button-primary" type="button" @click="goReport" :disabled="!selectedCount">
              <BarChart3 :size="16" />
              查看报告
            </button>
          </div>

          <div v-if="hasFilteredSessions" class="filter-session-grid">
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
              <p>{{ session.puzzle?.displayName ?? '未知项目' }}</p>

              <div class="filter-session-meta">
                <span>{{ session.solveCount }} 条成绩</span>
                <span v-if="session.lastSolveAt">{{ session.lastSolveAt }}</span>
              </div>
            </label>
          </div>

          <div v-else class="section-heading narrow">
            <p>当前年份和分组条件下没有可分析的数据，可以切换年份或重新选择分组。</p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
