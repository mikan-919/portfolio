import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'portfolio',
    compatibilityDate: '2026-10-07',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    entrypoint: '@astrojs/cloudflare/entrypoints/server',
    observability: { enabled: true },
    env: { ASSETS: bindings.assets() },
  },
})
