<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'base' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'base',
  type: 'button',
})

const variantClass = computed(() => {
  if (props.variant === 'secondary') {
    return 'border-violet-300/40 bg-violet-500/15 text-violet-50 hover:bg-violet-500/25'
  }

  if (props.variant === 'ghost') {
    return 'border-cyan-300/20 bg-white/5 text-cyan-100 hover:bg-cyan-300/10'
  }

  return 'border-cyan-300/40 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/25'
})

const sizeClass = computed(() => {
  return props.size === 'lg'
    ? 'min-h-12 px-5 text-sm sm:min-h-14 sm:px-6'
    : 'min-h-11 px-4 text-sm'
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="pixel-corners inline-flex items-center justify-center gap-2 border font-semibold uppercase tracking-[0.22em] transition duration-150"
    :class="[variantClass, sizeClass]"
    :style="{ boxShadow: 'var(--shadow-button)' }"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="pixel-corners inline-flex items-center justify-center gap-2 border font-semibold uppercase tracking-[0.22em] transition duration-150"
    :class="[variantClass, sizeClass]"
    :style="{ boxShadow: 'var(--shadow-button)' }"
  >
    <slot />
  </button>
</template>
