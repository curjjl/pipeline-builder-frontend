<template>
  <ConfigProvider :locale="antdLocale">
    <router-view />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { useLocale } from '@/composables/useLocale'

const { antdLocale } = useLocale()
</script>

<style lang="less">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
