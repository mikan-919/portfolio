// @ts-check

import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import solidJs from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
const config = defineConfig({
  site: 'https://tekka-mikan.pages.dev',
  experimental: {
    fonts: [
      {
        provider: fontProviders.local(),
        name: 'UDEV Gothic',
        cssVariable: '--font-family-udev-gothic',
        fallbacks: ['monospace'],
        options: {
          variants: [{ src: ['./src/assets/fonts/UDEVGothicHSLG-Regular.woff2'], weight: 400, style: 'normal' }],
        },
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // native .node binary — must not be bundled by Rollup
      external: ['@resvg/resvg-js'],
    },
  },
  output: 'static',
  integrations: [solidJs(), sitemap()],
  adapter: cloudflare({ imageService: 'passthrough' }),
})
export default config
