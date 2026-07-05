// Check if we're on YouTube
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const statusCard = document.getElementById("status-card");
  const statusText = document.getElementById("status-text");

  if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com/watch")) {
    statusCard.className = "status-card";
    statusText.textContent = "Extension Active";
  } else {
    statusCard.className = "status-card inactive";
    statusText.textContent = "Open a YouTube video to use";
  }
});
