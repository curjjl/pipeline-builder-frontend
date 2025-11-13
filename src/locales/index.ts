import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

// 支持的语言列表
export const SUPPORT_LOCALES = ['en-US', 'zh-CN'] as const
export type SupportLocale = (typeof SUPPORT_LOCALES)[number]

// 默认语言
const DEFAULT_LOCALE: SupportLocale = 'en-US'

// 从浏览器或本地存储获取语言
function getDefaultLocale(): SupportLocale {
  const stored = localStorage.getItem('locale')
  if (stored && SUPPORT_LOCALES.includes(stored as SupportLocale)) {
    return stored as SupportLocale
  }

  // 浏览器语言检测
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('en')) return 'en-US'

  return DEFAULT_LOCALE
}

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(), // 当前语言
  fallbackLocale: DEFAULT_LOCALE, // 回退语言
  globalInjection: true, // 全局注入 $t
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN
  },
  datetimeFormats: {
    'en-US': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    'zh-CN': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }
    }
  },
  numberFormats: {
    'en-US': {
      currency: { style: 'currency', currency: 'USD' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 }
    },
    'zh-CN': {
      currency: { style: 'currency', currency: 'CNY' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 }
    }
  }
})

export default i18n
