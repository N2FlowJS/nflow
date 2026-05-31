import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/nflow/',
  title: "N2FLOW",
  description: "AI-powered flow editor with LLM integration",
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'API Docs', link: '/api' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Architecture', link: '/architecture' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Flow Editor', link: '/features/editor' },
          { text: 'Execution Engine', link: '/features/engine' },
          { text: 'Secrets Management', link: '/features/secrets' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/n2flow/nflow' }
    ]
  }
})
