import { ref, computed, Ref } from "vue"

interface TestState {
  words: string[]
  currentWordIndex: number
  input: string
  startTime: number | null
  endTime: number | null
  correctWords: number
  incorrectWords: number
  timeLeft: number
  isTestActive: boolean
  totalCharactersTyped: number
  typedWords: string[]
}

export function useTypingTest(wordList: string[], wordsToGenerate: number, testDuration: number) {
  const testState: Ref<TestState> = ref({
    words: [],
    currentWordIndex: 0,
    input: "",
    startTime: null,
    endTime: null,
    correctWords: 0,
    incorrectWords: 0,
    timeLeft: testDuration,
    isTestActive: false,
    totalCharactersTyped: 0,
    typedWords: []
  })

  const currentWord = computed(() => testState.value.words[testState.value.currentWordIndex] || "")

  const wpm = computed(() => {
    if (!testState.value.startTime || !testState.value.endTime) return 0
    const timeInMinutes = (testState.value.endTime - testState.value.startTime) / 60000
    return Math.round((testState.value.correctWords + testState.value.incorrectWords) / timeInMinutes)
  })

  const accuracy = computed(() => {
    const totalWords = testState.value.correctWords + testState.value.incorrectWords
    return totalWords > 0 ? Math.round((testState.value.correctWords / totalWords) * 100) : 0
  })

  function startTest() {
    testState.value.words = wordList
    testState.value.currentWordIndex = 0
    testState.value.input = ""
    testState.value.startTime = Date.now()
    testState.value.endTime = null
    testState.value.correctWords = 0
    testState.value.incorrectWords = 0
    testState.value.timeLeft = testDuration
    testState.value.isTestActive = true
    testState.value.totalCharactersTyped = 0
    testState.value.typedWords = []

    const timer = setInterval(() => {
      if (testState.value.timeLeft > 0) {
        testState.value.timeLeft--
      } else {
        clearInterval(timer)
        endTest()
      }
    }, 1000)
  }

  function handleInput(event: Event) {
    if (!testState.value.isTestActive) return

    const input = (event.target as HTMLInputElement).value
    testState.value.input = input

    if (input.endsWith(" ")) {
      const typedWord = input.trim()
      testState.value.typedWords.push(typedWord)
      testState.value.totalCharactersTyped += typedWord.length

      if (typedWord === currentWord.value) {
        testState.value.correctWords++
      } else {
        testState.value.incorrectWords++
      }

      testState.value.currentWordIndex++
      testState.value.input = ""

      if (testState.value.currentWordIndex >= testState.value.words.length) {
        endTest()
      }
    }
  }

  function endTest() {
    testState.value.isTestActive = false
    testState.value.endTime = Date.now()
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
