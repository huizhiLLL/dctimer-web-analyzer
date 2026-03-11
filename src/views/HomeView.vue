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
    title: '本地处理',
    description: '所有操作均在浏览器本地环境进行，无需上传到服务器',
    icon: ShieldCheck,
  },
  {
    title: '先筛再看',
    description: '先初步筛选，再看结果，数据清爽。',
    icon: Sparkles,
  },
  {
    title: '一键分享',
    description: '多套主题，精致报告，一键分享',
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
        <p class="eyebrow">Practice Report</p>
        <h1 class="brand">{{ app.appName }}</h1>
      </div>
    </header>

    <main class="page-wrap">
      <section class="hero-card hero-card-single">
        <div class="hero-copy">
          <p class="hero-kicker">本地处理 · 直观分析 · 一键分享</p>
          <h2 class="hero-title">深度分析你的 DCTimer 练习数据。</h2>
          <p class="hero-text">
            <strong>DCTimer数据导出：</strong>打开 DCTimer - 左上角展开 - 导入导出数据库 - 选择导出 - 确定路径 - 保存（目前仅测试安卓版本）
          </p>

          <div class="hero-actions">
            <button
              :class="['btn', summary ? 'btn-secondary' : 'btn-primary']"
              type="button"
              @click="openFilePicker"
              :disabled="isInspecting"
            >
              <FileSearch :size="18" />
              {{ isInspecting ? '正在导入数据库…' : summary ? '重新导入' : '导入数据（.db）' }}
            </button>
            <button
              :class="['btn', summary ? 'btn-primary' : 'btn-secondary']"
              type="button"
              @click="goToFilters"
              :disabled="!summary"
            >
              {{ summary ? '开始分析' : '选择分析分组' }}
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
                <span class="stat-label">最近一次导入</span>
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
                <span class="mini-label">DNF 数量</span>
                <strong>{{ summary.overview.dnfCount }}</strong>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <h3>主要特点</h3>
          <p>
            SOME FEATURES  
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
