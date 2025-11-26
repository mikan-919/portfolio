// @ts-check

import cloudflare from '@astrojs/cloudflare'
import solidJs from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
const config = defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Rampart One',
        cssVariable: '--font-family-rampart-one',
        weights: [400],
        display: 'swap',
      },
      {
        provider: fontProviders.google(),
        name: 'Noto Sans JP',
        cssVariable: '--font-family-noto-sans-jp',
        weights: ['100 900'],
        display: 'swap',
      },
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-family-inter',
        weights: ['100 900'],
        display: 'swap',
      },
      {
        provider: fontProviders.google(),
        name: 'Figtree',
        cssVariable: '--font-family-figtree',
        weights: ['300 900'],
        display: 'swap',
      },
      {
        provider: fontProviders.google(),
        name: 'JetBrains Mono',
        cssVariable: '--font-family-jetbrains-mono',
        weights: ['100 800'],
        display: 'swap',
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  integrations: [solidJs()],
  // adapter: cloudflare({ imageService: 'cloudflare' }),
})
export default config
