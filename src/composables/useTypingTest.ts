import { ref, computed } from "vue"

interface CharacterStats {
  [key: string]: {
    total: number
    mistakes: number
  }
}

interface TestState {
  words: string[]
  typedWords: string[]
  currentWordIndex: number
  currentCharIndex: number
  startTime: number | null
  endTime: number | null
  timeLeft: number
  typedCharacters: boolean[]
  mistakes: { [key: string]: { total: number; mistakes: number } }
  correctChars: number
  incorrectChars: number
}

const MAX_CHARS_PER_WORD = 20
const VALID_CHAR_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
const INACTIVITY_TIMEOUT = 30000

export function useTypingTest(words: string[], totalWords: number, testDuration: number) {
  const testState = ref<TestState>({
    words,
    typedWords: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    startTime: null,
    endTime: null,
    timeLeft: testDuration,
    typedCharacters: [],
    mistakes: {},
    correctChars: 0,
    incorrectChars: 0
  })

  const timer = ref<number | null>(null)

  const wpm = computed(() => {
    if (!testState.value.startTime || testState.value.correctChars === 0) return 0
    const timeInMinutes = ((testState.value.endTime || Date.now()) - testState.value.startTime) / 60000
    return Math.round((testState.value.correctChars / 5) / timeInMinutes)
  })

  const accuracy = computed(() => {
    const totalChars = testState.value.correctChars + testState.value.incorrectChars
    return totalChars > 0
      ? Math.round((testState.value.correctChars / totalChars) * 100)
      : 100
  })

  const rawWpm = computed(() => {
    if (!testState.value.startTime) return 0
    const timeInMinutes = ((testState.value.endTime || Date.now()) - testState.value.startTime) / 60000
    const totalChars = testState.value.correctChars + testState.value.incorrectChars
    return Math.round((totalChars / 5) / timeInMinutes)
  })

  const WORDS_PER_LINE = 1 // For code typing, each line is treated as one word
  const visibleLine = ref<string[]>([])
  const currentLineIndex = ref(0)

  function updateVisibleLine() {
    const startIndex = currentLineIndex.value
    visibleLine.value = testState.value.words.slice(startIndex, startIndex + 3) // Show 3 lines at a time
  }

  function startTest(): void {
    testState.value = {
      words,
      typedWords: [],
      currentWordIndex: 0,
      currentCharIndex: 0,
      startTime: null,
      endTime: null,
      timeLeft: testDuration,
      typedCharacters: [],
      mistakes: {},
      correctChars: 0,
      incorrectChars: 0
    }

    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }

    currentLineIndex.value = 0
    updateVisibleLine()
  }

  function handleInput(char: string): void {
    // Ignore modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(char)) {
      return
    }

    if (!testState.value.startTime) {
      testState.value.startTime = Date.now()
      startTimer()
    }

    const currentWord = testState.value.words[testState.value.currentWordIndex]
    
    if (char === 'Enter') {
      if (testState.value.currentCharIndex > 0) {
        moveToNextWord()
      }
      return
    }

    if (char === 'Backspace') {
      handleBackspace()
      return
    }

    if (testState.value.currentCharIndex < currentWord.length) {
      const isCorrect = currentWord[testState.value.currentCharIndex] === char
      
      // Initialize character stats if not exists
      if (!testState.value.mistakes[char]) {
        testState.value.mistakes[char] = {
          total: 0,
          mistakes: 0
        }
      }

      // Update character statistics
      testState.value.mistakes[char].total++
      if (!isCorrect) {
        testState.value.mistakes[char].mistakes++
        testState.value.incorrectChars++
      } else {
        testState.value.correctChars++
      }

      testState.value.typedCharacters[testState.value.currentCharIndex] = isCorrect
      testState.value.currentCharIndex++
    }
  }

  function handleBackspace(): void {
    if (testState.value.currentCharIndex > 0) {
      testState.value.currentCharIndex--
      const lastCharStatus = testState.value.typedCharacters.pop()

      if (lastCharStatus) {
        testState.value.correctChars--
      } else {
        testState.value.incorrectChars--
      }
    }
  }

  function moveToNextWord(): void {
    testState.value.typedWords[testState.value.currentWordIndex] = 
      testState.value.words[testState.value.currentWordIndex]
        .slice(0, testState.value.currentCharIndex)

    testState.value.currentWordIndex++
    testState.value.currentCharIndex = 0
    testState.value.typedCharacters = []

    if (testState.value.currentWordIndex >= testState.value.words.length) {
      endTest()
    } else {
      currentLineIndex.value = Math.floor(testState.value.currentWordIndex / WORDS_PER_LINE)
      updateVisibleLine()
    }
  }

  function startTimer(): void {
    timer.value = window.setInterval(() => {
      if (testState.value.timeLeft > 0) {
        testState.value.timeLeft--
      } else {
        endTest()
      }
    }, 1000)
  }

  function endTest(): void {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }

    if (!testState.value.endTime) {
      testState.value.endTime = Date.now()
      
      const testDurationInSeconds = (testState.value.endTime - testState.value.startTime!) / 1000
      const consistencyScore = calculateConsistencyScore(testDurationInSeconds)
    }
  }

  function calculateConsistencyScore(testDuration: number): number {
    const wordsTyped = testState.value.currentWordIndex
    const averageWordsPerSecond = wordsTyped / testDuration
    const expectedWordsAtEnd = averageWordsPerSecond * testDuration
    const deviation = Math.abs(wordsTyped - expectedWordsAtEnd)
    const consistencyScore = Math.max(0, 100 - (deviation / expectedWordsAtEnd) * 100)
    return Math.round(consistencyScore)
  }

  return {
    testState,
    wpm,
    accuracy,
    rawWpm,
    startTest,
    handleInput,
    endTest,
    visibleLine,
    currentLineIndex,
    updateVisibleLine
  }
}
