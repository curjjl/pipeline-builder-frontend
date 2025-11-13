<template>
  <Select
    v-model:value="currentLocale"
    :options="localeOptions"
    style="width: 120px"
    @change="handleChange"
  >
    <template #suffixIcon>
      <GlobalOutlined />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Select } from 'ant-design-vue'
import { GlobalOutlined } from '@ant-design/icons-vue'
import { useLocale } from '@/composables/useLocale'
import type { SupportLocale } from '@/locales'

const { locale, localeOptions, changeLocale } = useLocale()

const currentLocale = ref<SupportLocale>(locale.value)

// 监听外部语言变化
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})

function handleChange(value: SupportLocale) {
  changeLocale(value)
}
</script>

<style scoped lang="less">
:deep(.ant-select-selector) {
  display: flex;
  align-items: center;
}
</style>
