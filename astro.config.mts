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
        name: 'Zen Kaku Gothic New',
        cssVariable: '--font-family-new',
        weights: [300, 400, 500, 700, 900],
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
        provider: fontProviders.google(),
        name: 'Archivo Black',
        cssVariable: '--font-family-archivo-black',
        weights: [400],
        display: 'swap',
        fallbacks: [],
      },
      {
        provider: fontProviders.local(),
        name: 'UDEV Gothic',
        cssVariable: '--font-family-udev-gothic',
        fallbacks: [],
        options: {
          variants: [
            { src: ['./src/assets/fonts/UDEVGothicHSLG-Bold.woff2'], weight: 700, style: 'normal' },
            { src: ['./src/assets/fonts/UDEVGothicHSLG-BoldItalic.woff2'], weight: 700, style: 'italic' },
            { src: ['./src/assets/fonts/UDEVGothicHSLG-Regular.woff2'], weight: 400, style: 'normal' },
            { src: ['./src/assets/fonts/UDEVGothicHSLG-Italic.woff2'], weight: 400, style: 'italic' },
          ],
        },
      },
    ],
  },

  // ponytail: クラウドビルドでのフォント再DL失敗を防ぐため、ビルドキャッシュを
  // node_modules 外に移してリポジトリへ同梱する。フォント構成を変えたら .astro-cache/fonts を再生成してコミット。
  cacheDir: './.astro-cache',
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  integrations: [solidJs()],
  adapter: cloudflare({ imageService: 'passthrough' }),
})
export default config
