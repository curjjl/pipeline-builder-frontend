import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    theme: 'light',
    language: 'zh-CN'
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
    },

    setLanguage(language: 'zh-CN' | 'en-US') {
      this.language = language
    }
  },

  persist: {
    key: 'pipeline-builder-app',
    storage: localStorage,
    paths: ['theme', 'language', 'sidebarCollapsed']
  }
})
