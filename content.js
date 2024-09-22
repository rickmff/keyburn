let gameActive = false;
let startTime, endTime;
let originalText, currentIndex;
let mistakes = 0;
let timerInterval;
let difficulty = 'normal';
let hasStartedTyping = false;
let timeLeft;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "ping") {
    sendResponse({status: "ready"});
  } else if (request.action === "startGame") {
    difficulty = request.difficulty || 'normal';
    timeLeft = (parseInt(request.timerValue) || 1) * 60; // Convert minutes to seconds
    startGame();
  }
});

function startGame() {
  if (gameActive) return;

  gameActive = true;
  originalText = window.getSelection().toString();
  if (!originalText) {
    alert("Please select some text before starting the game.");
    return;
  }

  currentIndex = 0;
  mistakes = 0;
  hasStartedTyping = false;

  const gameContainer = document.createElement('div');
  gameContainer.id = 'typing-game-container';
  gameContainer.innerHTML = `
    <div id="game-ui">
      <div id="game-header">
        <div id="timer">Time left: ${formatTime(timeLeft)}</div>
        <button id="close-button">×</button>
      </div>
      <div id="progress-bar">
        <div id="progress"></div>
      </div>
      <div id="text-display"></div>
      <input type="text" id="typing-input" autocomplete="off">
      <div id="stats">
        <span id="wpm">WPM: 0</span>
        <span id="accuracy">Accuracy: 100%</span>
      </div>
    </div>
  `;
  document.body.appendChild(gameContainer);

  const textDisplay = document.getElementById('text-display');
  textDisplay.innerHTML = originalText.split('').map(char => `<span>${char}</span>`).join('');

  document.getElementById('typing-input').addEventListener('input', checkInput);
  document.getElementById('close-button').addEventListener('click', closeGame);
  document.getElementById('typing-input').focus();

  applyStyles();
}

function checkInput(e) {
  if (!hasStartedTyping) {
    hasStartedTyping = true;
    startTime = new Date();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  const inputValue = e.target.value;
  const inputChar = inputValue.slice(-1);

  for (let i = 0; i < inputValue.length; i++) {
    const char = inputValue[i];
    const expectedChar = originalText[i];

    if (char === expectedChar) {
      document.querySelectorAll('#text-display span')[i].classList.add('correct');
      document.querySelectorAll('#text-display span')[i].classList.remove('incorrect');
    } else {
      document.querySelectorAll('#text-display span')[i].classList.add('incorrect');
      document.querySelectorAll('#text-display span')[i].classList.remove('correct');
      mistakes++;
    }
  }

  currentIndex = inputValue.length;

  updateProgress();
  updateStats();

  if (currentIndex === originalText.length) {
    endGame();
  }
}

function updateTimer() {
  timeLeft--;
  document.getElementById('timer').textContent = `Time left: ${formatTime(timeLeft)}`;
  
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    endGame();
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgress() {
  const progress = (currentIndex / originalText.length) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
}

function updateStats() {
  const timeElapsed = (new Date() - startTime) / 60000; // in minutes
  const wordsTyped = currentIndex / 5; // Assuming 5 characters per word
  const wpm = Math.round(wordsTyped / timeElapsed) || 0;
  const accuracy = currentIndex > 0 ? Math.round(((currentIndex - mistakes) / currentIndex) * 100) : 100;

  document.getElementById('wpm').textContent = `WPM: ${wpm}`;
  document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  endTime = new Date();
  const timeElapsed = (endTime - startTime) / 1000; // in seconds
  const wordsTyped = currentIndex / 5; // Assuming 5 characters per word
  const wpm = Math.round((wordsTyped / (timeElapsed / 60)));
  const accuracy = Math.round(((currentIndex - mistakes) / currentIndex) * 100);

  const results = `
    Game Over!
    
    Words per minute: ${wpm}
    Accuracy: ${accuracy}%
    Time: ${formatTime(Math.round(timeElapsed))}
    Characters typed: ${currentIndex}
    Mistakes: ${mistakes}
    Total characters: ${originalText.length}
  `;

  alert(results);
  saveHighScore(wpm);
  closeGame();
}

function closeGame() {
  if (gameActive) {
    const confirmClose = confirm("Are you sure you want to close the game? Your progress will be lost.");
    if (!confirmClose) return;
  }
  document.body.removeChild(document.getElementById('typing-game-container'));
  clearInterval(timerInterval);
}

function saveHighScore(wpm) {
  chrome.storage.local.get(['highScores'], function(result) {
    let highScores = result.highScores || {};
    if (!highScores[difficulty] || wpm > highScores[difficulty]) {
      highScores[difficulty] = wpm;
      chrome.storage.local.set({highScores: highScores}, function() {
        console.log('High score updated');
      });
    }
  });
}

function applyStyles() {
  const style = document.createElement('style');
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
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      width: 80%;
      max-width: 800px;
    }
    #game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    #timer {
      font-size: 18px;
    }
    #close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    #progress-bar {
      width: 100%;
      height: 10px;
      background: #ddd;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    #progress {
      height: 100%;
      background: #4CAF50;
      width: 0;
      border-radius: 5px;
      transition: width 0.3s ease-in-out;
    }
    #text-display {
      font-size: 24px;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    #typing-input {
      width: 100%;
      font-size: 18px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .correct { color: green; }
    .incorrect { color: red; }
    #stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
  `;
  document.head.appendChild(style);
}