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
        fallbacks: [],
      },
      {
        provider: fontProviders.google(),
        name: 'Noto Sans JP',
        cssVariable: '--font-family-noto-sans-jp',
        weights: ['100 900'],
        display: 'swap',
        fallbacks: [],
      },
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-family-inter',
        weights: ['100 900'],
        display: 'swap',
        fallbacks: [],
      },
      {
        provider: fontProviders.google(),
        name: 'Figtree',
        cssVariable: '--font-family-figtree',
        weights: ['300 900'],
        display: 'swap',
        fallbacks: [],
      },
      {
        provider: 'local',
        name: 'UDEV Gothic',
        cssVariable: '--font-family-udev-gothic',
        variants: [
          { src: ['src/assets/fonts/UDEVGothicHSLG-Bold.woff2'], weight: 700, style: 'normal' },
          { src: ['src/assets/fonts/UDEVGothicHSLG-BoldItalic.woff2'], weight: 700, style: 'italic' },
          { src: ['src/assets/fonts/UDEVGothicHSLG-Regular.woff2'], weight: 400, style: 'normal' },
          { src: ['src/assets/fonts/UDEVGothicHSLG-Italic.woff2'], weight: 400, style: 'italic' },
        ],
        fallbacks: [],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  integrations: [solidJs()],
  adapter: cloudflare({ imageService: 'passthrough' }),
})
export default config
