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
  // Add this line to focus on the main element
  document.querySelector("main")?.focus()
})

const charStatus = computed(
  () =>
    (wordIndex: number, charIndex: number): "correct" | "incorrect" | "current" | "upcoming" => {
      const globalIndex = wordIndex + Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE)
      const word = testState.value.words[globalIndex]
      const typedWord = testState.value.typedWords[globalIndex] || ""

      if (globalIndex < testState.value.currentWordIndex) {
        return charIndex < typedWord.length
          ? typedWord[charIndex] === word[charIndex]
            ? "correct"
            : "incorrect"
          : "upcoming"
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

const getExceededChars = (wordIndex: number): string => {
  const globalIndex = wordIndex + Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE)
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
  event.preventDefault()
  handleInput(event.key)
}

const cursorPosition = computed(() => {
  return {
    wordIndex: testState.value.currentWordIndex - Math.max(0, testState.value.currentWordIndex - WORDS_PER_LINE),
    charIndex: testState.value.currentCharIndex
  }
})

const MAX_CHARS_PER_WORD = 20 // Make sure this matches the value in useTypingTest.ts

// Add this computed property
const currentWordExceededChars = computed(() => {
  const currentWord = testState.value.words[testState.value.currentWordIndex]
  const currentTypedWord = testState.value.typedWords[testState.value.currentWordIndex] || ""
  return currentTypedWord.slice(currentWord.length)
})

const isExceededChar = computed(() => {
  const currentWord = testState.value.words[testState.value.currentWordIndex]
  return testState.value.currentCharIndex >= currentWord.length
})
</script>

<template>
  <main :class="['min-h-screen py-8 ', themeClasses]" @keydown="handleKeyPress" tabindex="0" ref="mainElement">
    <div class="container mx-auto max-w-6xl">
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
        <div class="my-14 text-center text-4xl leading-loose relative pointer-events-none select-none">
          <p class="flex flex-wrap justify-center gap-x-2">
            <span v-for="(word, wordIndex) in visibleWords" :key="wordIndex" class="relative">
              <span v-for="(char, charIndex) in word" :key="charIndex" class="relative">
                <span
                  v-if="
                    wordIndex === cursorPosition.wordIndex && charIndex === cursorPosition.charIndex && !isExceededChar
                  "
                  class="sr-only"
                >
                  Current position
                </span>
                <span
                  v-if="
                    wordIndex === cursorPosition.wordIndex && charIndex === cursorPosition.charIndex && !isExceededChar
                  "
                  aria-hidden="true"
                  class="absolute -left-[1px] top-0 w-[2px] h-10 bg-yellow-500 animate-pulse"
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
              <span class="text-red-500 relative">
                {{ wordIndex === cursorPosition.wordIndex ? currentWordExceededChars : getExceededChars(wordIndex) }}
                <span v-if="wordIndex === cursorPosition.wordIndex && isExceededChar" class="sr-only">
                  Current position (exceeded)
                </span>
                <span
                  v-if="wordIndex === cursorPosition.wordIndex && isExceededChar"
                  aria-hidden="true"
                  class="absolute -right-[1px] top-0 w-[2px] h-10 bg-yellow-500 animate-pulse"
                />
              </span>
              <span
                v-if="wordIndex === cursorPosition.wordIndex && testState.currentCharIndex >= MAX_CHARS_PER_WORD"
                class="text-yellow-500 -ml-3"
              >
                (max)
              </span>
              {{ wordIndex < visibleWords.length - 1 ? " " : "" }}
            </span>
          </p>
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
  </main>
</template>

<style>
body {
  font-family: "Roboto Mono", monospace;
  letter-spacing: 0.075em;
}
</style>
