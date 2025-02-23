<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  timeLeft: number
}>()

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const timeClass = computed(() => {
  if (props.timeLeft <= 10) return 'text-red-500'
  if (props.timeLeft <= 30) return 'text-yellow-500'
  return 'text-gray-200'
})
</script>

<template>
  <div class="custom-clock">
    <p class="text-2xl" :class="timeClass">
      {{ formatTime(timeLeft) }}<span class="text-gray-700">s</span>
    </p>
  </div>
</template>

<style scoped>
.custom-clock {
  @apply flex items-center justify-center;
}
</style> 