<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { Chart, registerables } from "chart.js"
import { useTheme } from "@/composables/useTheme"

Chart.register(...registerables)

interface Props {
  wpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  totalCharactersTyped: number
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement | null>(null)
const { isDarkMode } = useTheme()

const charactersPerMinute = computed(() => props.totalCharactersTyped * 2)

onMounted(() => {
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: "doughnut",
      data: {
        labels: ["Correct Characters", "Incorrect Characters"],
        datasets: [
          {
            data: [props.correctChars, props.incorrectChars],
            backgroundColor: ["#10B981", "#EF4444"]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: isDarkMode.value ? "#D1D5DB" : "#4B5563"
            }
          },
          title: {
            display: true,
            color: isDarkMode.value ? "#D1D5DB" : "#4B5563"
          }
        }
      }
    })
  }
})
</script>

<template>
  <div :class="['p-6 rounded-lg shadow-lg', isDarkMode ? 'bg-gray-800' : 'bg-white']">
    <h2 :class="['text-2xl font-bold mb-4', isDarkMode ? 'text-yellow-500' : 'text-yellow-600']">Test Results</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <canvas ref="chartRef" class="mb-4" />
      </div>
      <div class="space-y-4">
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-yellow-500' : 'text-yellow-600']">WPM</h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ wpm }}
          </p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-yellow-500' : 'text-yellow-600']">Word Accuracy</h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ accuracy }}%</p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-yellow-500' : 'text-yellow-600']">
            Characters per Minute
          </h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ charactersPerMinute }}
          </p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-yellow-500' : 'text-yellow-600']">
            Total Characters
          </h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ totalCharactersTyped }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
