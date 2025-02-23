import { ref, computed } from 'vue'

interface TypingSession {
  timestamp: number
  wpm: number
  accuracy: number
  duration: number
  mistakes: { [key: string]: { total: number; mistakes: number } }
  correctChars: number
  incorrectChars: number
  rawWpm: number
  consistency: number
}

interface CharacterStats {
  total: number
  mistakes: number
  averageSpeed: number
}

export function useStatistics() {
  const sessions = ref<TypingSession[]>([])
  const characterStats = ref<{ [key: string]: CharacterStats }>({})

  // Load statistics from localStorage
  const loadStats = () => {
    const savedSessions = localStorage.getItem('typing-sessions')
    if (savedSessions) {
      sessions.value = JSON.parse(savedSessions)
    }
    const savedCharStats = localStorage.getItem('character-stats')
    if (savedCharStats) {
      characterStats.value = JSON.parse(savedCharStats)
    }
  }

  // Save statistics to localStorage
  const saveStats = () => {
    localStorage.setItem('typing-sessions', JSON.stringify(sessions.value))
    localStorage.setItem('character-stats', JSON.stringify(characterStats.value))
  }

  // Add new typing session
  const addSession = (session: Omit<TypingSession, 'timestamp'>) => {
    const newSession = {
      ...session,
      timestamp: Date.now()
    }
    sessions.value.push(newSession)
    saveStats()
  }

  // Calculate WPM progression
  const wpmProgression = computed(() => {
    return sessions.value.map(session => ({
      timestamp: session.timestamp,
      wpm: session.wpm
    }))
  })

  // Calculate average WPM
  const averageWpm = computed(() => {
    if (sessions.value.length === 0) return 0
    const sum = sessions.value.reduce((acc, session) => acc + session.wpm, 0)
    return Math.round(sum / sessions.value.length)
  })

  // Calculate consistency score (0-100)
  const calculateConsistency = (wpmValues: number[]) => {
    if (wpmValues.length < 2) return 100
    const mean = wpmValues.reduce((a, b) => a + b) / wpmValues.length
    const variance = wpmValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpmValues.length
    const standardDeviation = Math.sqrt(variance)
    // Convert to 0-100 scale where lower deviation means higher consistency
    const consistency = Math.max(0, 100 - (standardDeviation / mean) * 100)
    return Math.round(consistency)
  }

  // Get most common mistakes
  const commonMistakes = computed(() => {
    const mistakes: { [key: string]: number } = {}
    sessions.value.forEach(session => {
      Object.entries(session.mistakes).forEach(([char, count]) => {
        mistakes[char] = (mistakes[char] || 0) + count.mistakes
      })
    })
    return Object.entries(mistakes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  })

  // Update character statistics
  const updateCharacterStats = (char: string, isCorrect: boolean, speed: number) => {
    if (!characterStats.value[char]) {
      characterStats.value[char] = {
        total: 0,
        mistakes: 0,
        averageSpeed: 0
      }
    }
    
    const stats = characterStats.value[char]
    stats.total++
    if (!isCorrect) stats.mistakes++
    
    // Update average speed (characters per minute)
    stats.averageSpeed = (stats.averageSpeed * (stats.total - 1) + speed) / stats.total
    saveStats()
  }

  // Get character accuracy heat map data
  const characterHeatMap = computed(() => {
    return Object.entries(characterStats.value).map(([char, stats]) => ({
      character: char,
      accuracy: ((stats.total - stats.mistakes) / stats.total) * 100,
      total: stats.total,
      averageSpeed: stats.averageSpeed
    }))
  })

  // Initialize by loading saved stats
  loadStats()

  return {
    sessions,
    characterStats,
    addSession,
    wpmProgression,
    averageWpm,
    calculateConsistency,
    commonMistakes,
    updateCharacterStats,
    characterHeatMap
  }
} 