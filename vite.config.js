import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 为GitHub Pages部署添加基础路径配置
  base: process.env.NODE_ENV === 'production' ? '/taijihealth/' : '/',
  // 配置构建输出目录
  build: {
    outDir: 'build',
  },
  // 配置开发服务器
  server: {
    port: 3000,
    open: true,
  },
  // 配置解析别名
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
