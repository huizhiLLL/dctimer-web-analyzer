import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const appName = ref('DCTimer Web Analyzer')
  const tagline = ref('本地解析 DCTimer 导出数据库，生成年度总结式数据报告')
  const designMode = ref<'light'>('light')

  const isLight = computed(() => designMode.value === 'light')

  return {
    appName,
    tagline,
    designMode,
    isLight,
  }
})
