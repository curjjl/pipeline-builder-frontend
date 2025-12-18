<template>
  <ConfigProvider :locale="antdLocale">
    <router-view />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { useLocale } from '@/composables/useLocale'
import { usePipelineStore } from '@/stores/modules/pipeline'
import { onMounted } from 'vue'

const { antdLocale } = useLocale()
const pipelineStore = usePipelineStore()

// 应用启动时初始化 IndexedDB 和内置数据集
onMounted(async () => {
  try {
    await pipelineStore.initializeStore()
    console.log('App initialized with IndexedDB')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
</script>

<style lang="less">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
