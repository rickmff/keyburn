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

const charStatus = computed(
  () =>
    (wordIndex: number, charIndex: number): "correct" | "incorrect" | "current" | "upcoming" => {
      const globalIndex = wordIndex + Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE)

      if (globalIndex < testState.value.currentWordIndex) {
        return "correct" // Assume all characters in previous words are correct
      }

      if (globalIndex === testState.value.currentWordIndex) {
        if (charIndex < testState.value.currentCharIndex) {
          return testState.value.typedCharacters[charIndex] ? "correct" : "incorrect"
        }
        if (charIndex === testState.value.currentCharIndex) {
          return "current"
        }
      }

      return "upcoming"
    }
)

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

const restartTest = () => {
  showResults.value = false
  startTest()
  updateVisibleWords()
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (!testState.value.isTestActive) return
  event.preventDefault()
  handleInput(event.key)
}

// Add this computed property to determine the position of the cursor
const cursorPosition = computed(() => {
  return {
    wordIndex: testState.value.currentWordIndex - Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE),
    charIndex: testState.value.currentCharIndex
  }
})
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
        <div class="mb-8 text-center text-2xl leading-relaxed relative">
          <p class="flex flex-wrap justify-center gap-x-2">
            <span v-for="(word, wordIndex) in visibleWords" :key="wordIndex" class="relative">
              <span v-for="(char, charIndex) in word" :key="charIndex" class="relative">
                <span
                  v-if="wordIndex === cursorPosition.wordIndex && charIndex === cursorPosition.charIndex"
                  class="absolute -left-[3px] top-0 w-[1.75px] h-6 bg-yellow-500 animate-blink"
                />
                <span
                  :class="{
                    'text-green-500': charStatus(wordIndex, charIndex) === 'correct',
                    'text-red-500': charStatus(wordIndex, charIndex) === 'incorrect',
                    'text-yellow-500': charStatus(wordIndex, charIndex) === 'current',
                    'text-gray-600': charStatus(wordIndex, charIndex) === 'upcoming'
                  }"
                >
                  {{ char }}
                </span>
              </span>
              {{ wordIndex < visibleWords.length - 1 ? " " : "" }}
            </span>
          </p>
        </div>

        <div
          class="w-full p-2 bg-transparent border-b border-gray-600 focus:outline-none focus:border-yellow-500 mb-8 h-10"
          tabindex="0"
          @keydown="handleKeyPress"
          :class="{ 'cursor-not-allowed': !testState.isTestActive }"
        />

        <div v-if="!showResults" class="flex justify-between items-center">
          <div>
            <p class="text-xl">WPM: {{ wpm }}</p>
            <p>Accuracy: {{ accuracy }}%</p>
          </div>
          <div class="flex items-center space-x-4">
            <p class="text-xl">{{ testState.timeLeft }}s</p>
            <button
              @click="restartTest"
              class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      <TestResults
        v-if="showResults"
        :wpm="wpm"
        :accuracy="accuracy"
        :correct-chars="testState.correctChars"
        :incorrect-chars="testState.incorrectChars"
        :total-characters-typed="testState.totalCharactersTyped"
      />

      <div v-if="showResults" class="mt-8 text-center">
        <button @click="restartTest" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
          Restart Test
        </button>
      </div>
    </div>
  </main>
</template>

<style>
body {
  font-family: "Roboto Mono", monospace;
  letter-spacing: 0.075em;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}

.animate-blink {
  animation: blink 1s infinite;
}
</style>
