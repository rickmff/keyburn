<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  currentTime: number,
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:time', time: number): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
}>()

const timeOptions = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 }
]

const handleTimeChange = (time: number) => {
  emit('update:time', time)
}
</script>

<template>
  <div 
    class="time-settings"
    :class="{ 'show': show }"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="flex flex-col gap-2">
      <button
        v-for="option in timeOptions"
        :key="option.value"
        @click="handleTimeChange(option.value)"
        :class="[
          'time-option',
          currentTime === option.value ? 'active' : ''
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.time-settings {
  @apply absolute top-full mt-2 px-1.5 z-50;
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: max-content;
}

.time-settings.show {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.time-option {
  @apply px-4 py-2 rounded-full transition-all duration-300;
  @apply bg-gray-900 text-gray-300;
}

.time-option:hover {
  @apply bg-gray-600;
  transform: scale(1.05);
}

.time-option.active {
  @apply bg-yellow-500 text-black font-medium;
  transform: scale(1.05);
}

.time-settings::before {
  content: '';
  position: absolute;
  inset: -1px;
  padding: 1px;
  pointer-events: none;
}
</style> 