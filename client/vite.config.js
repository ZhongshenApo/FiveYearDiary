import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 关键：确保打包后的资源使用相对路径，供 Electron 本地加载
  plugins: [
    react(),
    tailwindcss(),
  ],
})