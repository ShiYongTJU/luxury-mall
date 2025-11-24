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
    // 开发环境：直接使用服务器地址，不需要代理
    // 如果需要使用代理，可以取消下面的注释
    // proxy: {
    //   '/api': {
    //     target: 'http://1.15.93.186:3001',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  }
})

