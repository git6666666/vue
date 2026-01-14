import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 简单的 Vite 配置，启用 Vue SFC 支持
export default defineConfig({
  plugins: [vue()]
})
