// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],
  devtools: {
    enabled: false
  },

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

  compatibilityDate: '2024-07-11',

  nitro: {
    minify: true,
    sourceMap: false,
    // Prerender routes for faster initial load
    prerender: {
      crawlLinks: false,
      routes: ['/sitemap.xml']
    },
    // Compress responses with gzip/brotli
    compress: true,
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

  // Vue optimizations
  vue: {
    // Disable Vue devtools in production
    config: {
      devtools: false
    }
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'jpeg'],
    presets: {
      avatar: {
        modifiers: {
          width: 64,
          height: 64,
          quality: 80
        }
      }
    }
  },

  // Experimental features for better performance
  experimental: {
    // Extract payload for better hydration
    payloadExtraction: true,
    // Optimize tree-shaking for client-only components
    treeshakeClientOnly: true,
    // Inline render function to reduce bundle size
    renderJsonPayloads: true
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
