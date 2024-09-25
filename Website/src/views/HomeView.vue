<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const words = ref<string[]>([]);
const currentWordIndex = ref(0);
const input = ref('');
const startTime = ref<number | null>(null);
const endTime = ref<number | null>(null);
const correctWords = ref(0);
const incorrectWords = ref(0);
const timeLeft = ref(30);
const isTestActive = ref(false);
const totalCharactersTyped = ref(0);
const typedWords = ref<string[]>([]);

const currentWord = computed(() => words.value[currentWordIndex.value] || '');

const wpm = computed(() => {
  if (!startTime.value || !isTestActive.value) return 0;
  const minutes = (Date.now() - startTime.value) / 60000;
  const charactersPerMinute = totalCharactersTyped.value / minutes;
  // Assuming an average word length of 5 characters
  return Math.round(charactersPerMinute / 5);
});

const accuracy = computed(() => {
  const totalWords = correctWords.value + incorrectWords.value;
  return totalWords > 0 ? Math.round((correctWords.value / totalWords) * 100) : 100;
});

const generateWords = () => {
  const wordList = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
  words.value = Array.from({ length: 200 }, () => wordList[Math.floor(Math.random() * wordList.length)]);
};

const startTest = () => {
  generateWords();
  currentWordIndex.value = 0;
  input.value = '';
  startTime.value = null;
  endTime.value = null;
  correctWords.value = 0;
  incorrectWords.value = 0;
  timeLeft.value = 30;
  isTestActive.value = false;
  totalCharactersTyped.value = 0;
  typedWords.value = []; // Reset typed words
};

const handleInput = () => {
  if (!isTestActive.value) {
    isTestActive.value = true;
    startTime.value = Date.now();
    startTimer();
  }

  const word = currentWord.value;
  const inputWord = input.value;

  // Update total characters typed
  totalCharactersTyped.value = currentWordIndex.value * 5 + inputWord.length;

  if (inputWord.endsWith(' ')) {
    const trimmedInput = inputWord.trim();
    typedWords.value.push(trimmedInput);
    if (trimmedInput === word) {
      correctWords.value++;
    } else {
      incorrectWords.value++;
    }
    currentWordIndex.value++;
    input.value = '';

    if (currentWordIndex.value >= words.value.length) {
      endTest();
    }
  }
};

const startTimer = () => {
  const timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer);
      endTest();
    }
  }, 1000);
};

const endTest = () => {
  isTestActive.value = false;
  endTime.value = Date.now();
};

const visibleWords = ref<string[]>([]);
const wordsPerLine = ref(12);

const updateVisibleWords = () => {
  const startIndex = Math.max(0, currentWordIndex.value - wordsPerLine.value);
  visibleWords.value = words.value.slice(startIndex, startIndex + wordsPerLine.value * 2);
};

watch(currentWordIndex, updateVisibleWords);

onMounted(() => {
  startTest();
  updateVisibleWords();
});

const wordStatus = computed(() => (word: string, index: number) => {
  const globalIndex = index + Math.max(0, currentWordIndex.value - wordsPerLine.value);
  if (globalIndex < currentWordIndex.value) {
    return typedWords.value[globalIndex] === word ? 'correct' : 'incorrect';
  }
  if (globalIndex === currentWordIndex.value) {
    return 'current';
  }
  return 'upcoming';
});

const currentTypedWord = computed(() => input.value.trim());

// Add a new ref for the theme
const isDarkMode = ref(true);

// Add a computed property for theme classes
const themeClasses = computed(() => ({
  'bg-gray-900 text-gray-300': isDarkMode.value,
  'bg-gray-100 text-gray-800': !isDarkMode.value,
}));
</script>

<template>
  <main :class="['min-h-screen py-8 px-4', themeClasses]">
    <div class="container mx-auto max-w-3xl">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-yellow-500">KeyBurn</h1>
        <button @click="isDarkMode = !isDarkMode" class="p-2 rounded-full hover:bg-gray-700">
          <span v-if="isDarkMode">🌙</span>
          <span v-else>☀️</span>
        </button>
      </header>

      <div class="mb-8">
        <div class="flex justify-center space-x-4 mb-4">
          <button class="px-3 py-1 rounded bg-yellow-500 text-black">time</button>
          <button class="px-3 py-1 rounded bg-gray-700 text-gray-300">words</button>
          <button class="px-3 py-1 rounded bg-gray-700 text-gray-300">quote</button>
        </div>
        <div class="flex justify-center space-x-4 mb-8">
          <button class="px-3 py-1 rounded bg-gray-700 text-gray-300">15</button>
          <button class="px-3 py-1 rounded bg-yellow-500 text-black">30</button>
          <button class="px-3 py-1 rounded bg-gray-700 text-gray-300">60</button>
          <button class="px-3 py-1 rounded bg-gray-700 text-gray-300">120</button>
        </div>
      </div>

      <div class="mb-8 text-center text-xl leading-relaxed">
        <p class="flex flex-wrap justify-center gap-x-2">
          <span v-for="(word, index) in visibleWords" :key="index" :class="{
            'text-green-500': wordStatus(word, index) === 'correct',
            'text-red-500': wordStatus(word, index) === 'incorrect',
            'text-yellow-500 underline': wordStatus(word, index) === 'current',
            'text-gray-600': wordStatus(word, index) === 'upcoming'
          }">
            {{ word }}
          </span>
        </p>
      </div>

      <input v-model="input" @input="handleInput" type="text"
        class="w-full p-2 bg-transparent border-b border-gray-600 focus:outline-none focus:border-yellow-500 mb-8"
        :disabled="!isTestActive && timeLeft === 0" placeholder="Start typing..." />

      <div class="flex justify-between items-center">
        <div>
          <p class="text-xl">WPM: {{ wpm }}</p>
          <p>Accuracy: {{ accuracy }}%</p>
        </div>
        <div class="flex items-center space-x-4">
          <p class="text-xl">{{ timeLeft }}s</p>
          <button @click="startTest" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
            Restart
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style>

body {
  font-family: 'Roboto Mono', monospace;
}
</style>