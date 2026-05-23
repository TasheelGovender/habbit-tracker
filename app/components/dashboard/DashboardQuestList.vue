<script setup lang="ts">
import type { QuestView } from '~/types/quest'

defineProps<{
  quests: QuestView[]
}>()

const emit = defineEmits<{
  'toggle-complete': [questId: string]
  'open-create-modal': []
}>()
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

      <div v-if="quests.length === 0" class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-6 text-sm text-slate-300">
        No quests created yet. Click "New Quest" to add your first daily quest.
      </div>

      <div v-else class="space-y-3">
        <QuestCard
          v-for="quest in quests"
          :key="quest.id"
          :quest="quest"
          @toggle-complete="emit('toggle-complete', $event)"
        />
      </div>
    </div>
  </SystemWindow>
</template>
