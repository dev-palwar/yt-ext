// Check if we're on YouTube
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  console.log("popup.js loaded");

  const status = document.getElementById("status");
  if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com/watch")) {
    status.className = "status active";
    status.textContent = "✓ Extension Active";
  } else {
    status.className = "status";
    status.textContent = "Open a YouTube video to use";
  }
});
