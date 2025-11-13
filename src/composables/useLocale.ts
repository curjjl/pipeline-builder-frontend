import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import type { SupportLocale } from '@/locales'

// Ant Design Vue 语言包
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'

// dayjs 语言包
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

const antdLocales = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const dayjsLocales = {
  'zh-CN': 'zh-cn',
  'en-US': 'en'
}

export function useLocale() {
  const { locale, t, d, n } = useI18n()

  // Ant Design Vue 当前语言包
  const antdLocale = computed(() => antdLocales[locale.value as SupportLocale])

  // 切换语言
  const changeLocale = (newLocale: SupportLocale) => {
    locale.value = newLocale

    // 更新 dayjs 语言
    dayjs.locale(dayjsLocales[newLocale])

    // 持久化到 localStorage
    localStorage.setItem('locale', newLocale)

    // 更新 HTML lang 属性
    document.documentElement.lang = newLocale
  }

  // 当前语言
  const currentLocale = computed(() => locale.value as SupportLocale)

  // 语言选项列表
  const localeOptions = [
    { value: 'en-US', label: 'English' },
    { value: 'zh-CN', label: '简体中文' }
  ]

  return {
    locale: currentLocale,
    antdLocale,
    localeOptions,
    changeLocale,
    t,
    d,
    n
  }
}
