<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Database,
  ShieldCheck,
  Sparkles,
  FileSearch,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import { useAnalyzerStore } from '../stores/analyzer'
import { importDatabaseSummary } from '../lib/db/import-database'
import type { ImportDatabaseSummary } from '../lib/db/types'

const router = useRouter()
const app = useAppStore()
const analyzer = useAnalyzerStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isInspecting = ref(false)
const importError = ref('')
const summary = ref<ImportDatabaseSummary | null>(null)

const highlights = [
  {
    title: '本地解析',
    description: '直接在浏览器里读取 DCTimer 导出的 .db 文件，不经过服务器。',
    icon: Database,
  },
  {
    title: '分组筛选',
    description: '先选要分析的分组，再生成更像作品的年度总结，而不是杂乱统计页。',
    icon: Sparkles,
  },
  {
    title: '隐私友好',
    description: '数据留在你的设备上，适合长期成绩回顾与分享前预览。',
    icon: ShieldCheck,
  },
]

const detectedStatus = computed(() => {
  if (!summary.value) {
    return null
  }

  if (summary.value.check.isLikelyDctimer) {
    return {
      tone: 'success',
      label: '已识别为 DCTimer 数据库',
      icon: CheckCircle2,
    }
  }

  return {
    tone: 'warning',
    label: '文件能打开，但暂时不像 DCTimer 导出库',
    icon: AlertCircle,
  }
})

function openFilePicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  importError.value = ''
  summary.value = null
  isInspecting.value = true

  try {
    summary.value = await importDatabaseSummary(file)
    analyzer.setSummary(summary.value)
  } catch (error) {
    importError.value = error instanceof Error ? error.message : '文件读取失败，可能不是有效的 SQLite 数据库。'
  } finally {
    isInspecting.value = false
    input.value = ''
  }
}

function goToFilters() {
  router.push('/filters')
}

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">DCTimer Annual Report</p>
        <h1 class="brand">{{ app.appName }}</h1>
      </div>
      <div class="topbar-chip">SQLite Ready</div>
    </header>

    <main class="page-wrap">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="hero-kicker">纯前端 · 本地分析 · 年度总结风格</p>
          <h2 class="hero-title">把 DCTimer 的数据库，变成一份真正值得回看的年度报告。</h2>
          <p class="hero-text">
            {{ app.tagline }} 先筛选分组，再做汇总分析。现在已经可以直接导入 `.db` 文件，并查看 schema 探测结果。
          </p>

          <div class="hero-actions">
            <button class="btn btn-primary" type="button" @click="openFilePicker" :disabled="isInspecting">
              <FileSearch :size="18" />
              {{ isInspecting ? '正在读取数据库…' : '导入 .db 文件' }}
            </button>
            <button class="btn btn-secondary" type="button" @click="goToFilters" :disabled="!summary">进入分组筛选</button>
          </div>

          <input
            ref="fileInput"
            class="hidden-input"
            type="file"
            accept=".db,.sqlite,.sqlite3,application/octet-stream"
            @change="handleFileChange"
          />

          <p v-if="importError" class="status-inline status-inline-error">
            <AlertCircle :size="16" />
            {{ importError }}
          </p>
        </div>

        <div class="hero-panel" aria-label="产品预览卡片">
          <div v-if="summary" class="inspection-card">
            <div class="inspection-head">
              <div>
                <span class="stat-label">最近一次导入</span>
                <strong class="inspection-title">{{ summary.fileName }}</strong>
              </div>

              <span v-if="detectedStatus" class="status-pill" :data-tone="detectedStatus.tone">
                <component :is="detectedStatus.icon" :size="14" />
                {{ detectedStatus.label }}
              </span>
            </div>

            <div class="stat-grid">
              <div class="mini-card">
                <span class="mini-label">文件大小</span>
                <strong>{{ formatBytes(summary.fileSize) }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">表数量</span>
                <strong>{{ summary.schema.tableNames.length }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">结果表</span>
                <strong>{{ summary.check.resultTables.length }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">分组数量</span>
                <strong>{{ summary.overview.sessionCount }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">成绩数量</span>
                <strong>{{ summary.overview.solveCount }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">有效成绩</span>
                <strong>{{ summary.overview.validSolveCount }}</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">DNF 数量</span>
                <strong>{{ summary.overview.dnfCount }}</strong>
              </div>
            </div>

            <div class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">已探测到的表</span>
                <span class="table-list-meta">{{ summary.schema.tableNames.join(' · ') || '无' }}</span>
              </div>

              <ul class="chip-list">
                <li v-for="table in summary.schema.tableNames" :key="table" class="table-chip">
                  {{ table }}
                </li>
              </ul>
            </div>

            <div v-if="summary.sessions.length" class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">已解析的分组</span>
                <span class="table-list-meta">现在分组已经带上了解次统计，后面可以直接接筛选页了。</span>
              </div>

              <ul class="session-list">
                <li v-for="session in summary.sessions.slice(0, 8)" :key="session.id" class="session-item">
                  <div>
                    <strong>{{ session.name }}</strong>
                    <p>
                      {{ session.puzzle?.displayName ?? 'Unknown puzzle type' }}
                      · {{ session.solveCount }} solves
                      <template v-if="session.lastSolveAt"> · {{ session.lastSolveAt }}</template>
                    </p>
                  </div>
                  <span>#{{ session.id }}</span>
                </li>
              </ul>
            </div>

            <div v-if="summary.solves.length" class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">已解析的成绩数据</span>
                <span class="table-list-meta">
                  年份覆盖：{{ summary.overview.yearRange.join(' · ') || '未知' }}
                  <template v-if="summary.overview.firstSolveAt"> · 首条：{{ summary.overview.firstSolveAt }}</template>
                </span>
              </div>

              <ul class="session-list">
                <li v-for="solve in summary.solves.slice(0, 6)" :key="`${solve.sourceTable}-${solve.id}`" class="session-item">
                  <div>
                    <strong>Session #{{ solve.sessionId }} · {{ solve.isDnf ? 'DNF' : `${(solve.finalTimeMs ?? 0) / 1000}s` }}</strong>
                    <p>{{ solve.sourceTable }} · {{ solve.recordedAt ?? '无记录时间' }}</p>
                  </div>
                  <span>#{{ solve.id }}</span>
                </li>
              </ul>
            </div>
          </div>

          <template v-else>
            <div class="stat-card stat-card-primary">
              <span class="stat-label">当前进度</span>
              <strong class="stat-value">Schema Probe</strong>
              <span class="stat-meta">已经接入 sql.js，可读取 SQLite 并识别 DCTimer 关键表。</span>
            </div>

            <div class="stat-grid">
              <div class="mini-card">
                <span class="mini-label">SQLite 引擎</span>
                <strong>sql.js</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">文件读取</span>
                <strong>已接通</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">Schema 探测</span>
                <strong>已接通</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">下一步</span>
                <strong>进入筛选页</strong>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="section-kicker">Core Experience</p>
          <h3>第一版界面方向</h3>
          <p>
            移动端优先，卡片化布局，视觉克制但不单调。更像高级数据作品，而不是传统后台。
          </p>
        </div>

        <div class="feature-grid">
          <article v-for="item in highlights" :key="item.title" class="feature-card">
            <div class="feature-icon">
              <component :is="item.icon" :size="20" />
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="section-block section-block-muted">
        <div class="section-heading narrow">
          <p class="section-kicker">Next Step</p>
          <h3>接下来会开始解析 session 和结果表</h3>
          <p>
            下一阶段会继续把 `sessiontb`、固定结果表和 `resultstb` 统一成可筛选、可聚合的业务数据模型。
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
