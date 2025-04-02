<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from "vue"
import { useCodeTypingTest } from "@/composables/useCodeTypingTest"
import { getRandomCodeSnippet } from "@/utils/generateCodeSnippets"
import TestResults from "@/components/TestResults.vue"
import TimeSettings from "@/components/TimeSettings.vue"
import { useTheme } from "@/composables/useTheme"
import { useUser } from '@clerk/vue'
import { saveTestResult } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isSignedIn } = useUser()
const testDuration = ref(30)
const showTimeSettings = ref(false)
const resultSaved = ref(false)

const { testState, lines, wpm, accuracy, startTest, handleInput, endTest, updateDuration, pauseTest, resumeTest } = useCodeTypingTest(testDuration.value)
const { themeClasses } = useTheme()

const showResults = ref(false)
const testKey = ref(0)
const input = ref('')
const showInputModal = ref(true)
const inputError = ref('')

const isAutoTyping = ref(false)
const autoTypeInterval = ref<number | null>(null)

const handleTestEnd = async () => {
    endTest()
    showResults.value = true
    stopAutoType()

    if (isSignedIn && user?.value?.id && !resultSaved.value) {
        try {
            await saveTestResult({
                user_id: user.value.id,
                wpm: wpm.value,
                accuracy: accuracy.value,
                correct_chars: testState.value.correctChars,
                incorrect_chars: testState.value.incorrectChars,
                total_characters_typed: testState.value.correctChars + testState.value.incorrectChars,
                character_stats: testState.value.mistakes,
                snippet_title: testState.value.currentSnippet?.title,
                test_duration: testDuration.value
            })
            resultSaved.value = true
        } catch (error) {
            console.error('Error saving test result:', error)
        }
    }
}

watch(() => testState.value.timeLeft, (newValue) => {
    if (newValue === 0) {
        handleTestEnd()
    }
})

const handleTimeChange = (newTime: number) => {
    testDuration.value = newTime
    updateDuration(newTime)
    showTimeSettings.value = false
    if (!testState.value.startTime) {
        restartTest(false)
    }
}

const restartTest = async (generateNew = false) => {
    showResults.value = false
    resultSaved.value = false

    if (generateNew) {
        const snippet = await getRandomCodeSnippet(input.value)
        console.log('New snippet received in restart:', snippet)
        startTest(snippet)
    } else {
        // Restart with the current snippet
        startTest(testState.value.currentSnippet!)
    }
    testKey.value++
}

const getLineClass = (index: number) => {
    if (index === testState.value.currentLineIndex) return 'current-line'
    if (index < testState.value.currentLineIndex) return 'completed-line'
    return 'upcoming-line'
}

const getCharClass = (lineIndex: number, charIndex: number) => {
    const typedLine = testState.value.typedLines[lineIndex] || ''
    const expectedLine = lines.value[lineIndex] || ''
    const expectedChar = expectedLine[charIndex]

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
    if (showInputModal.value) {
        return
    }

    if (showResults.value || testState.value.timeLeft === 0) {
        if (event.key === 'Enter') {
            restartTest(false)
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

            const containerMiddle = containerRect.top + containerRect.height / 2

            const scrollAmount = lineRect.top - containerMiddle + container.scrollTop

            container.scrollTo({
                top: scrollAmount,
                behavior: 'smooth'
            })
        }
    }
}

const navigateToProfile = () => {
    router.push('/profile')
}

watch(() => testState.value.currentLineIndex, () => {
    scrollToCurrentLine()
})

const handleInputModalToggle = (show: boolean) => {
    showInputModal.value = show
    if (show && testState.value.isTestActive) {
        pauseTest()
    } else if (!show && testState.value.isTestActive) {
        resumeTest()
    }
}

const handleInputSubmit = () => {
    if (!input.value || input.value.trim().length === 0) {
        inputError.value = 'Input is required'
        return
    }
    if (input.value.length > 90) {
        inputError.value = 'Input must be less than 90 characters'
        return
    }
    handleInputModalToggle(false)
    inputError.value = ''
    restartTest(true)
}

const startAutoType = () => {
    if (autoTypeInterval.value) return
    isAutoTyping.value = true
    autoTypeInterval.value = window.setInterval(() => {
        if (!testState.value.currentSnippet) return
        const currentLine = lines.value[testState.value.currentLineIndex] || ''
        const currentInput = testState.value.input[testState.value.currentLineIndex] || ''

        if (currentInput.length >= currentLine.length) {
            handleInput('Enter')
        } else {
            const nextChar = currentLine[currentInput.length]
            handleInput(nextChar)
        }
    }, 100) // Type a character every 50ms
}

const stopAutoType = () => {
    isAutoTyping.value = false
    if (autoTypeInterval.value) {
        clearInterval(autoTypeInterval.value)
        autoTypeInterval.value = null
    }
}

onMounted(async () => {
    const snippet = await getRandomCodeSnippet(input.value)
    startTest(snippet)
    document.querySelector('main')?.focus()
})

onUnmounted(() => {
    stopAutoType()
})
</script>

<template>
    <main :class="['min-h-screen py-14 flex flex-col', themeClasses]" @keydown="handleKeyPress" tabindex="0">
        <div class="container mx-auto max-w-9xl flex-grow">
            <header v-if="!showResults" class="flex justify-between items-center sticky top-0 left-0 right-0 bg-black h-20 z-10 mx-auto max-w-9xl">
                <div class="flex items-center">
                    <h1 class="text-4xl font-bold text-yellow-500">
                        <span class="text-gray-700">${</span> KeyBurn <span class="text-gray-700">}</span>
                        <span class="text-yellow-500 text-sm ml-2 font-normal">Beta</span>
                    </h1>
                </div>
                <div class="flex items-center gap-8">
                    <div class="relative group">
                        <p class="time-display" @click="showTimeSettings = !showTimeSettings" :class="{
                            'text-red-500': testState.timeLeft <= 10,
                            'text-yellow-500': testState.timeLeft <= 30 && testState.timeLeft > 10,
                            'text-gray-200': testState.timeLeft > 30,
                            'opacity-70': !testState.startTime
                        }">
                            {{ testState.timeLeft }}<span class="text-gray-700">s</span>
                        </p>
                        <TimeSettings :current-time="testDuration" :show="showTimeSettings"
                            @update:time="handleTimeChange" @mouseleave="showTimeSettings = false" />
                    </div>
                    <p class="text-xl" :class="{ 'opacity-50': !testState.startTime }">
                        {{ wpm }} <span class="text-gray-700">WPM</span>
                    </p>
                    <button @click="handleInputModalToggle(true)"
                        class="bg-gray-900 hover:bg-yellow-500 text-white p-2 rounded-full transition-colors duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button @click="restartTest(false)"
                        class="bg-gray-900 hover:bg-yellow-500 text-white px-4 py-2 rounded-full transition-colors duration-500 flex items-center gap-2"
                        :disabled="showResults">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button
                        @mousedown="startAutoType"
                        @mouseup="stopAutoType"
                        @mouseleave="stopAutoType"
                        @touchstart="startAutoType"
                        @touchend="stopAutoType"
                        class="bg-gray-900 hover:bg-yellow-500 text-white px-4 py-2 rounded-full transition-colors duration-500 flex items-center gap-2 relative group"
                        :disabled="showResults || showInputModal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                        <span class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded-md opacity-0 transition-opacity duration-200 whitespace-nowrap group-hover:opacity-100">
                            Hold to auto-type
                        </span>
                    </button>
                    <div v-if="isSignedIn" class="flex items-center gap-2">
                        <button @click="navigateToProfile"
                            class="bg-gray-900 hover:bg-yellow-500 text-white px-4 py-2 rounded-full transition-colors duration-500 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clip-rule="evenodd" />
                            </svg>
                            Profile
                        </button>
                    </div>
                    <div v-else class="flex items-center gap-2">
                        <router-link to="/sign-in"
                            class="bg-gray-900 hover:bg-yellow-500 text-white px-4 py-2 rounded-full transition-colors duration-500 flex items-center gap-2">
                            Sign In
                        </router-link>
                    </div>
                </div>
            </header>

            <div v-if="showInputModal" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 transition-all duration-300">
                <div class="glassmorphic p-8 rounded-2xl w-full max-w-md mx-4 transform transition-all duration-300" @keydown.stop>
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">Custom Code</h2>
                        <div class="h-1 w-12 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
                    </div>
                    <div class="space-y-6">
                        <div>
                            <label for="codeInput" class="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                Generate your code snippet
                            </label>
                            <div class="relative">
                                <textarea
                                    id="codeInput"
                                    v-model="input"
                                    rows="3"
                                    maxlength="90"
                                    @keydown.enter.prevent="handleInputSubmit"
                                    class="w-full bg-black/40 border border-gray-700/50 rounded-xl p-4 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                                    placeholder="Enter your code prompt here..."
                                ></textarea>
                                <div class="absolute right-3 bottom-3 text-sm text-gray-500 bg-black/40 px-2 py-1 rounded-md">
                                    {{ input.length }}/90
                                </div>
                            </div>
                            <p v-if="inputError" class="text-sm text-red-500 mt-2 min-h-[20px]">{{ inputError }}</p>
                        </div>
                        <div class="flex justify-end">
                            <button
                                @click="handleInputSubmit"
                                class="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 shadow-lg"
                            >
                                Generate Code
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative">
                <div class="code-container relative font-mono" :key="testKey"
                    :class="{ 'pointer-events-none': showResults }">
                    <div class="absolute top-2 right-2 text-gray-700">
                        {{ testState.currentSnippet?.title || '' }}
                    </div>
                    <div :class="['my-8 text-left text-lg leading-relaxed relative', { 'blur-sm': showResults }]">
                        <pre class="whitespace-pre overflow-x-auto">
                        <code class="block">
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
                        </code>
                        </pre>
                    </div>
                </div>

                <div v-if="showResults" class="inset-0 bg-black/80 backdrop-blur-sm
                    flex flex-col items-center justify-start rounded-lg z-10 absolute top-0 left-0 right-0 bottom-0 mt-24">
                    <div class="text-center p-6 rounded-lg border border-gray-500 w-full max-w-4xl mb-2">
                        <div class="flex items-center justify-center gap-4">
                            <button @click="restartTest(false)"
                                class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-full transition-all duration-300 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                            <span class="text-gray-400">or press</span>
                            <kbd class="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300 font-mono">Enter ↵</kbd>
                        </div>

                        <div v-if="!isSignedIn" class="mt-4 text-gray-400">
                            <p>Sign in to save your results and track your progress!</p>
                            <router-link to="/sign-in"
                                class="text-yellow-500 hover:text-yellow-400 transition-colors mt-2 inline-block">
                                Sign In / Register
                            </router-link>
                        </div>

                        <div v-else-if="resultSaved" class="mt-4 text-green-500">
                            <p>Result saved to your profile!</p>
                            <button @click="navigateToProfile"
                                class="text-yellow-500 hover:text-yellow-400 transition-colors mt-2">
                                View your profile
                            </button>
                        </div>
                    </div>
                    <div class="grid gap-4 w-full max-w-4xl">
                        <TestResults :wpm="wpm" :accuracy="accuracy" :correct-chars="testState.correctChars"
                            :incorrect-chars="testState.incorrectChars"
                            :total-characters-typed="testState.correctChars + testState.incorrectChars"
                            :character-stats="testState.mistakes" />
                    </div>
                </div>
            </div>
        </div>
        <footer class="mt-auto py-4 text-center text-sm text-gray-700 fixed bottom-0 left-0 right-0 bg-black z-10">
            <p>
                Created by
                <a href="https://github.com/rickmff" target="_blank" rel="noopener noreferrer"
                    class="text-yellow-500 hover:text-yellow-400 transition-colors duration-300">
                    Rickmff
                </a>
                <span class="text-gray-700 mx-6">|</span>
                Powered by
                <a href="https://itz.am" target="_blank" rel="noopener noreferrer"
                    class="text-orange-500 hover:text-orange-400 transition-colors duration-300">
                    Itzam
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

.code-container {
    scrollbar-width: thin;
    scrollbar-color: #000 #000;
}

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
    letter-spacing: 0.05em;
}

.char {
    display: inline-block;
    position: relative;
    white-space: pre;
    font-family: inherit;
}

.char.whitespace {
    color: rgba(158, 158, 158, 0.4);
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
    @apply absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded-md opacity-0 transition-opacity duration-200;
    white-space: nowrap;
}

.group:hover .tooltip {
    @apply opacity-100;
}

.glassmorphic {
    background: rgba(17, 17, 17, 0.7);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.modal-backdrop {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
}

.group:hover .tooltip {
    opacity: 1;
}

.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>