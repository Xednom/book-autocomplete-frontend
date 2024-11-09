import pkg from './package.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      APP_MODE: process.env?.NODE_ENV
    }
  },

  experimental: {
    renderJsonPayloads: false
  },

  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }

  },

  app: {
    head: {
      title: 'Book AutoComplete Project',
      link: [
        {
          id: 'theme-css',
          rel: 'stylesheet',
          type: 'text/css',
          href: '/themes/lara-light-indigo/theme.css'
        }
      ]
    }
  },

  // '@sidebase/nuxt-auth' - re-add this for activating the login system
  modules: ['nuxt-primevue', '@sidebase/nuxt-auth', '@pinia/nuxt',],

  primevue: {
    options: { ripple: true },
    components: {
      exclude: ['Editor']
    }
  },

  build: {
    transpile: ['@vuepic/vue-datepicker']
  },

  script: [
    {
      strategy: 'lazyOnload',
      src: 'https://www.googletagmanager.com/gtag/js?id=UA-93461466-1'
    },
    {
      id: 'ga-analytics',
      strategy: 'lazyOnload',
      children: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-93461466-1');
            `
    }
  ],

  css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/themes/lara-light-indigo/theme.css', '@/assets/styles.scss'],

  // uncomment this code block once the login system is initiated
  auth: {
    baseURL: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/',
    provider: {
      type: 'refresh',
      endpoints: {
        signIn: { path: '/api/auth/jwt/create', method: 'post' },
        signOut: false,
        signUp: { path: 'api/auth/users', method: 'post' },
        getSession: { path: 'api/auth/users/me', method: 'get' },
        refresh: { path: 'api/auth/jwt/refresh', method: 'post' }
      },
      pages: {
        login: '/auth/login'
      },
      token: {
        signInResponseTokenPointer: '/access',
        type: "Bearer",
        maxAgeInSeconds: 60 * 5, // 5 min
        sameSiteAttribute: 'strict'
      },
      refreshToken: {
        signInResponseRefreshTokenPointer: '/refresh',
        refreshRequestTokenPointer: "Bearer",
      }
    },
    globalAppMiddleware: true
  },

  compatibilityDate: '2024-08-14',
});