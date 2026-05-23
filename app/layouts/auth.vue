<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,209,255,0.16),transparent_30%),linear-gradient(180deg,#040611_0%,#071128_100%)]" />
    <main class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
