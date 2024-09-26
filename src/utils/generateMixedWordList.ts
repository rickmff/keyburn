// Common words
const commonWords = [
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "I",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me"
]

// Programming-related words
const programmingWords = [
  "function",
  "variable",
  "array",
  "object",
  "class",
  "method",
  "loop",
  "condition",
  "algorithm",
  "data",
  "structure",
  "interface",
  "module",
  "library",
  "framework",
  "debug",
  "compile",
  "runtime",
  "syntax",
  "semantic",
  "code",
  "program",
  "software",
  "hardware",
  "network",
  "database",
  "server",
  "client",
  "API",
  "frontend",
  "backend",
  "fullstack",
  "DevOps",
  "agile",
  "scrum",
  "git",
  "version",
  "control",
  "test",
  "deploy",
  "cloud",
  "security",
  "encryption",
  "authentication",
  "authorization",
  "responsive",
  "mobile",
  "desktop",
  "web",
  "app",
  "development"
]

function generateMixedWordList(wordCount: number, programmingRatio: number = 0.3): string[] {
  const mixedList: string[] = []
  const programmingWordCount = Math.floor(wordCount * programmingRatio)
  const commonWordCount = wordCount - programmingWordCount

  for (let i = 0; i < commonWordCount; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length)
    mixedList.push(commonWords[randomIndex])
  }

  for (let i = 0; i < programmingWordCount; i++) {
    const randomIndex = Math.floor(Math.random() * programmingWords.length)
    mixedList.push(programmingWords[randomIndex])
  }

  // Shuffle the mixed list
  for (let i = mixedList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[mixedList[i], mixedList[j]] = [mixedList[j], mixedList[i]]
  }

  return mixedList
}

export { commonWords, programmingWords, generateMixedWordList }
