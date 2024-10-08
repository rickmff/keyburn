<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useTypingTest } from "@/composables/useTypingTest"
import TestResults from "@/components/TestResults.vue"
import { useTheme } from "@/composables/useTheme"
import { generateMixedWordList } from "@/utils/generateMixedWordList"
import InputIndicator from "@/components/InputIndicator.vue"

const WORDS_PER_LINE = 18
const TEST_DURATION = 30
const WORDS_TO_GENERATE = 200

const WORD_LIST = generateMixedWordList(WORDS_TO_GENERATE)

const { testState, wpm, accuracy, startTest, handleInput, endTest, visibleLine, currentLineIndex, updateVisibleLine } =
  useTypingTest(WORD_LIST, WORDS_TO_GENERATE, TEST_DURATION)

const { isDarkMode, toggleTheme, themeClasses } = useTheme()

const cursorPosition = computed(() => ({
  wordIndex: testState.value.currentWordIndex,
  charIndex: testState.value.currentCharIndex,
  lineIndex: Math.floor(testState.value.currentWordIndex / WORDS_PER_LINE)
}))

const isExceededChar = computed(() => {
  const currentWord = testState.value.words[testState.value.currentWordIndex]
  return currentWord ? testState.value.currentCharIndex > currentWord.length : false
})

const updateVisibleWords = () => {
  updateVisibleLine()
}

watch(() => testState.value.currentWordIndex, updateVisibleWords)

onMounted(() => {
  startTest()
  updateVisibleLine()
  document.querySelector("main")?.focus()
})

const charStatus = computed(
  () =>
    (wordIndex: number, charIndex: number): "correct" | "incorrect" | "current" | "upcoming" => {
      const globalWordIndex = currentLineIndex.value * WORDS_PER_LINE + wordIndex
      const word = testState.value.words[globalWordIndex]
      const typedWord = testState.value.typedWords[globalWordIndex] || ""

      if (globalWordIndex < testState.value.currentWordIndex) {
        return charIndex < typedWord.length
          ? typedWord[charIndex] === word[charIndex]
            ? "correct"
            : "incorrect"
          : "upcoming"
      }

      if (globalWordIndex === testState.value.currentWordIndex) {
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

const getExceededChars = (wordIndex: number): string => {
  const globalIndex = wordIndex + currentLineIndex.value * WORDS_PER_LINE
  const word = testState.value.words[globalIndex]
  const typedWord = testState.value.typedWords[globalIndex] || ""
  return typedWord.slice(word.length)
}

const showResults = ref(false)

const handleTestEnd = () => {
  endTest()
  showResults.value = true
  document.querySelector("main")?.focus()
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
  document.querySelector("main")?.focus()
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (isInputDisabled.value) return
  event.preventDefault()
  handleInput(event.key)
}

const currentWordExceededChars = computed(() => {
  const currentWord = testState.value.words[testState.value.currentWordIndex] || ""
  const currentTypedWord = testState.value.typedWords[testState.value.currentWordIndex] || ""
  return currentWord ? currentTypedWord.slice(currentWord.length) : ""
})

const isInputDisabled = computed(() => showResults.value)
</script>

<template>
  <main
    :class="['min-h-screen py-8 flex flex-col', themeClasses]"
    @keydown="handleKeyPress"
    tabindex="0"
    ref="mainElement"
  >
    <div class="container mx-auto max-w-6xl flex-grow">
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center">
          <img src="/logo.png" class="w-15 h-10" alt="KeyBurn Logo" />
          <h1 class="text-4xl font-bold text-yellow-500">KeyBurn</h1>
        </div>
        <button @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-700" aria-label="Toggle theme">
          <span v-if="isDarkMode" aria-hidden="true">🌙</span>
          <span v-else aria-hidden="true">☀️</span>
        </button>
      </header>

      <div class="mt-32 relative px-5">
        <div class="flex justify-between items-center">
          <p class="text-2xl">{{ testState.timeLeft }}<span class="text-gray-500">s</span></p>
          <p class="text-xl">{{ wpm }} <span class="text-gray-500">WPM</span></p>
        </div>
        <div class="typing-container relative">
          <div :class="['my-14 text-center text-5xl leading-loose relative', { 'blur-sm': showResults }]">
            <p class="flex flex-wrap justify-center gap-x-2" :data-line-index="currentLineIndex">
              <span
                v-for="(word, wordIndex) in visibleLine"
                :key="wordIndex"
                class="relative inline-block"
                :data-word-index="wordIndex + currentLineIndex * WORDS_PER_LINE"
              >
                <span
                  v-for="(char, charIndex) in word"
                  :key="charIndex"
                  class="relative inline-block char"
                  :class="{
                    'text-green-500': charStatus(wordIndex, charIndex) === 'correct',
                    'text-red-500': charStatus(wordIndex, charIndex) === 'incorrect',
                    'text-gray-600': charStatus(wordIndex, charIndex) === 'upcoming',
                    'text-gray-400': charStatus(wordIndex, charIndex) === 'current'
                  }"
                >
                  {{ char }}
                </span>
                <span class="text-red-500 relative char">
                  {{
                    wordIndex + currentLineIndex * WORDS_PER_LINE === testState.currentWordIndex
                      ? currentWordExceededChars
                      : getExceededChars(wordIndex)
                  }}
                </span>
                {{ wordIndex < visibleLine.length - 1 ? " " : "" }}
              </span>
            </p>
          </div>
          <InputIndicator
            :word-index="testState.currentWordIndex"
            :char-index="testState.currentCharIndex"
            :is-exceeded="isExceededChar"
            :word-length="testState.words[testState.currentWordIndex]?.length || 0"
            :line-index="cursorPosition.lineIndex"
            :total-words="WORDS_PER_LINE"
          />
        </div>
        <div class="flex justify-center mb-12">
          <button
            @click="restartTest"
            class="hover:opacity-70 text-yellow-500 font-bold px-4 rounded-full !cursor-pointer duration-300 focus-visible:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 inline-block mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
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
    </div>

    <!-- New footer -->
    <footer class="mt-auto py-4 text-center text-sm text-gray-500">
      <p>
        &copy; 2024
        <a
          href="https://github.com/rickmff"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-yellow-500 transition-colors"
          >rickmff</a
        >. All rights reserved.
      </p>
    </footer>
  </main>
</template>

<style scoped>
body {
  font-family: "Roboto Mono", monospace;
  letter-spacing: 0.075em;
}

.blur-sm {
  filter: blur(2px);
}

.typing-container {
  position: relative;
  overflow: hidden;
}

.char {
  display: inline-block;
  position: relative;
}
</style>
