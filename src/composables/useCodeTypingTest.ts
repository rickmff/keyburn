import { ref, computed } from "vue"
import type { CodeSnippet } from "@/utils/generateCodeSnippets"

interface CodeTestState {
  currentSnippet: CodeSnippet | null
  input: string[]
  startTime: number | null
  endTime: number | null
  correctChars: number
  incorrectChars: number
  timeLeft: number
  isTestActive: boolean
  currentLineIndex: number
  typedLines: string[]
  actualTypingTime: number
  mistakes: {
    [key: string]: {
      total: number
      mistakes: number
    }
  }
}

const INACTIVITY_TIMEOUT = 30000

export function useCodeTypingTest(initialDuration: number) {
  const duration = ref(initialDuration)
  const testState = ref<CodeTestState>({
    currentSnippet: null,
    input: [],
    startTime: null,
    endTime: null,
    correctChars: 0,
    incorrectChars: 0,
    timeLeft: duration.value,
    isTestActive: false,
    currentLineIndex: 0,
    typedLines: [],
    actualTypingTime: 0,
    mistakes: {}
  })

  const lines = computed(() => 
    testState.value.currentSnippet?.code.split('\n') || []
  )

  const currentLine = computed(() => 
    lines.value[testState.value.currentLineIndex] || ''
  )

  const wpm = computed(() => {
    const { correctChars, actualTypingTime } = testState.value
    if (actualTypingTime === 0) return 0
    const timeInMinutes = actualTypingTime / 60000
    return Math.round((correctChars / 5) / timeInMinutes)
  })

  const accuracy = computed(() => {
    const { correctChars, incorrectChars } = testState.value
    const totalAttemptedChars = correctChars + incorrectChars
    return totalAttemptedChars > 0 ? Math.round((correctChars / totalAttemptedChars) * 100) : 100
  })

  let inactivityTimer: number | null = null
  let gameTimer: number | null = null
  let lastActiveTime: number | null = null

  function startTest(snippet: CodeSnippet): void {
    Object.assign(testState.value, {
      currentSnippet: snippet,
      input: Array(snippet.code.split('\n').length).fill(''),
      startTime: null,
      endTime: null,
      correctChars: 0,
      incorrectChars: 0,
      timeLeft: duration.value,
      isTestActive: false,
      currentLineIndex: 0,
      typedLines: Array(snippet.code.split('\n').length).fill(''),
      actualTypingTime: 0,
      mistakes: {}
    })
    lastActiveTime = null
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  function handleInput(char: string): void {
    // Ignore modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(char)) {
      return
    }

    // Start the test and timer on first input
    if (!testState.value.startTime) {
      testState.value.startTime = Date.now()
      testState.value.isTestActive = true
      startGameTimer()
    }

    // Reset inactivity timer on each input
    resetInactivityTimer()

    const currentLine = lines.value[testState.value.currentLineIndex]
    
    if (char === 'Enter') {
      moveToNextLine()
      return
    }

    if (char === 'Backspace') {
      handleBackspace()
      return
    }

    if (currentLine) {
      const expectedChar = currentLine[testState.value.input[testState.value.currentLineIndex]?.length || 0]
      if (expectedChar) {
        // Initialize character stats if not exists
        if (!testState.value.mistakes[expectedChar]) {
          testState.value.mistakes[expectedChar] = {
            total: 0,
            mistakes: 0
          }
        }

        // Update character statistics
        testState.value.mistakes[expectedChar].total++
        if (char !== expectedChar) {
          testState.value.mistakes[expectedChar].mistakes++
          testState.value.incorrectChars++
        } else {
          testState.value.correctChars++
        }

        // Update input
        const currentInput = testState.value.input[testState.value.currentLineIndex] || ''
        testState.value.input[testState.value.currentLineIndex] = currentInput + char
        testState.value.typedLines[testState.value.currentLineIndex] = testState.value.input[testState.value.currentLineIndex]
      }
    }
  }

  function handleBackspace(): void {
    const currentInput = testState.value.input[testState.value.currentLineIndex]
    if (currentInput && currentInput.length > 0) {
      const lastChar = currentInput[currentInput.length - 1]
      const expectedChar = lines.value[testState.value.currentLineIndex][currentInput.length - 1]
      
      // Only decrement counters for non-whitespace characters
      if (expectedChar !== ' ' && expectedChar !== '\t' && expectedChar !== '\n') {
        if (lastChar === expectedChar) {
          testState.value.correctChars = Math.max(0, testState.value.correctChars - 1)
        } else {
          testState.value.incorrectChars = Math.max(0, testState.value.incorrectChars - 1)
        }
      }

      testState.value.input[testState.value.currentLineIndex] = currentInput.slice(0, -1)
      testState.value.typedLines[testState.value.currentLineIndex] = testState.value.input[testState.value.currentLineIndex]
    } else if (testState.value.currentLineIndex > 0) {
      moveToPreviousLine()
    }
  }

  function moveToNextLine(): void {
    if (testState.value.currentLineIndex < lines.value.length - 1) {
      testState.value.currentLineIndex++
    } else {
      endTest()
    }
  }

  function moveToPreviousLine(): void {
    if (testState.value.currentLineIndex > 0) {
      testState.value.currentLineIndex--
    }
  }

  function startGameTimer(): void {
    if (gameTimer) clearInterval(gameTimer)
    gameTimer = window.setInterval(() => {
      if (testState.value.timeLeft > 0 && testState.value.isTestActive) {
        testState.value.timeLeft--
        if (lastActiveTime) {
          const now = Date.now()
          testState.value.actualTypingTime += now - lastActiveTime
          lastActiveTime = now
        }
        // Check if time just reached 0
        if (testState.value.timeLeft === 0) {
          endTest()
        }
      }
    }, 1000)
    lastActiveTime = Date.now() // Initialize lastActiveTime when timer starts
  }

  function resetInactivityTimer(): void {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = window.setTimeout(endTest, INACTIVITY_TIMEOUT)
  }

  function endTest(): void {
    if (!testState.value.endTime) {  // Only update if not already ended
      testState.value.isTestActive = false
      testState.value.endTime = Date.now()
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        inactivityTimer = null
      }
      if (gameTimer) {
        clearInterval(gameTimer)
        gameTimer = null
      }
      lastActiveTime = null
      // Ensure timeLeft is 0 when test ends
      testState.value.timeLeft = 0
    }
  }

  function updateDuration(newDuration: number): void {
    duration.value = newDuration
    if (!testState.value.startTime) {
      testState.value.timeLeft = newDuration
    }
  }

  return {
    testState,
    lines,
    currentLine,
    wpm,
    accuracy,
    startTest,
    handleInput,
    endTest,
    updateDuration
  }
} 