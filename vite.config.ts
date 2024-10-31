import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import VueJsxAutoProps from 'vite-plugin-tsx-resolve-types'

const base = fileURLToPath(new URL('.', import.meta.url))

const comps = [
  ['util', 'util/dist'],
  'checkbox',
  'resize-observer',
  'input',
  'portal',
]

function genListAlias() {
  const alias = []
  for (const comp of comps) {
    if (Array.isArray(comp)) {
      const [dir, name] = comp
      alias.push({
        find: new RegExp(`^@v-c\/${name}`),
        replacement: resolve(base, 'packages', dir, 'src'),
      })
    }
    else {
      alias.push({
        find: new RegExp(`^@v-c\/${comp}`),
        replacement: resolve(base, 'packages', comp, 'src'),
      })
    }
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
