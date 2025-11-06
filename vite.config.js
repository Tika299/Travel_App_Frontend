import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',               // <-- THÊM DÒNG NÀY
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
