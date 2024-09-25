let gameActive = false;
let startTime, endTime;
let originalText, currentIndex;
let mistakes = 0;
let timerInterval;
let timeLeft;
const MIN_WORDS = 5; // Minimum words
const MAX_WORDS = 50; // Maximum words

chrome.runtime.onMessage.addListener(function (request, sendResponse) {
  if (request.action === "ping") {
    sendResponse({ status: "ready" });
  } else if (request.action === "startGame") {
    timeLeft = (parseInt(request.timerValue) || 1) * 60;
    startGame();
  }
});

function startGame() {
  if (gameActive) return;

  originalText = window.getSelection().toString().trim();
  const wordCount = originalText.split(" ").length;

  if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
    alert(`Please select between ${MIN_WORDS} and ${MAX_WORDS} words.`);
    return;
  }

  gameActive = true;
  currentIndex = 0;
  mistakes = 0;

  const gameContainer = document.createElement("div");
  gameContainer.id = "typing-game-container";
  gameContainer.innerHTML = `
        <div id="game-ui">
            <div id="game-header">
                <div id="timer">Time left: ${formatTime(timeLeft)}</div>
                <button id="close-button">×</button>
            </div>
            <div id="text-container">
                <div id="text-display"></div>
                <input type="text" id="typing-input" autocomplete="off" autofocus>
            </div>
            <div id="stats">
                <span id="wpm">WPM: 0</span>
                <span id="accuracy">Accuracy: 100%</span>
            </div>
        </div>
    `;
  document.body.appendChild(gameContainer);

  const textDisplay = document.getElementById("text-display");
  textDisplay.innerHTML = originalText
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");

  const typingInput = document.getElementById("typing-input");
  typingInput.addEventListener("input", checkInput);
  document.getElementById("close-button").addEventListener("click", closeGame);

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function checkInput(e) {
  const inputValue = e.target.value;
  const textSpans = document.querySelectorAll("#text-display span");
  const inputWords = inputValue.split(" ");
  const currentWordIndex = inputWords.length - 1;

  // Highlight characters for the current word
  for (let i = 0; i < originalText.length; i++) {
    const expectedChar = originalText[i];
    const span = textSpans[i];

    if (i < inputValue.length) {
      const char = inputValue[i];
      if (char === expectedChar) {
        span.classList.add("correct");
        span.classList.remove("incorrect");
      } else {
        span.classList.add("incorrect");
        span.classList.remove("correct");
        mistakes++;
      }
    } else {
      span.classList.remove("correct", "incorrect");
    }
  }

  // Handle space to jump to the next word
  if (e.inputType === "insertText" && e.data === " ") {
    e.preventDefault(); // Prevent default space behavior
    if (currentWordIndex >= 0) {
      const currentWord = inputWords[currentWordIndex].trim();
      const expectedWord = originalText.split(" ")[currentWordIndex].trim();

      // Only jump to the next word if the current word is complete and matches
      if (currentWord.length > 0 && currentWord === expectedWord) {
        currentIndex += expectedWord.length + 1; // Move past the space
        e.target.value = ""; // Clear input
        updateWordHighlight();
      } else {
        // If the word is incorrect or incomplete, increment mistakes
        mistakes++;
        updateStats(); // Update stats after counting the mistake
      }
    }
  } else {
    currentIndex = inputValue.length;
  }

  updateStats();

  if (currentIndex >= originalText.length) {
    endGame();
  }
}


function updateWordHighlight() {
  const textSpans = document.querySelectorAll("#text-display span");
  const inputWords = document.getElementById("typing-input").value.split(" ");
  const currentWordIndex = inputWords.length - 1;

  // Clear existing highlights
  textSpans.forEach(span => span.classList.remove("highlight"));

  // Highlight the current word only if it has been started
  const start = currentIndex;
  const end = currentIndex + (inputWords[currentWordIndex] ? inputWords[currentWordIndex].length : 0);

  for (let i = start; i < end && i < textSpans.length; i++) {
    textSpans[i].classList.add("highlight");
  }
}

function updateTimer() {
  timeLeft--;
  document.getElementById("timer").textContent = `Time left: ${formatTime(timeLeft)}`;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    endGame();
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function updateStats() {
  const timeElapsed = (new Date() - startTime) / 60000; // in minutes
  const wordsTyped = currentIndex / 5; // Assuming 5 characters per word
  const wpm = Math.round(wordsTyped / timeElapsed) || 0;
  const accuracy = currentIndex > 0 ? Math.round(((currentIndex - mistakes) / currentIndex) * 100) : 100;

  document.getElementById("wpm").textContent = `WPM: ${wpm}`;
  document.getElementById("accuracy").textContent = `Accuracy: ${accuracy}%`;
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  endTime = new Date();
  const timeElapsed = (endTime - startTime) / 1000; // in seconds
  const wordsTyped = currentIndex / 5; // Assuming 5 characters per word
  const wpm = Math.round(wordsTyped / (timeElapsed / 60));
  const accuracy = Math.round(((currentIndex - mistakes) / currentIndex) * 100);

  const results = `
        Game Over!
        WPM: ${wpm}
        Accuracy: ${accuracy}%
        Time: ${formatTime(Math.round(timeElapsed))}
        Characters typed: ${currentIndex}
        Mistakes: ${mistakes}
    `;

  alert(results);
  saveHighScore(wpm);
  closeGame();
}

function closeGame() {
  document.body.removeChild(document.getElementById("typing-game-container"));
  clearInterval(timerInterval);
}

function saveHighScore(wpm) {
  chrome.storage.local.get(["highScores"], function (result) {
    let highScores = result.highScores || [];
    highScores.push(wpm);
    chrome.storage.local.set({ highScores: highScores }, function () {
      console.log("High score updated");
    });
  });
}

// Style the game similar to KeyBurn
const style = document.createElement("style");
style.textContent = `
    #typing-game-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    #game-ui {
        background: #1e1f22;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 800px;
    }
    #game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    #timer {
        font-size: 18px;
    }
    #close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #fff;
    }
    #text-container {
        position: relative;
        margin-top: 20px;
    }
    #text-display {
        font-size: 28px;
        line-height: 1.5;
        color: #ccc;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
    }
    #typing-input {
        font-size: 28px;
        color: transparent;
        background: none;
        border: none;
        caret-color: #fff;
        position: relative;
        z-index: 1;
        outline: none;
        width: 100%;
    }
    .correct { color: #4caf50; }
    .incorrect { color: #f44336; }
    .highlight { text-decoration: underline; color: #2196F3; }
    #stats {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }
`;
document.head.appendChild(style);
