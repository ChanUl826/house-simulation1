import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // 상대 경로로 변경하여 GitHub Pages에서 올바르게 작동하도록 함
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
