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
    }
  },

  sourcemap: false,

  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    minify: false,
    sourceMap: false
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
