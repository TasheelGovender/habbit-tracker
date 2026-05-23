<script setup lang="ts">
import { computed, ref } from 'vue'
import GlowButton from '~/components/ui/GlowButton.vue'
import SystemWindow from '~/components/ui/SystemWindow.vue'

const props = defineProps<{
  categories: Array<{ id: string; name: string }>
  error?: string | null
}>()

const emit = defineEmits<{
  'create-quest': [data: { title: string; categoryId: string; difficulty: number }]
  'close': []
}>()

const title = ref('')
const categoryId = ref('')
const difficulty = ref(1)
const hasAttemptedSubmit = ref(false)

const titleMissing = computed(() => hasAttemptedSubmit.value && !title.value.trim())
const categoryMissing = computed(() => hasAttemptedSubmit.value && !categoryId.value)

function handleSubmit() {
  hasAttemptedSubmit.value = true

  if (!title.value.trim() || !categoryId.value) return

  emit('create-quest', {
    title: title.value.trim(),
    categoryId: categoryId.value,
    difficulty: difficulty.value,
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-lg px-4">
      <SystemWindow eyebrow="New Quest" title="Create Quest" class="!bg-[color:var(--color-surface-strong)] !border-cyan-300/30" :style="{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' }">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Title</label>
            <input
              v-model="title"
              type="text"
              placeholder="Quest title..."
              class="pixel-corners w-full border bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              :class="titleMissing ? 'border-rose-400/50 focus:border-rose-400/70' : 'border-cyan-300/15 focus:border-cyan-300/40'"
            />
            <p v-if="titleMissing" class="text-xs text-rose-300">Quest title is required.</p>
          </div>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Category</label>
            <select
              v-model="categoryId"
              class="pixel-corners w-full border bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition"
              :class="categoryMissing ? 'border-rose-400/50 focus:border-rose-400/70' : 'border-cyan-300/15 focus:border-cyan-300/40'"
            >
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <p v-if="categoryMissing" class="text-xs text-rose-300">Please select a category.</p>
          </div>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Difficulty</label>
            <div class="flex gap-2">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                data-testid="difficulty-button"
                class="pixel-corners flex h-10 w-10 items-center justify-center border text-sm font-semibold transition"
                :class="difficulty === n
                  ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100'
                  : 'border-cyan-300/15 bg-slate-950/50 text-slate-400 hover:border-cyan-300/25'"
                @click="difficulty = n"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <p v-if="error" class="text-xs text-rose-300">{{ error }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <GlowButton
              variant="ghost"
              type="button"
              data-testid="cancel-button"
              @click="emit('close')"
            >
              Cancel
            </GlowButton>
            <GlowButton type="submit">
              Create Quest
            </GlowButton>
          </div>
        </form>
      </SystemWindow>
    </div>
  </div>
</template>
