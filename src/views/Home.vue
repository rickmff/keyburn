<script setup lang="ts">
import { ref, computed, onMounted, watch, shallowRef } from "vue"
import { useTypingTest } from "@/composables/useTypingTest"
import TestResults from "@/components/TestResults.vue"
import { useTheme } from "@/composables/useTheme"
import { generateMixedWordList } from "@/utils/generateMixedWordList"

const WORDS_PER_LINE = 12
const TEST_DURATION = 30
const WORDS_TO_GENERATE = 200

const WORD_LIST = generateMixedWordList(WORDS_TO_GENERATE)

const { testState, wpm, accuracy, startTest, handleInput, endTest } = useTypingTest(
  WORD_LIST,
  WORDS_TO_GENERATE,
  TEST_DURATION
)

const { isDarkMode, toggleTheme, themeClasses } = useTheme()

const visibleWords = shallowRef<string[]>([])

const updateVisibleWords = () => {
  const startIndex = Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE)
  visibleWords.value = testState.value.words.slice(startIndex, startIndex + WORDS_PER_LINE * 2)
}

watch(() => testState.value.currentWordIndex, updateVisibleWords)

onMounted(() => {
  startTest()
  updateVisibleWords()
})

const wordStatus = computed(() => (word: string, index: number): "correct" | "incorrect" | "current" | "upcoming" => {
  const globalIndex = index + Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE)
  if (globalIndex < testState.value.currentWordIndex) {
    return testState.value.typedWords[globalIndex] === word ? "correct" : "incorrect"
  }
  if (globalIndex === testState.value.currentWordIndex) {
    return "current"
  }
  return "upcoming"
})

const showResults = ref(false)

const handleTestEnd = () => {
  endTest()
  showResults.value = true
}

watch(
  () => testState.value.timeLeft,
  (newValue) => {
    if (newValue === 0) {
      handleTestEnd()
    }
  }
)
</script>

<template>
  <main :class="['min-h-screen py-8 px-4', themeClasses]">
    <div class="container mx-auto max-w-3xl">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-yellow-500">KeyBurn</h1>
        <button @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-700" aria-label="Toggle theme">
          <span v-if="isDarkMode" aria-hidden="true">🌙</span>
          <span v-else aria-hidden="true">☀️</span>
        </button>
      </header>

      <div class="mt-32">
        <div class="mb-8 text-center text-2xl leading-relaxed">
          <p class="flex flex-wrap justify-center gap-x-2">
            <span
              v-for="(word, index) in visibleWords"
              :key="index"
              :class="{
                'text-green-500': wordStatus(word, index) === 'correct',
                'text-red-500': wordStatus(word, index) === 'incorrect',
                'text-yellow-500 underline underline-offset-8': wordStatus(word, index) === 'current',
                'text-gray-600': wordStatus(word, index) === 'upcoming'
              }"
            >
              {{ word }}
            </span>
          </p>
        </div>

        <input
          v-model="testState.input"
          @input="handleInput"
          type="text"
          class="w-full p-2 bg-transparent border-b border-gray-600 focus:outline-none focus:border-yellow-500 mb-8"
          :disabled="!testState.isTestActive && testState.timeLeft === 0"
          placeholder="Start typing..."
          aria-label="Type the words here"
        />

        <div v-if="!showResults" class="flex justify-between items-center">
          <div>
            <p class="text-xl">WPM: {{ wpm }}</p>
            <p>Accuracy: {{ accuracy }}%</p>
          </div>
          <div class="flex items-center space-x-4">
            <p class="text-xl">{{ testState.timeLeft }}s</p>
            <button @click="startTest" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
              Restart
            </button>
          </div>
        </div>
      </div>

      <TestResults
        v-if="showResults"
        :wpm="wpm"
        :accuracy="accuracy"
        :correct-words="testState.correctWords"
        :incorrect-words="testState.incorrectWords"
        :total-characters-typed="testState.totalCharactersTyped"
      />
    </div>
  </main>
</template>

<style>
body {
  font-family: "Roboto Mono", monospace;
}
</style>
