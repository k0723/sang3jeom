import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Review 서비스 API는 별도 프록시
      '/api/reviews': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      },
      // 리뷰 이미지 관련 API (S3 프리사인드 URL 등)
      '/api/images': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      },
      // 기타 API는 기존대로
      '/api': {
        target: 'http://localhost:8000', // 백엔드 서버 주소
        changeOrigin: true,
      },
    },
  },
})
