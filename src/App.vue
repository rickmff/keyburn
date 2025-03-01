<script setup lang="ts">
import { ClerkLoaded, ClerkLoading } from '@clerk/vue'
</script>

<template>
  <ClerkLoading>
    <div class="min-h-screen flex items-center justify-center bg-black text-white">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  </ClerkLoading>
  
  <ClerkLoaded>
    <router-view />
  </ClerkLoaded>
</template>

<style>
body {
  overflow: hidden;
}
</style>
