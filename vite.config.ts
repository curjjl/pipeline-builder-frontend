import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Vue、Vue Router、Pinia 等 API
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json'
      }
    }),
    // 自动导入组件
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // 使用 less
        })
      ],
      dts: 'src/types/components.d.ts'
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 自定义 Ant Design Vue 主题变量
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '4px'
        }
      }
    }
  },

  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    cors: true,
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  },

  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['ant-design-vue', '@ant-design/icons-vue'],
          'graph-vendor': ['@antv/x6'],
          'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
          'monaco-editor': ['monaco-editor']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },

    // 分块大小警告限制
    chunkSizeWarningLimit: 1000
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'ant-design-vue',
      '@ant-design/icons-vue',
      'dayjs',
      'lodash-es',
      'axios',
      '@vueuse/core',
      'monaco-editor'
    ]
  }
})
