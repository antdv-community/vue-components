import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import VueJsxAutoProps from 'vite-plugin-tsx-auto-props'

const base = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vueJsx(),
    vitepressDemo(),
    VueJsxAutoProps(),
  ],
  resolve: {
    alias: [
      {
        find: /^@vue-components\/util/,
        replacement: resolve(base, 'packages', 'util', 'src'),
      },
      {
        find: /^@vue-components\/checkbox/,
        replacement: resolve(base, 'packages', 'checkbox', 'src'),
      },
      {
        find: /^@vue-components\/resize-observer/,
        replacement: resolve(base, 'packages', 'resize-observer', 'src'),
      },
    ],
  },
})
