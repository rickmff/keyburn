<!-- StatisticsDashboard.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useStatistics } from '../composables/useStatistics'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const {
  sessions,
  wpmProgression,
  averageWpm,
  calculateConsistency,
  commonMistakes,
  characterHeatMap
} = useStatistics()

// WPM Chart Data
const wpmChartData = computed(() => ({
  labels: wpmProgression.value.map(p => new Date(p.timestamp).toLocaleDateString()),
  datasets: [
    {
      label: 'WPM',
      data: wpmProgression.value.map(p => p.wpm),
      borderColor: '#EAB308',
      tension: 0.4
    }
  ]
}))

const wpmChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    },
    title: {
      display: true,
      text: 'WPM Progression'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Calculate overall consistency
const overallConsistency = computed(() => {
  if (sessions.value.length === 0) return 100
  return calculateConsistency(sessions.value.map(s => s.wpm))
})

// Format timestamp
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Get keyboard layout for heatmap
const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
]

// Get color for heatmap based on accuracy
const getHeatMapColor = (accuracy: number) => {
  const hue = Math.min(accuracy, 100) * 1.2 // 120 is green in HSL
  return `hsl(${hue}, 70%, 50%)`
}

// Get character statistics for heatmap
const getCharStats = (char: string) => {
  return characterHeatMap.value.find(stats => stats.character === char) || {
    accuracy: 100,
    total: 0,
    averageSpeed: 0
  }
}
</script>

<template>
  <div class="statistics-dashboard p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Overall Stats -->
      <div class="stats-card">
        <h2 class="text-xl font-bold mb-4">Overall Statistics</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="stat-item">
            <span class="stat-label">Average WPM</span>
            <span class="stat-value">{{ averageWpm }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Consistency Score</span>
            <span class="stat-value">{{ Math.round(overallConsistency) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Tests</span>
            <span class="stat-value">{{ sessions.length }}</span>
          </div>
        </div>
      </div>

      <!-- WPM Progress Chart -->
      <div class="stats-card">
        <h2 class="text-xl font-bold mb-4">WPM Progress</h2>
        <div class="h-64">
          <Line :data="wpmChartData" :options="wpmChartOptions" />
        </div>
      </div>

      <!-- Common Mistakes -->
      <div class="stats-card">
        <h2 class="text-xl font-bold mb-4">Most Common Mistakes</h2>
        <div class="space-y-2">
          <div v-for="[char, count] in commonMistakes" :key="char" class="mistake-item">
            <span class="mistake-char">{{ char }}</span>
            <div class="mistake-bar-container">
              <div
                class="mistake-bar"
                :style="{ width: `${Math.min((count / (sessions.length * 5)) * 100, 100)}%` }"
              ></div>
            </div>
            <span class="mistake-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Keyboard Heatmap -->
      <div class="stats-card">
        <h2 class="text-xl font-bold mb-4">Accuracy Heatmap</h2>
        <div class="keyboard-heatmap">
          <div v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex" class="flex justify-center gap-1 mb-1">
            <div
              v-for="key in row"
              :key="key"
              class="key-cell"
              :style="{ backgroundColor: getHeatMapColor(getCharStats(key).accuracy) }"
              :title="`${key.toUpperCase()}: ${Math.round(getCharStats(key).accuracy)}% accuracy`"
            >
              {{ key }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Sessions -->
      <div class="stats-card col-span-full">
        <h2 class="text-xl font-bold mb-4">Recent Sessions</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Consistency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in sessions.slice().reverse().slice(0, 5)" :key="session.timestamp">
                <td>{{ formatDate(session.timestamp) }}</td>
                <td>{{ session.wpm }}</td>
                <td>{{ session.accuracy }}%</td>
                <td>{{ session.consistency }}%</td>
                <td>{{ session.duration }}s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-dashboard {
  @apply bg-gray-900;
}

.stats-card {
  @apply bg-black p-6 rounded-lg border border-gray-500;
}

.stat-item {
  @apply flex flex-col p-4 bg-black rounded-lg border border-gray-500;
}

.stat-label {
  @apply text-gray-400 text-sm;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-500;
}

.mistake-item {
  @apply flex items-center gap-4;
}

.mistake-char {
  @apply w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg font-mono text-yellow-500;
}

.mistake-bar-container {
  @apply flex-grow h-4 bg-gray-700 rounded-full overflow-hidden;
}

.mistake-bar {
  @apply h-full bg-yellow-500 transition-all duration-300;
}

.mistake-count {
  @apply text-gray-400 w-12 text-right;
}

.keyboard-heatmap {
  @apply p-4 bg-gray-700 rounded-lg;
}

.key-cell {
  @apply w-10 h-10 flex items-center justify-center rounded text-black font-mono text-sm cursor-help transition-colors duration-300;
}

table {
  @apply w-full text-left;
}

th {
  @apply p-4 bg-gray-700 font-semibold text-gray-300;
}

td {
  @apply p-4 border-t border-gray-700;
}

tr:hover td {
  @apply bg-gray-700;
}
</style> 