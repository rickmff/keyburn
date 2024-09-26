import { ref, computed, Ref } from "vue"

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
}

export function useTypingTest(wordList: string[], wordsToGenerate: number, testDuration: number) {
  const testState: Ref<TestState> = ref({
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
    typedCharacters: []
  })

  const currentWord = computed(() => testState.value.words[testState.value.currentWordIndex] || "")

  const wpm = computed(() => {
    if (!testState.value.startTime || !testState.value.endTime) return 0
    const timeInMinutes = (testState.value.endTime - testState.value.startTime) / 60000
    return Math.round(testState.value.correctChars / 5 / timeInMinutes)
  })

  const accuracy = computed(() => {
    const totalChars = testState.value.correctChars + testState.value.incorrectChars
    return totalChars > 0 ? Math.round((testState.value.correctChars / totalChars) * 100) : 0
  })

  let inactivityTimer: number | null = null
  let gameTimer: number | null = null

  function startTest() {
    testState.value.words = wordList
    testState.value.currentWordIndex = 0
    testState.value.currentCharIndex = 0
    testState.value.input = ""
    testState.value.startTime = null
    testState.value.endTime = null
    testState.value.correctChars = 0
    testState.value.incorrectChars = 0
    testState.value.timeLeft = testDuration
    testState.value.isTestActive = true
    testState.value.totalCharactersTyped = 0
    testState.value.typedCharacters = []
  }

  function handleInput(char: string) {
    if (!testState.value.isTestActive) return

    if (!testState.value.startTime) {
      testState.value.startTime = Date.now()
      startGameTimer()
    }

    resetInactivityTimer()

    if (char === " ") {
      // Move to the next word only if space is pressed
      if (testState.value.currentCharIndex > 0) {
        testState.value.currentWordIndex++
        testState.value.currentCharIndex = 0
        testState.value.input = ""
        testState.value.typedCharacters = []

        if (testState.value.currentWordIndex >= testState.value.words.length) {
          endTest()
        }
      }
    } else {
      const expectedChar = currentWord.value[testState.value.currentCharIndex]
      const isCorrect = char === expectedChar

      if (isCorrect) {
        testState.value.correctChars++
      } else {
        testState.value.incorrectChars++
      }

      testState.value.typedCharacters.push(isCorrect)
      testState.value.totalCharactersTyped++
      testState.value.currentCharIndex++
      testState.value.input += char
    }
  }

  function startGameTimer() {
    gameTimer = window.setInterval(() => {
      if (testState.value.timeLeft > 0) {
        testState.value.timeLeft--
      } else {
        endTest()
      }
    }, 1000)
  }

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(endTest, 3000) as unknown as number
  }

  function endTest() {
    testState.value.isTestActive = false
    testState.value.endTime = Date.now()
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (gameTimer) clearInterval(gameTimer)
  }

  return {
    testState,
    currentWord,
    wpm,
    accuracy,
    startTest,
    handleInput,
    endTest
  }
}
