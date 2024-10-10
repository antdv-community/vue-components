import type { UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import fg from 'fast-glob'
import { buildCommon } from '../../scripts/build.common'

const entry = fg.sync(['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', 'classnames', /^@v-c\//],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
