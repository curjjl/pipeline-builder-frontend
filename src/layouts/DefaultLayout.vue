<template>
  <a-layout class="default-layout">
    <!-- 顶部导航 -->
    <a-layout-header class="layout-header">
      <div class="header-left">
        <h1 class="logo">Pipeline Builder</h1>
      </div>
      <div class="header-right">
        <a-space>
          <span>欢迎, {{ userStore.username }}</span>
          <a-button type="link" @click="handleLogout">退出</a-button>
        </a-space>
      </div>
    </a-layout-header>

    <!-- 主体内容 -->
    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="appStore.sidebarCollapsed"
        :trigger="null"
        collapsible
        theme="light"
        width="220"
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          @click="handleMenuClick"
        >
          <a-menu-item key="/pipelines">
            <AppstoreOutlined />
            <span>管道列表</span>
          </a-menu-item>
          <a-menu-item key="/executions">
            <PlayCircleOutlined />
            <span>执行历史</span>
          </a-menu-item>
          <a-menu-item key="/connections">
            <DatabaseOutlined />
            <span>数据源</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 内容区域 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore, useUserStore } from '@/stores'
import { AppstoreOutlined, PlayCircleOutlined, DatabaseOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const selectedKeys = ref<string[]>([route.path])

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)

function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="less">
.default-layout {
  height: 100vh;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #001529;
  color: #fff;

  .header-left {
    .logo {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
    }
  }

  .header-right {
    span {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.layout-content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  overflow: auto;
}
</style>
