import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueJsxAutoProps from 'unplugin-vue-tsx-auto-props/vite'

import vue from '@vitejs/plugin-vue'

const base = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueJsxAutoProps(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: [
      {
        find: /^@vue-components\/util/,
        replacement: resolve(base, 'packages', 'util', 'src'),
      },
    ],
  },
})
