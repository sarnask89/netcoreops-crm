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
    // Cache system options (1 hour)
    '/api/system/**': { cache: { maxAge: 60 * 60 } },
    // Cache CRM customer lists (2 minutes)
    '/api/crm/**': { cache: { maxAge: 60 * 2 } },
    // Cache static pages
    '/login': { cache: { maxAge: 60 * 60 } },
    '/settings/**': { cache: { maxAge: 60 * 60 } }
  },

  sourcemap: false,

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  // Experimental features for better performance
  experimental: {
    // Extract payload for better hydration
    payloadExtraction: true,
    // Inline render function to reduce bundle size
    renderJsonPayloads: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    minify: true,
    sourceMap: false,
    // Prerender routes for faster initial load
    prerender: {
      crawlLinks: false,
      routes: ['/sitemap.xml']
    },
    // Cache storage for API responses
    storage: {
      redis: {
        driver: 'redis'
      }
    }
  },

  // Vite build optimizations
  vite: {
    build: {
      // Increase chunk size warning for large UI libraries
      chunkSizeWarningLimit: 1000,
      // Better code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            'nuxt-ui': ['@nuxt/ui'],
            'vueuse': ['@vueuse/core', '@vueuse/nuxt'],
            'utilities': ['date-fns', 'zod']
          }
        }
      }
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ['@nuxt/ui', '@vueuse/core', '@vueuse/nuxt', 'date-fns', 'zod']
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
