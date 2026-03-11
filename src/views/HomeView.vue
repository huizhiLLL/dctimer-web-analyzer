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
    title: '本地读取',
    description: '直接在浏览器里读取 DCTimer 导出的 .db 文件，不用上传。',
    icon: Database,
  },
  {
    title: '先筛再看',
    description: '先选分组，再看结果，数据会清爽很多。',
    icon: Sparkles,
  },
  {
    title: '数据留本地',
    description: '整个过程都在你的设备上完成，适合放心预览和回顾。',
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
    label: '文件已打开，但不像 DCTimer 数据库',
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
    importError.value = error instanceof Error ? error.message : '导入失败，文件可能不是可用的 SQLite 数据库。'
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
        <p class="eyebrow">DCTimer Report</p>
        <h1 class="brand">{{ app.appName }}</h1>
      </div>
      <div class="topbar-chip">本地解析</div>
    </header>

    <main class="page-wrap">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="hero-kicker">纯前端 · 本地分析 · 隐私友好</p>
          <h2 class="hero-title">把 DCTimer 数据库整理成一份清楚的训练报告。</h2>
          <p class="hero-text">
            {{ app.tagline }} 先选分组，再看结果。整个过程都在浏览器本地完成。
          </p>

          <div class="hero-actions">
            <button class="btn btn-primary" type="button" @click="openFilePicker" :disabled="isInspecting">
              <FileSearch :size="18" />
              {{ isInspecting ? '正在导入数据库…' : '导入 .db 文件' }}
            </button>
            <button class="btn btn-secondary" type="button" @click="goToFilters" :disabled="!summary">选择分析分组</button>
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
                <span class="stat-label">数据库中的数据表</span>
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
                <span class="stat-label">已识别的分组</span>
                <span class="table-list-meta">这些分组已经可以用于后续筛选与分析。</span>
              </div>

              <ul class="session-list">
                <li v-for="session in summary.sessions.slice(0, 8)" :key="session.id" class="session-item">
                  <div>
                    <strong>{{ session.name }}</strong>
                    <p>
                      {{ session.puzzle?.displayName ?? '未知项目' }}
                      · {{ session.solveCount }} 条成绩
                      <template v-if="session.lastSolveAt"> · {{ session.lastSolveAt }}</template>
                    </p>
                  </div>
                  <span>#{{ session.id }}</span>
                </li>
              </ul>
            </div>

            <div v-if="summary.solves.length" class="table-list-card">
              <div class="table-list-head">
                <span class="stat-label">已读取的成绩数据</span>
                <span class="table-list-meta">
                  年份覆盖：{{ summary.overview.yearRange.join(' · ') || '未知' }}
                  <template v-if="summary.overview.firstSolveAt"> · 最早记录：{{ summary.overview.firstSolveAt }}</template>
                </span>
              </div>

              <ul class="session-list">
                <li v-for="solve in summary.solves.slice(0, 6)" :key="`${solve.sourceTable}-${solve.id}`" class="session-item">
                  <div>
                    <strong>分组 #{{ solve.sessionId }} · {{ solve.isDnf ? 'DNF' : `${(solve.finalTimeMs ?? 0) / 1000}s` }}</strong>
                    <p>{{ solve.sourceTable }} · {{ solve.recordedAt ?? '时间未知' }}</p>
                  </div>
                  <span>#{{ solve.id }}</span>
                </li>
              </ul>
            </div>
          </div>

          <template v-else>
            <div class="stat-card stat-card-primary">
              <span class="stat-label">开始使用</span>
              <strong class="stat-value">导入数据库</strong>
              <span class="stat-meta">导入 DCTimer 导出的数据库后，就可以先看分组和成绩概览。</span>
            </div>

            <div class="stat-grid">
              <div class="mini-card">
                <span class="mini-label">数据处理</span>
                <strong>浏览器本地完成</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">支持格式</span>
                <strong>SQLite 数据库</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">隐私方式</span>
                <strong>无需上传</strong>
              </div>
              <div class="mini-card">
                <span class="mini-label">下一步</span>
                <strong>选择分析分组</strong>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="section-kicker">Core Experience</p>
          <h3>你会看到什么</h3>
          <p>
            页面以卡片方式展示，方便你快速回顾训练数据，也方便后续继续整理。
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
          <h3>下一步</h3>
          <p>
            导入完成后，可以按年份和分组缩小范围，继续看统计和训练分布。
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
