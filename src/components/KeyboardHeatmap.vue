<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  characterStats: {
    [key: string]: {
      total: number
      mistakes: number
    }
  }
}>()

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
]

const getKeyStats = (key: string) => {
  const stats = props.characterStats[key] || { total: 0, mistakes: 0 }
  const accuracy = stats.total > 0 ? ((stats.total - stats.mistakes) / stats.total) * 100 : 100
  return {
    accuracy,
    total: stats.total,
    mistakes: stats.mistakes
  }
}

const getHeatMapColor = (accuracy: number) => {
  // Red to green gradient based on accuracy
  const hue = Math.min(120, accuracy * 1.2) // Cap at 120 (green) in HSL
  return `hsl(${hue}, 70%, 50%)`
}
</script>

<template>
  <div class="keyboard-heatmap p-4 py-10 bg-gray- rounded-lg border border-gray-500">
    <div v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex" class="flex justify-center gap-1 mb-1">
      <div
        v-for="key in row"
        :key="key"
        class="key-cell group relative"
        :style="{
          backgroundColor: getKeyStats(key).total > 0 ? getHeatMapColor(getKeyStats(key).accuracy) : '#444'
        }"
      >
        {{ key.toUpperCase() }}
        <!-- Tooltip -->
        <div class="tooltip">
          <div class="text-xs">
            <div>Accuracy: {{ Math.round(getKeyStats(key).accuracy) }}%</div>
            <div>Total: {{ getKeyStats(key).total }}</div>
            <div>Mistakes: {{ getKeyStats(key).mistakes }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard-heatmap {
  font-family: 'Fira Code', monospace;
}

.key-cell {
  @apply w-5 h-5 flex items-center justify-center rounded text-black font-mono text-sm cursor-help transition-colors duration-300;
}

.tooltip {
  @apply invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
         bg-gray-900 text-white rounded shadow-lg text-center whitespace-nowrap z-50
         transition-all duration-200 group-hover:visible group-hover:opacity-100;
}

.tooltip::after {
  content: '';
  @apply absolute top-full left-1/2 transform -translate-x-1/2 
         border-4 border-transparent border-t-gray-900;
}
</style> 