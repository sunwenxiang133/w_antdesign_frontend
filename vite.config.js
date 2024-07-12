import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true, // 是否改变源地址
        rewrite: path => path.replace(/^\/api/, '') // 重写路径
      }
    }
  }
})
