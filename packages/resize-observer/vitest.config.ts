import type { UserConfig } from 'vitest/config'
import { defineConfig, mergeConfig } from 'vite'
import fg from 'fast-glob'
import { buildCommon } from '../../scripts/build.common'

const entry = fg.sync(['src/**/*.ts', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', 'classnames', /^@vue-components\/util/],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
  test: {

  },
})
