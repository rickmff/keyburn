import { ref, computed } from "vue"

interface TestState {
  words: string[]
  currentWordIndex: number
  currentCharIndex: number
  input: string
  startTime: number | null
  endTime: number | null
  correctChars: number
  incorrectChars: number
  timeLeft: number
  isTestActive: boolean
  totalCharactersTyped: number
  typedCharacters: boolean[]
  typedWords: string[]
  actualTypingTime: number // Add this new property
}

const MAX_CHARS_PER_WORD = 20
const VALID_CHAR_REGEX = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
const INACTIVITY_TIMEOUT = 30000

export function useTypingTest(wordList: string[], totalWords: number, testDuration: number) {
  const testState = ref<TestState>({
    words: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    input: "",
    startTime: null,
    endTime: null,
    correctChars: 0,
    incorrectChars: 0,
    timeLeft: testDuration,
    isTestActive: false,
    totalCharactersTyped: 0,
    typedCharacters: [],
    typedWords: [],
    actualTypingTime: 0 // Add this new property
  })

  const currentWord = computed(() => testState.value.words[testState.value.currentWordIndex] ?? "")

  const wpm = computed(() => {
    const { correctChars, actualTypingTime } = testState.value
    if (actualTypingTime === 0) return 0
    const timeInMinutes = actualTypingTime / 60000
    return Math.round(correctChars / 5 / timeInMinutes)
  })

  const accuracy = computed(() => {
    const { correctChars, incorrectChars } = testState.value
    const totalChars = correctChars + incorrectChars
    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0
  })

  let inactivityTimer: number | null = null
  let gameTimer: number | null = null
  let lastActiveTime: number | null = null

  const WORDS_PER_LINE = 18
  const visibleLine = ref<string[]>([])
  const currentLineIndex = ref(0)

  function updateVisibleLine() {
    const startIndex = Math.floor(testState.value.currentWordIndex / WORDS_PER_LINE) * WORDS_PER_LINE
    visibleLine.value = testState.value.words.slice(startIndex, startIndex + WORDS_PER_LINE)
    currentLineIndex.value = Math.floor(testState.value.currentWordIndex / WORDS_PER_LINE)
  }

  function startTest(): void {
    Object.assign(testState.value, {
      words: wordList,
      currentWordIndex: 0,
      currentCharIndex: 0,
      input: "",
      startTime: null,
      endTime: null,
      correctChars: 0,
      incorrectChars: 0,
      timeLeft: testDuration,
      isTestActive: false, // Change this to false
      totalCharactersTyped: 0,
      typedCharacters: [],
      typedWords: [],
      actualTypingTime: 0 // Reset actualTypingTime
    })
    lastActiveTime = null
    if (gameTimer) clearInterval(gameTimer) // Clear any existing game timer
    currentLineIndex.value = 0
    updateVisibleLine()
  }

  function handleInput(char: string): void {
    const now = Date.now()
    if (!testState.value.isTestActive) {
      testState.value.isTestActive = true
      testState.value.startTime = now
      startGameTimer()
      lastActiveTime = now
    } else if (lastActiveTime) {
      testState.value.actualTypingTime += now - lastActiveTime
    }
    lastActiveTime = now

    resetInactivityTimer()

    if (char === "Backspace") {
      handleBackspace()
    } else if (VALID_CHAR_REGEX.test(char)) {
      if (char === " ") {
        moveToNextWord()
      } else if (testState.value.currentCharIndex < MAX_CHARS_PER_WORD) {
        processCharacter(char)
      }
    }
  }

  function processCharacter(char: string): void {
    const { words, currentWordIndex, currentCharIndex } = testState.value
    const currentWord = words[currentWordIndex]
    const expectedChar = currentWord[currentCharIndex]
    const isCorrect = currentCharIndex < currentWord.length && char === expectedChar

    if (isCorrect) {
      testState.value.correctChars++
    } else {
      testState.value.incorrectChars++
    }

    testState.value.typedCharacters[currentCharIndex] = isCorrect
    testState.value.totalCharactersTyped++
    testState.value.currentCharIndex++
    testState.value.input += char
    updateTypedWord()
  }

  function handleBackspace(): void {
    if (testState.value.currentCharIndex > 0) {
      testState.value.currentCharIndex--
      testState.value.input = testState.value.input.slice(0, -1)
      const lastCharStatus = testState.value.typedCharacters.pop()

      if (lastCharStatus) {
        testState.value.correctChars--
      } else {
        testState.value.incorrectChars--
      }

      testState.value.totalCharactersTyped--
      updateTypedWord()
    } else if (testState.value.currentWordIndex > 0) {
      moveToPreviousWord()
    }
  }

  function updateTypedWord(): void {
    testState.value.typedWords[testState.value.currentWordIndex] = testState.value.input
  }

  function startGameTimer(): void {
    if (gameTimer) clearInterval(gameTimer) // Clear any existing timer before starting a new one
    gameTimer = window.setInterval(() => {
      if (testState.value.timeLeft > 0 && testState.value.isTestActive) {
        testState.value.timeLeft--
        if (lastActiveTime) {
          const now = Date.now()
          testState.value.actualTypingTime += now - lastActiveTime
          lastActiveTime = now
        }
      } else if (testState.value.timeLeft === 0) {
        endTest()
      }
    }, 1000)
  }

  function resetInactivityTimer(): void {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = window.setTimeout(endTest, INACTIVITY_TIMEOUT)
  }

  function endTest(): void {
    testState.value.isTestActive = false
    testState.value.endTime = Date.now()
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (gameTimer) clearInterval(gameTimer)
    lastActiveTime = null
  }

  function moveToNextWord(): void {
    if (testState.value.currentCharIndex > 0) {
      testState.value.typedWords[testState.value.currentWordIndex] = testState.value.input
      testState.value.currentWordIndex++
      testState.value.currentCharIndex = 0
      testState.value.input = ""
      testState.value.typedCharacters = []

      if (testState.value.currentWordIndex >= testState.value.words.length) {
        endTest()
      } else if (testState.value.currentWordIndex % WORDS_PER_LINE === 0) {
        currentLineIndex.value++
        updateVisibleLine()
      }

      // Add this line to ensure the visible line is updated even if we're not at the start of a new line
      updateVisibleLine()
    }
  }

  function moveToPreviousWord(): void {
    if (testState.value.currentWordIndex > 0) {
      testState.value.currentWordIndex--
      const previousWord = testState.value.words[testState.value.currentWordIndex]
      testState.value.input = testState.value.typedWords[testState.value.currentWordIndex] || ""
      testState.value.currentCharIndex = testState.value.input.length
      testState.value.typedCharacters = testState.value.input
        .split("")
        .map((char, index) => char === previousWord[index])

      if (testState.value.currentWordIndex % WORDS_PER_LINE === WORDS_PER_LINE - 1) {
        currentLineIndex.value--
        updateVisibleLine()
      }
    }
  }

  function pauseTest(): void {
    testState.value.isTestActive = false
    if (gameTimer) clearInterval(gameTimer)
  }

  function resumeTest(): void {
    if (!testState.value.isTestActive) {
      testState.value.isTestActive = true
      if (!testState.value.startTime) {
        testState.value.startTime = Date.now()
      }
      startGameTimer()
    }
  }

  return {
    testState,
    currentWord,
    wpm,
    accuracy,
    startTest,
    handleInput,
    endTest,
    pauseTest,
    resumeTest,
    visibleLine,
    currentLineIndex,
    updateVisibleLine,
    moveToPreviousWord
  }
}
