<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShieldCheck,
  Sparkles,
  FileSearch,
  AlertCircle,
  CheckCircle2,
  Share,
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
    title: '本地优先',
    description: '所有分析都在浏览器内完成，不需要上传数据库，隐私和掌控感都更安心。',
    icon: ShieldCheck,
  },
  {
    title: '先筛选再分析',
    description: '先挑选年份和分组，再生成报告页，让结果更贴近你真正想看的训练片段。',
    icon: Sparkles,
  },
  {
    title: '适合展示分享',
    description: '结果页会把核心信息整理得更清楚，方便复盘、截图，或作为训练总结来查看。',
    icon: Share,
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
    label: '文件已打开，但看起来不像 DCTimer 数据',
    icon: AlertCircle,
  }
})

const warningSummary = computed(() => {
  if (!summary.value || summary.value.warnings.length === 0) {
    return ''
  }

  return `解析过程中发现 ${summary.value.warnings.length} 条提醒，部分字段可能按兼容模式处理。`
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
    importError.value =
      error instanceof Error ? error.message : '导入失败，所选文件可能不是有效的 SQLite 数据库。'
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
        <p class="eyebrow">Practice Report / 练习报告</p>
        <h1 class="brand">{{ app.appName }}</h1>
        <p class="topbar-tagline">{{ app.tagline }}</p>
      </div>
    </header>

    <main class="page-wrap">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="hero-kicker">Local Analysis / 本地分析 · 精选筛选 · 结果汇总</p>
          <h2 class="hero-title">把你的 DCTimer 数据库，整理成更柔和也更清晰的训练故事。</h2>
          <p class="hero-text">
            导入导出的 DCTimer 数据库后，整个流程都会留在本地完成。你可以按年份和分组做筛选，再用更轻盈的方式查看训练量、
            练习节奏和最终结果。
          </p>

          <div class="hero-actions">
            <button
              :class="['btn', summary ? 'btn-secondary' : 'btn-primary']"
              type="button"
              @click="openFilePicker"
              :disabled="isInspecting"
            >
              <FileSearch :size="18" />
              {{ isInspecting ? '正在检查数据库...' : summary ? '重新导入文件' : '导入 .db 文件' }}
            </button>
            <button
              :class="['btn', summary ? 'btn-primary' : 'btn-secondary']"
              type="button"
              @click="goToFilters"
              :disabled="!summary"
            >
              {{ summary ? '进入筛选页' : '选择要分析的分组' }}
            </button>
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

          <template v-if="summary">
            <div class="inspection-head inspection-head-inline">
              <div>
                <span class="stat-label">Latest Import / 最近导入</span>
                <strong class="inspection-title">{{ summary.fileName }}</strong>
              </div>

              <span v-if="detectedStatus" class="status-pill" :data-tone="detectedStatus.tone">
                <component :is="detectedStatus.icon" :size="14" />
                {{ detectedStatus.label }}
              </span>
            </div>

            <div class="stat-grid stat-grid-wide">
              <div class="mini-card">
                <span class="mini-label">文件大小</span>
                <strong>{{ formatBytes(summary.fileSize) }}</strong>
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
                <span class="mini-label">DNF</span>
                <strong>{{ summary.overview.dnfCount }}</strong>
              </div>
            </div>

            <p v-if="warningSummary" class="status-inline">
              <AlertCircle :size="16" />
              {{ warningSummary }}
            </p>
          </template>
        </div>

        <aside class="hero-panel">
          <div class="hero-panel-card hero-panel-card-highlight">
            <span class="mini-label">Theme Direction / 主题方向</span>
            <strong>以低饱和樱粉、象牙纸感和轻透玻璃层次，承载这份训练报告。</strong>
            <p>
              新主题会让导入、筛选和阅读结果的过程更安静、更有整理感，也更像一份被认真保存下来的练习手账。
            </p>
          </div>

          <div class="hero-panel-grid">
            <div class="mini-card mini-card-soft">
              <span class="mini-label">流程</span>
              <strong>导入 / 筛选 / 报告</strong>
            </div>
            <div class="mini-card mini-card-soft">
              <span class="mini-label">隐私</span>
              <strong>仅在浏览器本地分析</strong>
            </div>
          </div>
        </aside>
      </section>

      <section class="section-block section-block-emphasis">
        <div class="section-heading">
          <p class="section-kicker">Why This Layout / 为什么这样设计</p>
          <h3>让报告更精致，但不牺牲信息清晰度。</h3>
          <p>
            这版界面用统一的主题变量、轻纸感表面和更克制的对比，把密集数据收束得更舒服，在桌面和移动端都更易读。
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
    </main>
  </div>
</template>
