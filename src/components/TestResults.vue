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
      type: "bar",
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
  <div class="px-5 rounded-lg">
    <div class="grid grid-cols-1 gap-6">
      <!--       <div>
        <canvas ref="chartRef" class="mb-4" />
      </div> -->
      <div class="space-y-4">
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-gray-500' : 'text-gray-600']">WPM</h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ wpm }}
          </p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-gray-500' : 'text-gray-600']">Word Accuracy</h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ accuracy }}%</p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
            Characters per Minute
          </h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ charactersPerMinute }}
          </p>
        </div>
        <div :class="['p-4 rounded', isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
          <h3 :class="['text-lg font-semibold', isDarkMode ? 'text-gray-500' : 'text-gray-600']">Total Characters</h3>
          <p :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ totalCharactersTyped }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
