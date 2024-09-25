document.getElementById("startGame").addEventListener("click", function () {
  const timerValue = document.getElementById("timerInput").value;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // Check if the tab's URL is from the Chrome Web Store or other restricted pages
    if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('https://chrome.google.com/webstore')) {
      alert('Cannot run the typing game on this page.');
      return;
    }

    chrome.tabs.sendMessage(
      activeTab.id,
      { action: "ping" },
      function (response) {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript(
            { target: { tabId: activeTab.id }, files: ["content.js"] },
            function () {
              if (chrome.runtime.lastError) {
                console.error('Failed to inject script:', chrome.runtime.lastError);
                return;
              }
              startGame(activeTab.id, timerValue);
            }
          );
        } else {
          startGame(activeTab.id, timerValue);
        }
      }
    );
  });
});

function startGame(tabId, timerValue) {
  chrome.tabs.sendMessage(
    tabId,
    { action: "startGame", timerValue: timerValue },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error("Failed to start game:", chrome.runtime.lastError);
      }
    }
  );
}

function updateHighScores() {
  chrome.storage.local.get(["highScores"], function (result) {
    const highScores = result.highScores || []; // Ensure it's an array
    const highScoresDiv = document.getElementById("highScores");
    highScoresDiv.innerHTML = "<h2>High Scores</h2>";
    highScores.forEach(score => {
      highScoresDiv.innerHTML += `<p>${score} WPM</p>`;
    });
  });
}

updateHighScores();
