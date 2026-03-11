import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const appName = ref('DCTimer Web Analyzer')
  const tagline = ref('在浏览器里直接读取 DCTimer 数据库，快速整理训练报告')
  const designMode = ref<'light'>('light')

  const isLight = computed(() => designMode.value === 'light')

  return {
    appName,
    tagline,
    designMode,
    isLight,
  }
})
