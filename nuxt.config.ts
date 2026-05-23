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
    // Cache static pages for 1 hour
    '/login': { cache: { maxAge: 60 * 60 } },
    '/settings/**': { cache: { maxAge: 60 * 60 } }
  },

  sourcemap: false,

  devServer: {
    host: '127.0.0.1',
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
    // Compress responses
    compress: true,
    // Cache API responses
    storage: {
      redis: {
        driver: 'redis'
      }
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
    format: ['webp', 'jpeg']
  },

  // Experimental features for better performance
  experimental: {
    // Optimize CSS extraction
    payloadExtraction: true,
    // Faster tree-shaking
    treeshakeClientOnly: true
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
