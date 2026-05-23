<script setup lang="ts">
import GlowButton from '~/components/ui/GlowButton.vue'
import ProgressBar from '~/components/ui/ProgressBar.vue'
import SystemWindow from '~/components/ui/SystemWindow.vue'
import { usePlayerStore } from '~/stores/player'

definePageMeta({
  layout: 'auth',
})

const runtimeConfig = useRuntimeConfig()
const { currentUser, isSigningIn, authError, signInWithGoogle } = useAuth()
const playerStore = usePlayerStore()

const firebaseConfigMissing = computed(() => {
  return !runtimeConfig.public.firebaseApiKey || !runtimeConfig.public.firebaseProjectId
})

async function handleGoogleSignIn() {
  const user = currentUser.value ?? await signInWithGoogle()

  if (!user) {
    return
  }

  await playerStore.initializeForUser({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  })
  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-3rem)] flex-col justify-center gap-6 py-6 sm:py-10">
    <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <SystemWindow eyebrow="Arise" title="Solo Leveling Habit Tracker">
        <div class="space-y-5">
          <div class="space-y-3">
            <p class="max-w-2xl text-balance text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Turn your habits into quests, streaks into power, and consistency into rank.
            </p>
            <p class="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              This first build lays down the responsive system interface, player HUD, and quest flow foundation for the
              Hunter experience.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex flex-col gap-3 sm:flex-row">
              <GlowButton size="lg" @click="handleGoogleSignIn">
                {{ isSigningIn ? 'Connecting...' : currentUser ? 'Continue to Dashboard' : 'Sign in with Google' }}
              </GlowButton>
            </div>

            <p v-if="firebaseConfigMissing" class="text-sm text-amber-200">
              Firebase public config is incomplete. Fill in ".env" before testing sign-in.
            </p>
            <p v-if="authError" class="text-sm text-rose-200">
              {{ authError }}
            </p>
          </div>

        </div>
      </SystemWindow>

      <SystemWindow eyebrow="Preview" title="Hunter Status">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm uppercase tracking-[0.28em] text-slate-400">Rank</p>
              <p class="mt-1 text-4xl font-black text-cyan-200">E</p>
            </div>
            <div class="text-right">
              <p class="text-sm uppercase tracking-[0.28em] text-slate-400">Title</p>
              <p class="mt-1 text-sm text-slate-200">Monarch of Mornings</p>
            </div>
          </div>

          <ProgressBar label="Level XP" :value="72" :max="100" />
          <ProgressBar label="Health Points" :value="42" :max="50" tone="hp" />
          <ProgressBar label="Productivity" :value="18" :max="30" tone="category" />
        </div>
      </SystemWindow>
    </section>

  </div>
</template>
