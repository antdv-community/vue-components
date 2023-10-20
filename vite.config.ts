import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'

const base = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vitepressDemo(),
  ],
  resolve: {
    alias: [
      {
        find: /^@vue-components/,
        replacement: resolve(base, 'packages'),
      },
    ],
  },
})
