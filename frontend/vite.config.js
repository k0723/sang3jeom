import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ✅ Spring Boot 백엔드 주소 (포트에 맞게 수정)
        changeOrigin: true,
        secure: false,                  // HTTPS 아니라면 false
      },
    },
  },
})
