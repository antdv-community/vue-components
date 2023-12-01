import type { UserConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import VueJsxAutoProps from 'vite-plugin-tsx-auto-props'

export interface BuildCommonOptions {
  external?: string[] | RegExp[] | ((id: string) => boolean) | (string | RegExp)[]
  inputDir?: string
}
export function buildCommon(opt: BuildCommonOptions) {
  return {
    plugins: [
      vue(),
      vueJsx(),
      VueJsxAutoProps(),
      dts({
        entryRoot: opt.inputDir ?? 'src',
        outDir: 'dist',
        exclude: ['**/tests/**/*', '**/*.test.ts', '**/*.test.tsx'],
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
    },
  } as UserConfig
}
