import { defineConfig } from 'vitepress'
import { getRewrites } from './configs/rewrites'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Headless docs',
  description: 'A Headless component',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '组件', link: '/components/' },
    ],

    sidebar: [
      {
        text: '组件',
        items: [
          { text: 'Checkbox', link: '/components/checkbox/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
  rewrites: getRewrites(),
})
