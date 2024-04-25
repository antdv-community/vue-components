import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import VueJsxAutoProps from 'vite-plugin-tsx-resolve-types'

const base = fileURLToPath(new URL('.', import.meta.url))

const comps = [
  'util',
  'checkbox',
  'resize-observer',
  'input',
  'portal',
]

function genListAlias() {
  const alias = []
  for (const comp of comps) {
    alias.push({
      find: new RegExp(`^@vue-components\/${comp}`),
      replacement: resolve(base, 'packages', comp, 'src'),
    })
  }
  return alias
}

export default defineConfig({
  plugins: [
    vueJsx(),
    vitepressDemo(),
    VueJsxAutoProps(),
  ],
  resolve: {
    alias: [
      ...genListAlias(),
    ],
  },
})
