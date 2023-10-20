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
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
  rewrites: getRewrites(),
})
