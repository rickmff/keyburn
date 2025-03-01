<script setup lang="ts">
import { computed } from 'vue'
import KeyboardHeatmap from './KeyboardHeatmap.vue'

interface CharacterStats {
  [key: string]: {
    total: number
    mistakes: number
  }
}

const props = defineProps<{
  wpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  totalCharactersTyped: number
  characterStats: CharacterStats
}>()

const rawAccuracy = computed(() => (props.correctChars / props.totalCharactersTyped) * 100)
const netWpm = computed(() => props.wpm * (props.accuracy / 100))
const errorsPerMinute = computed(() => (props.incorrectChars / (props.totalCharactersTyped / props.wpm)) || 0)
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
    <!-- Primary Stats -->
    <div class="stats-card transform transition-transform duration-300">
      <h3 class="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Speed Metrics
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Gross WPM</div>
          <div class="stat-value">{{ Math.round(wpm) }}</div>
          <div class="stat-desc">Raw typing speed</div>
        </div>
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Net WPM</div>
          <div class="stat-value">{{ Math.round(netWpm) }}</div>
          <div class="stat-desc">Adjusted for accuracy</div>
        </div>
      </div>
    </div>

    <!-- Accuracy Stats -->
    <div class="stats-card transform transition-transform duration-300">
      <h3 class="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Accuracy Metrics
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value">{{ Math.round(accuracy) }}%</div>
          <div class="stat-desc">Overall accuracy</div>
        </div>
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Error Rate</div>
          <div class="stat-value">{{ Math.round(errorsPerMinute * 10) / 10 }}</div>
          <div class="stat-desc">Errors per minute</div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="stats-card col-span-full transform transition-transform duration-300">
      <h3 class="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Detailed Statistics
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Total Keystrokes</div>
          <div class="stat-value">{{ totalCharactersTyped }}</div>
          <div class="stat-desc">Total characters</div>
        </div>
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Correct</div>
          <div class="stat-value text-green-500">{{ correctChars }}</div>
          <div class="stat-desc">Accurate hits</div>
        </div>
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Incorrect</div>
          <div class="stat-value text-red-500">{{ incorrectChars }}</div>
          <div class="stat-desc">Mistyped chars</div>
        </div>
        <div class="stat-item hover:bg-gray-600 transition-colors duration-300">
          <div class="stat-label">Raw Accuracy</div>
          <div class="stat-value">{{ Math.round(rawAccuracy * 10) / 10 }}%</div>
          <div class="stat-desc">Base accuracy</div>
        </div>
      </div>
      
      <!-- Keyboard Heatmap -->
      <div class="bg-black rounded-lg border border-gray-500 p-4 mt-4">
        <h4 class="text-lg font-semibold mb-3">Keyboard Performance</h4>
        <KeyboardHeatmap :character-stats="characterStats" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  @apply bg-black p-6 rounded-lg border border-gray-500;
}

.stat-item {
  @apply p-4 bg-black rounded-lg border border-gray-500 flex flex-col items-center text-center shadow-md;
}

.stat-label {
  @apply text-sm font-medium text-gray-300;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-500 my-2;
}

.stat-desc {
  @apply text-xs text-gray-400;
}

.progress-item {
  @apply bg-gray-700 rounded-lg p-4 shadow-md;
}
</style> 