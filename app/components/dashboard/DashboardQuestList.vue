<script setup lang="ts">
import { computed } from 'vue'
import type { QuestView } from '~/types/quest'
import GlowButton from '~/components/ui/GlowButton.vue'
import SystemWindow from '~/components/ui/SystemWindow.vue'
import QuestCard from '~/components/quests/QuestCard.vue'

const props = defineProps<{
  questsByFrequency: { daily: QuestView[]; weekly: QuestView[]; monthly: QuestView[] }
}>()

const emit = defineEmits<{
  'toggle-complete': [questId: string]
  'delete-quest': [questId: string]
  'open-create-modal': []
}>()

const sections = computed(() => [
  { key: 'daily', label: 'Daily Quests', quests: props.questsByFrequency.daily },
  { key: 'weekly', label: 'Weekly Quests', quests: props.questsByFrequency.weekly },
  { key: 'monthly', label: 'Monthly Quests', quests: props.questsByFrequency.monthly },
].filter((s) => s.quests.length > 0))

const isEmpty = computed(() => sections.value.length === 0)
</script>

<template>
  <SystemWindow eyebrow="Today" title="Active Quests">
    <div class="space-y-4">
      <div class="flex justify-end">
        <GlowButton
          variant="ghost"
          data-testid="new-quest-button"
          @click="emit('open-create-modal')"
        >
          + New Quest
        </GlowButton>
      </div>

      <div v-if="isEmpty" class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-6 text-sm text-slate-300">
        No quests created yet. Click "New Quest" to add your first daily quest.
      </div>

      <div v-else class="space-y-5">
        <div v-for="section in sections" :key="section.key" class="space-y-3" :data-testid="`section-${section.key}`">
          <h3 class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {{ section.label }} ({{ section.quests.length }})
          </h3>
          <QuestCard
            v-for="quest in section.quests"
            :key="quest.id"
            :quest="quest"
            @toggle-complete="emit('toggle-complete', $event)"
            @delete-quest="emit('delete-quest', $event)"
          />
        </div>
      </div>
    </div>
  </SystemWindow>
</template>
