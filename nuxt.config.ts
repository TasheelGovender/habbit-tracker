const firebasePublicConfig = {
  firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
  firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'nuxt-vuefire'],
  css: ['~/assets/css/main.css'],
  pinia: {
    storesDirs: ['./app/stores/**'],
  },
  tailwindcss: {
    viewer: false,
  },
  runtimeConfig: {
    public: firebasePublicConfig,
  },
  vuefire: {
    config: {
      apiKey: firebasePublicConfig.firebaseApiKey,
      authDomain: firebasePublicConfig.firebaseAuthDomain,
      projectId: firebasePublicConfig.firebaseProjectId,
      storageBucket: firebasePublicConfig.firebaseStorageBucket,
      messagingSenderId: firebasePublicConfig.firebaseMessagingSenderId,
      appId: firebasePublicConfig.firebaseAppId,
    },
    auth: {
      enabled: true,
    },
  },
})
