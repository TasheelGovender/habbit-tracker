<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div class="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
    </div>

    <main class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
