import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청은 아래 주소로 전달
      '/api': {
        target: 'http://localhost:8000', // 백엔드 서버 주소
        changeOrigin: true,
      },
    },
  },
})