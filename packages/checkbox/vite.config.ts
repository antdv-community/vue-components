import type { UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import fg from 'fast-glob'
import { buildCommon } from '../../scripts/build.common'

const entry = fg.sync(['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    dts: false,
    external: ['vue', 'classnames', /^@vue-components\/util/],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
