import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

export default defineConfig(mergeConfig(buildCommon({
  external: ['vue'],
}), {}))
