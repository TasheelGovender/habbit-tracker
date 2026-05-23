<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  categories: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  'create-quest': [data: { title: string; categoryId: string; difficulty: number }]
  'close': []
}>()

const title = ref('')
const categoryId = ref('')
const difficulty = ref(1)

function handleSubmit() {
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
      <SystemWindow eyebrow="New Quest" title="Create Quest">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Title</label>
            <input
              v-model="title"
              type="text"
              placeholder="Quest title..."
              required
              class="pixel-corners w-full border border-cyan-300/15 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-300/40"
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Category</label>
            <select
              v-model="categoryId"
              required
              class="pixel-corners w-full border border-cyan-300/15 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
            >
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
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
