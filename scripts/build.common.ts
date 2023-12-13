import type { Plugin, PluginOption, UserConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import VueJsxAutoProps from 'vite-plugin-tsx-auto-props'

export interface BuildCommonOptions {
  external?: string[] | RegExp[] | ((id: string) => boolean) | (string | RegExp)[]
  inputDir?: string
  dts?: boolean
  plugins?: PluginOption[] | Plugin[]
}
export function buildCommon(opt: BuildCommonOptions) {
  const { dts: dtsOpen = true } = opt
  const plugins = [
    vue(),
    vueJsx(),
    VueJsxAutoProps(),
    ...(opt.plugins ?? []),
  ]
  if (dtsOpen) {
    plugins.push(dts({
      entryRoot: opt.inputDir ?? 'src',
      outDir: 'dist',
      exclude: ['**/tests/**/*', '**/*.test.ts', '**/*.test.tsx'],
    }))
  }
  return {
    plugins,
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
