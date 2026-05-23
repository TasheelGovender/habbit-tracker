<script setup lang="ts">
import { computed, ref } from 'vue'
import GlowButton from '~/components/ui/GlowButton.vue'
import SystemWindow from '~/components/ui/SystemWindow.vue'
import type { FrequencyPeriod, QuestFrequency } from '~/types/quest'

const props = defineProps<{
  categories: Array<{ id: string; name: string }>
  error?: string | null
}>()

const emit = defineEmits<{
  'create-quest': [data: {
    title: string
    categoryId: string
    difficulty: number
    frequency: QuestFrequency
    frequencyTarget: number
    frequencyPeriod: FrequencyPeriod
  }]
  'close': []
}>()

const title = ref('')
const categoryId = ref('')
const difficulty = ref(1)
const frequency = ref<QuestFrequency>('daily')
const customTarget = ref(2)
const customPeriod = ref<FrequencyPeriod>('week')
const hasAttemptedSubmit = ref(false)

const titleMissing = computed(() => hasAttemptedSubmit.value && !title.value.trim())
const categoryMissing = computed(() => hasAttemptedSubmit.value && !categoryId.value)

const frequencyPresets: { value: QuestFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
]

function resolveFrequency(): { frequencyTarget: number; frequencyPeriod: FrequencyPeriod } {
  if (frequency.value === 'daily') return { frequencyTarget: 1, frequencyPeriod: 'day' }
  if (frequency.value === 'weekly') return { frequencyTarget: 1, frequencyPeriod: 'week' }
  if (frequency.value === 'monthly') return { frequencyTarget: 1, frequencyPeriod: 'month' }
  return { frequencyTarget: customTarget.value, frequencyPeriod: customPeriod.value }
}

function handleSubmit() {
  hasAttemptedSubmit.value = true

  if (!title.value.trim() || !categoryId.value) return

  const { frequencyTarget, frequencyPeriod } = resolveFrequency()

  emit('create-quest', {
    title: title.value.trim(),
    categoryId: categoryId.value,
    difficulty: difficulty.value,
    frequency: frequency.value,
    frequencyTarget,
    frequencyPeriod,
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
            <label class="text-xs uppercase tracking-[0.24em] text-slate-400">Frequency</label>
            <div class="flex gap-2">
              <button
                v-for="preset in frequencyPresets"
                :key="preset.value"
                type="button"
                data-testid="frequency-button"
                class="pixel-corners flex-1 border px-2 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition"
                :class="frequency === preset.value
                  ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100'
                  : 'border-cyan-300/15 bg-slate-950/50 text-slate-400 hover:border-cyan-300/25'"
                @click="frequency = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>

            <div v-if="frequency === 'custom'" class="flex items-center gap-2 pt-1">
              <input
                v-model.number="customTarget"
                type="number"
                min="1"
                max="10"
                data-testid="custom-target"
                class="pixel-corners w-16 border border-cyan-300/15 bg-slate-950/70 px-2 py-2 text-center text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
              />
              <span class="text-xs text-slate-400">times per</span>
              <select
                v-model="customPeriod"
                data-testid="custom-period"
                class="pixel-corners border border-cyan-300/15 bg-slate-950/70 px-2 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
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
