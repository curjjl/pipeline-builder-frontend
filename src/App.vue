<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 设置 dayjs 为中文
dayjs.locale('zh-cn')
</script>

<style lang="less">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
