import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'

const base = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vueJsx(),
    vitepressDemo(),
  ],
  resolve: {
    alias: [
      {
        find: /^@vue-components\/util/,
        replacement: resolve(base, 'packages', 'util', 'src'),
      },
    ],
  },
})
