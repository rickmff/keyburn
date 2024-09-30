## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

# KeyBurn Typing Test Application

## Overview
KeyBurn is a web-based typing test application built with Vue 3, TypeScript, and Tailwind CSS. It allows users to test their typing speed and accuracy with a customizable word list and test duration.

## Components

### Home.vue
The main component that renders the typing test interface.

#### Props
None

#### Key Functions
- `handleKeyPress(event: KeyboardEvent)`: Processes user input during the test
- `restartTest()`: Resets the test state and starts a new test
- `handleTestEnd()`: Ends the current test and displays results

#### Computed Properties
- `cursorPosition`: Calculates the current cursor position
- `isExceededChar`: Determines if the typed characters exceed the current word length
- `charStatus`: Determines the status (correct, incorrect, current, upcoming) of each character

### InputIndicator.vue
A component that renders and positions the cursor/indicator for the current typing position.

#### Props
- `wordIndex: number`: The index of the current word
- `charIndex: number`: The index of the current character within the word
- `wordLength: number`: The length of the current word
- `lineIndex: number`: The index of the current line
- `totalWords: number`: The total number of words per line

#### Key Functions
- `updateIndicatorPosition()`: Updates the position of the cursor based on the current word and character

## Composables

### useTypingTest
A composable function that manages the core logic of the typing test.

#### Parameters
- `wordList: string[]`: The list of words for the test
- `totalWords: number`: The total number of words to generate for the test
- `testDuration: number`: The duration of the test in seconds

#### Returned Object
- `testState`: Reactive object containing the current test state
- `currentWord`: Computed property for the current word
- `wpm`: Computed property for words per minute
- `accuracy`: Computed property for typing accuracy
- `startTest()`: Starts a new test
- `handleInput(char: string)`: Processes user input
- `endTest()`: Ends the current test
- `pauseTest()`: Pauses the current test
- `resumeTest()`: Resumes a paused test
- `visibleLine`: Reactive array of currently visible words
- `currentLineIndex`: Reactive value for the current line index
- `updateVisibleLine()`: Updates the visible line of words
- `moveToPreviousWord()`: Moves the cursor to the previous word

## Key Features
1. Real-time typing test with WPM and accuracy calculation
2. Dynamic cursor positioning and blinking effect
3. Theme toggle (light/dark mode)
4. Responsive design using Tailwind CSS
5. Inactivity detection to automatically end the test
6. Support for backspace and word navigation

## Usage
1. Import and use the `useTypingTest` composable in your Vue component
2. Render the typing interface using the provided components and state
3. Handle user input and update the test state accordingly
4. Display test results when the test ends

This documentation provides an overview of the KeyBurn typing test application structure and main components. For more detailed information on each function and component, refer to the inline comments in the source code.
