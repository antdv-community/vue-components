import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: ['vue', 'classnames', /^@v-c\/util/],
  dts: true,
  clean: true,
  target: 'es2020',
  treeshake: 'smallest',
  format: ['esm', 'cjs'],
})
