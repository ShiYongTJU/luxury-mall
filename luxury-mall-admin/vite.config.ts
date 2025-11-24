import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3002,
    // 开发环境：使用代理解决跨域问题
    // 前端请求 /api/* 会被代理到服务器后端
    proxy: {
      '/api': {
        target: 'http://1.15.93.186:3001',
        changeOrigin: true,
        // 不重写路径，直接转发 /api/* 到后端
        // 后端路由是 /api/products，所以不需要重写
      },
      '/health': {
        target: 'http://1.15.93.186:3001',
        changeOrigin: true
      }
    }
  }
})

