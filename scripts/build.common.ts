import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export interface BuildCommonOptions {
  external?: string[]
  inputDir?: string
}
export function buildCommon(opt: BuildCommonOptions) {
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      dts({
        entryRoot: opt.inputDir ?? 'src',
        outDir: 'dist',
      }),
    ],
    build: {
      rollupOptions: {
        external: opt.external,
        output: [
          {
            preserveModules: true,
            preserveModulesRoot: opt.inputDir ?? 'src',
            format: 'esm',
            entryFileNames: '[name].js',
            dir: 'dist',
          },
          {
            preserveModules: true,
            format: 'cjs',
            entryFileNames: '[name].cjs',
            preserveModulesRoot: opt.inputDir ?? 'src',
            dir: 'dist',
            exports: 'named',
          },
        ],
      },
      lib: {
        entry: 'src/index.ts',
      },
    },
  })
}
