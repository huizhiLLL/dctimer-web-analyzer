import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const appName = ref('DCTimer Web Analyzer')
  const tagline = ref('在浏览器中本地读取 DCTimer 数据库，把训练记录整理成更清晰、更精致的练习报告。')
  const designMode = ref<'light'>('light')

  const isLight = computed(() => designMode.value === 'light')

  return {
    appName,
    tagline,
    designMode,
    isLight,
  }
})
