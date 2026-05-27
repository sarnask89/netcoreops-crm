// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    },
    // Cache API responses for dashboard summary (5 minutes)
    '/api/dashboard/**': { cache: { maxAge: 60 * 5 } },
    // Cache system dictionaries options (1 hour, GET only)
    '/api/system/options': { cache: { maxAge: 60 * 60 } },

    // Cache static pages
    '/login': { cache: { maxAge: 60 * 60 } },
    '/settings/**': { cache: { maxAge: 60 * 60 } }
  },

  sourcemap: false,

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    minify: false,
    sourceMap: false,
    // Prerender routes for faster initial load
    prerender: {
      crawlLinks: false,
      routes: ['/sitemap.xml']
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    storage: {
      redis: {
        driver: 'redis'
      }
    }
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
