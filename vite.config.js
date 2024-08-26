import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.60.82.120:8888',
        changeOrigin: true, // 是否改变源地址
        rewrite: path => path.replace(/^\/api/, '') // 重写路径
      }
    }
  }
})
