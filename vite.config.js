import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/amap-api': {
        target: 'https://restapi.amap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/amap-api/, ''),
      },
      '/doubao-api': {
        target: 'https://api.doubao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/doubao-api/, ''),
        secure: false,
      },
    },
  },
})