document.getElementById('startGame').addEventListener('click', function() {
  const difficulty = document.getElementById('difficulty').value;
  const timerValue = document.getElementById('timerInput').value;
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    
    chrome.tabs.sendMessage(activeTab.id, {action: "ping"}, function(response) {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript(
          {
            target: {tabId: activeTab.id},
            files: ['content.js']
          },
          function() {
            if (chrome.runtime.lastError) {
              console.error('Script injection failed:', chrome.runtime.lastError);
              return;
            }
            startGame(activeTab.id, difficulty, timerValue);
          }
        );
      } else {
        startGame(activeTab.id, difficulty, timerValue);
      }
    });
  });
});

function startGame(tabId, difficulty, timerValue) {
  chrome.tabs.sendMessage(tabId, {action: "startGame", difficulty: difficulty, timerValue: timerValue}, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Failed to start game:', chrome.runtime.lastError);
    }
  });
}

function updateHighScores() {
  chrome.storage.local.get(['highScores'], function(result) {
    const highScores = result.highScores || {};
    const highScoresDiv = document.getElementById('highScores');
    highScoresDiv.innerHTML = '<h2>High Scores</h2>';
    for (const [difficulty, score] of Object.entries(highScores)) {
      highScoresDiv.innerHTML += `<p>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}: ${score} WPM</p>`;
    }
  });
}

updateHighScores();