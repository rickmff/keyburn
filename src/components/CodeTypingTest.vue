<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useCodeTypingTest } from "@/composables/useCodeTypingTest"
import { getRandomCodeSnippet } from "@/utils/generateCodeSnippets"
import TestResults from "@/components/TestResults.vue"
import TimeSettings from "@/components/TimeSettings.vue"
import { useTheme } from "@/composables/useTheme"

const testDuration = ref(30) // Default 30 seconds
const WORDS_PER_LINE = 1 // For code typing, each line is treated as one word
const showTimeSettings = ref(false)

const { testState, lines, currentLine, wpm, accuracy, startTest, handleInput, endTest, updateDuration } = useCodeTypingTest(testDuration.value)
const { isDarkMode, themeClasses } = useTheme()

const showResults = ref(false)

const handleTestEnd = () => {
    endTest()
    showResults.value = true
}

// Watch for time reaching zero
watch(() => testState.value.timeLeft, (newValue) => {
    if (newValue === 0) {
        handleTestEnd()
    }
})

const handleTimeChange = (newTime: number) => {
    testDuration.value = newTime
    updateDuration(newTime)
    showTimeSettings.value = false
    // Only restart if the test hasn't started yet
    if (!testState.value.startTime) {
        restartTest()
    }
}

const restartTest = () => {
    showResults.value = false
    startTest(getRandomCodeSnippet())
}

const isInputDisabled = computed(() => showResults.value)

const getLineClass = (index: number) => {
    if (index === testState.value.currentLineIndex) return 'current-line'
    if (index < testState.value.currentLineIndex) return 'completed-line'
    return 'upcoming-line'
}

const getCharClass = (lineIndex: number, charIndex: number) => {
    const typedLine = testState.value.typedLines[lineIndex] || ''
    const expectedLine = lines.value[lineIndex] || ''
    const expectedChar = expectedLine[charIndex]
    
    // Don't show error/correct status for whitespace
    if (expectedChar === ' ' || expectedChar === '\t' || expectedChar === '\n') {
        return 'whitespace'
    }

    if (lineIndex < testState.value.currentLineIndex) {
        return typedLine[charIndex] === expectedLine[charIndex] ? 'correct' : 'incorrect'
    }
    
    if (lineIndex === testState.value.currentLineIndex) {
        if (charIndex < typedLine.length) {
            return typedLine[charIndex] === expectedLine[charIndex] ? 'correct' : 'incorrect'
        }
        if (charIndex === typedLine.length) {
            return 'current'
        }
    }
    
    return 'upcoming'
}

const handleKeyPress = (event: KeyboardEvent) => {
    if (showResults.value || testState.value.timeLeft === 0) {
        // Only allow restart on 'Enter' key when showing results
        if (event.key === 'Enter') {
            restartTest()
        }
        event.preventDefault()
        return
    }
    event.preventDefault()
    handleInput(event.key)
}

const scrollToCurrentLine = () => {
    const currentLineElement = document.querySelector(`[data-line-index="${testState.value.currentLineIndex}"]`)
    if (currentLineElement) {
        const container = document.querySelector('.code-container')
        if (container) {
            const containerRect = container.getBoundingClientRect()
            const lineRect = currentLineElement.getBoundingClientRect()
            
            // Calculate the middle of the container
            const containerMiddle = containerRect.top + containerRect.height / 2
            
            // Calculate how far to scroll to center the line
            const scrollAmount = lineRect.top - containerMiddle + container.scrollTop
            
            container.scrollTo({
                top: scrollAmount,
                behavior: 'smooth'
            })
        }
    }
}

// Watch for line changes and scroll
watch(() => testState.value.currentLineIndex, () => {
    scrollToCurrentLine()
})

onMounted(() => {
    startTest(getRandomCodeSnippet())
    document.querySelector('main')?.focus()
})
</script>

<template>
    <main :class="['min-h-screen py-14 flex flex-col', themeClasses]" @keydown="handleKeyPress" tabindex="0">
        <div class="container mx-auto max-w-9xl flex-grow">
            <header class="flex justify-between items-center mb-8 px-5">
                <div class="flex items-center">
                    <h1 class="text-4xl font-bold text-yellow-500">
                        <span class="text-gray-700">${</span> KeyBurn <span class="text-gray-700">}</span>
                        <span class="text-yellow-500 text-sm ml-2 font-normal">Beta</span>
                    </h1>
                </div>
                <div class="flex items-center gap-8">
                    <div class="relative group">
                        <p 
                            class="time-display"
                            @click="showTimeSettings = !showTimeSettings"
                            :class="{
                                'text-red-500': testState.timeLeft <= 10,
                                'text-yellow-500': testState.timeLeft <= 30 && testState.timeLeft > 10,
                                'text-gray-200': testState.timeLeft > 30,
                                'opacity-70': !testState.startTime
                            }"
                        >
                            {{ testState.timeLeft }}<span class="text-gray-700">s</span>
                        </p>
                        <TimeSettings
                            :current-time="testDuration"
                            :show="showTimeSettings"
                            @update:time="handleTimeChange"
                            @mouseleave="showTimeSettings = false"
                        />
                    </div>
                    <p class="text-xl" :class="{ 'opacity-50': !testState.startTime }">
                        {{ wpm }} <span class="text-gray-700">WPM</span>
                    </p>
                    <button
                        @click="restartTest"
                        class="bg-gray-900 hover:bg-yellow-500 text-white px-4 py-2 rounded-full transition-colors duration-500 flex items-center gap-2"
                        :disabled="showResults"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </header>

            <div class="relative">
                <!-- Code container -->
                <div class="code-container relative font-mono max-h-[80vh]"
                     :class="{ 'pointer-events-none': showResults }">
                    <div class="absolute top-2 right-2 text-gray-700">
                        {{ testState.currentSnippet?.title || '' }}
                    </div>
                    <div :class="['my-8 text-left text-lg leading-relaxed relative', { 'blur-sm': showResults }]">
                        <pre class="whitespace-pre overflow-x-auto"><code class="block">
              <template v-for="(line, lineIndex) in lines" :key="lineIndex">
                <div
                  :class="['code-line flex -my-10', getLineClass(lineIndex)]"
                  :data-line-index="lineIndex"
                >
                  <span class="line-number select-none px-4 text-gray-700">{{ lineIndex < 9 ? '0' + (lineIndex + 1) : lineIndex + 1 }}</span>
                  <span class="line-content flex-1">
                    <template v-for="(char, charIndex) in line" :key="charIndex">
                      <span
                        :class="[
                            'char',
                            getCharClass(lineIndex, charIndex),
                            { 'cursor-before': lineIndex === testState.currentLineIndex && charIndex === testState.input[lineIndex]?.length }
                        ]"
                      >{{ char === ' ' ? '\u00A0' : char }}</span>
                    </template>
</span>
</div>
</template>
</code></pre>
                    </div>
                </div>

                <!-- Results overlay -->
                <div v-if="showResults" class="absolute inset-0 bg-black/80 backdrop-blur-sm 
                    flex flex-col items-center justify-start rounded-lg z-10 overflow-y-hidden">
                    <div class="text-center p-6 rounded-lg border border-gray-500 w-full max-w-4xl mb-2">
                        <div class="flex items-center justify-center gap-4">
                            <button @click="restartTest" 
                                class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-full transition-all duration-300 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                            <span class="text-gray-400">or press</span>
                            <kbd class="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300 font-mono">Enter ↵</kbd>
                        </div>
                    </div>
                    <div class="grid gap-4 w-full max-w-4xl">
                        <TestResults
                            :wpm="wpm"
                            :accuracy="accuracy"
                            :correct-chars="testState.correctChars"
                            :incorrect-chars="testState.incorrectChars"
                            :total-characters-typed="testState.correctChars + testState.incorrectChars"
                            :character-stats="testState.mistakes"
                        />
                    </div>
                </div>
            </div>
        </div>
        <!-- Footer -->
        <footer class="mt-auto py-4 text-center text-sm text-gray-700">
            <p>
                Created by
                <a
                    href="https://github.com/rickmff"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-yellow-500 hover:text-yellow-400 transition-colors duration-300"
                >
                    Rickmff
                </a>
            </p>
        </footer>
    </main>
</template>

<style scoped>
.code-container {
    background-color: #000000;
    border-radius: 8px;
    overflow-x: auto;
    position: relative;
    width: 100%;
    scroll-behavior: smooth;
}

/* Webkit scrollbar styles */
.code-container::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.code-container::-webkit-scrollbar-track {
    background: #0a0a0a;
    border-radius: 8px;
}

.code-container::-webkit-scrollbar-thumb {
    background: #0a0a0a;
    border: 3px solid #0a0a0a;
    border-radius: 8px;
}

.code-container::-webkit-scrollbar-thumb:hover {
    background: #0a0a0a;
}

/* Firefox scrollbar styles */
.code-container {
    scrollbar-width: thin;
    scrollbar-color: #000 #000;
}

/* Hide horizontal scrollbar */
pre {
    margin: 0;
    padding: 0;
    tab-size: 2;
    overflow-x: hidden;
}

code {
    display: block;
    font-family: 'Fira Code', 'Consolas', monospace;
    line-height: 1.5;
}

.code-line {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 2rem;
}

.line-number {
    opacity: 0.5;
    min-width: 2rem;
    text-align: right;
    user-select: none;
}

.line-content {
    padding-left: 1rem;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-wrap: nowrap;
    overflow-x: visible;
    white-space: pre;
    letter-spacing: 0.15em;
}

.char {
    display: inline-block;
    position: relative;
    white-space: pre;
    font-family: inherit;
}

.char.whitespace {
    color: rgba(158, 158, 158, 0.4); /* subtle gray for whitespace */
}

.char.cursor-before::before {
    content: '';
    position: absolute;
    top: 0;
    left: -2px;
    width: 2px;
    height: 100%;
    background-color: #EAB308;
    animation: blink 1s ease-in-out infinite;
}

.char.correct {
    color: #4caf50;
}

.char.incorrect {
    color: #f44336;
}

.char.current {
    color: #EAB308;
    font-weight: 600;
}

.char.upcoming {
    color: #9e9e9e;
}

.current-line {
    background-color: rgba(255, 255, 255, 0.1);
}

.completed-line {
    opacity: 0.7;
}

.cursor {
    position: relative;
}

.cursor::after {
    display: none;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.pointer-events-none {
    pointer-events: none;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

.time-display {
    @apply text-2xl cursor-pointer transition-all duration-300 relative;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
}

.time-display:hover {
    @apply bg-gray-800;
}

.tooltip {
    @apply absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 
           text-xs text-gray-300 bg-gray-800 rounded-md opacity-0 transition-opacity duration-200;
    white-space: nowrap;
}

.group:hover .tooltip {
    @apply opacity-100;
}

/* Add a subtle pulse animation when time is low */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.time-display.text-red-500 {
    animation: pulse 2s ease-in-out infinite;
}
</style>