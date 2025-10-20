// Waits for YouTube to load
console.log("YouTube Comments Sidebar: Content script loaded!");

function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations, obs) => {
    const el = document.querySelector(selector);
    if (el) {
      obs.disconnect();
      callback(el);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Creates the sidebar
function createSidebar() {
  console.log("YouTube Comments Sidebar: Creating sidebar...");

  // Checks if sidebar already exists
  if (document.getElementById("yt-comments-sidebar")) {
    console.log("YouTube Comments Sidebar: Sidebar already exists");
    return;
  }

  const sidebar = document.createElement("div");
  sidebar.id = "yt-comments-sidebar";
  sidebar.className = "yt-comments-sidebar";

  // Creates header with controls
  const header = document.createElement("div");
  header.className = "sidebar-header";
  header.innerHTML = `
    <h3>Comments</h3>
    <div class="sidebar-controls">
      <button id="refresh-comments" title="Refresh">↻</button>
      <button id="toggle-sidebar" title="Hide">▼</button>
    </div>
  `;

  // Creates comments container - this will hold the actual YouTube comments element
  const commentsContainer = document.createElement("div");
  commentsContainer.className = "comments-container";
  commentsContainer.id = "sidebar-comments";

  sidebar.appendChild(header);
  sidebar.appendChild(commentsContainer);

  // Inserts sidebar into the page
  const secondary = document.querySelector("#secondary-inner");

  if (secondary) {
    console.log(
      "YouTube Comments Sidebar: Found #secondary-inner, inserting sidebar"
    );
    // Inserts sidebar above secondary
    secondary.parentNode.insertBefore(sidebar, secondary);

    // Modifys secondary styling to accommodate sidebar
    secondary.style.display = "block";
  } else {
    console.error("YouTube Comments Sidebar: #secondary-inner not found!");
    return;
  }

  // Moves comments into sidebar
  console.log("YouTube Comments Sidebar: About to move comments");
  moveCommentsToSidebar();

  // Adds event listeners
  const refreshBtn = document.getElementById("refresh-comments");
  const toggleBtn = document.getElementById("toggle-sidebar");

  if (refreshBtn && toggleBtn) {
    console.log("YouTube Comments Sidebar: Adding event listeners");
    refreshBtn.addEventListener("click", () => {
      console.log("YouTube Comments Sidebar: Refresh button clicked");
      moveCommentsToSidebar();
    });
    toggleBtn.addEventListener("click", toggleSidebar);
  } else {
    console.error("YouTube Comments Sidebar: Buttons not found!");
  }
}

// Moves the actual YouTube comments section into the sidebar
function moveCommentsToSidebar() {
  console.log("YouTube Comments Sidebar: moveCommentsToSidebar() called!");

  const container = document.getElementById("sidebar-comments");
  if (!container) {
    console.error(
      "YouTube Comments Sidebar: Container #sidebar-comments not found!"
    );
    return;
  }

  // Checks if we already moved comments
  const existingComments = container.querySelector("ytd-comments#comments");
  if (existingComments) {
    console.log("YouTube Comments Sidebar: Comments already in sidebar");
    return;
  }

  // Function to trigger YouTube to load comments by scrolling
  function triggerCommentsLoad() {
    console.log("YouTube Comments Sidebar: Triggering comments to load...");

    // Finds comments section in original location
    const commentsSection = document.querySelector("ytd-comments#comments");
    if (commentsSection) {
      // Scrolls to comments to trigger YouTube's lazy loading
      const originalPosition = window.scrollY;
      commentsSection.scrollIntoView({ behavior: "auto", block: "center" });

      // Waits a bit for comments to start loading
      setTimeout(() => {
        // Scrolls back to top
        window.scrollTo({ top: originalPosition, behavior: "auto" });
      }, 500);
    }
  }

  // Functions to attempt moving comments
  function attemptMove(retryCount = 0) {
    console.log(
      `YouTube Comments Sidebar: Attempt ${retryCount + 1} to move comments...`
    );

    // Firsts, try to trigger loading on early attempts
    if (retryCount === 2 || retryCount === 5) {
      triggerCommentsLoad();
    }

    // Finds the actual YouTube comments section
    let commentsSection = document.querySelector("ytd-comments#comments");

    // Trys alternative selectors
    if (!commentsSection) {
      commentsSection = document.querySelector("ytd-comments");
    }

    if (!commentsSection) {
      const pageManager = document.querySelector("ytd-watch-flexy");
      if (pageManager) {
        commentsSection = pageManager.querySelector("ytd-comments");
      }
    }

    if (!commentsSection) {
      console.log(
        "YouTube Comments Sidebar: Comments section not found in DOM"
      );
      if (retryCount < 25) {
        container.innerHTML = `<div class="loading">Waiting for comments section... (${
          retryCount + 1
        }/25)</div>`;
        setTimeout(() => attemptMove(retryCount + 1), 800);
      } else {
        container.innerHTML =
          '<div class="error">Comments not found. Please scroll down on the page first, then click refresh.</div>';
      }
      return;
    }

    console.log(
      "YouTube Comments Sidebar: Found comments section:",
      commentsSection
    );

    // Checks if comments section has loaded content
    const commentRenderer = commentsSection.querySelector(
      "ytd-comment-thread-renderer"
    );
    const hasSpinner = commentsSection.querySelector("tp-yt-paper-spinner");
    const hasContinuation = commentsSection.querySelector("#continuations");

    console.log(
      "YouTube Comments Sidebar: Has comment renderer:",
      !!commentRenderer
    );
    console.log("YouTube Comments Sidebar: Has spinner:", !!hasSpinner);
    console.log(
      "YouTube Comments Sidebar: Has continuation:",
      !!hasContinuation
    );

    // If no comments yet and still early, keep waiting
    if (!commentRenderer && retryCount < 5) {
      console.log(
        "YouTube Comments Sidebar: Comments section not populated yet, waiting..."
      );
      container.innerHTML = `<div class="loading">Comments loading... (${
        retryCount + 1
      }/5)<br><small>Try scrolling down on the page</small></div>`;
      setTimeout(() => attemptMove(retryCount + 1), 1000);
      return;
    }

    // Checks if comments are already in sidebar
    if (container.contains(commentsSection)) {
      console.log("YouTube Comments Sidebar: Comments already in container");
      return;
    }

    console.log("YouTube Comments Sidebar: Moving comments section to sidebar");

    // Clears container
    container.innerHTML = "";

    // Moves the entire comments section into our container
    try {
      container.appendChild(commentsSection);

      // Makes sure it's visible and styled properly
      commentsSection.style.display = "block";
      commentsSection.style.margin = "0";
      commentsSection.style.padding = "0";
      commentsSection.style.minHeight = "100%";

      // Adds custom class for styling
      commentsSection.classList.add("in-sidebar");

      console.log(
        "YouTube Comments Sidebar: Successfully moved comments to sidebar!"
      );

      // If no comments visible yet, show a message
      if (!commentRenderer && !hasSpinner) {
        const notice = document.createElement("div");
        notice.className = "loading";
        notice.style.position = "absolute";
        notice.style.top = "60px";
        notice.style.left = "50%";
        notice.style.transform = "translateX(-50%)";
        notice.innerHTML = "Scroll in this area to load comments";
        container.appendChild(notice);

        setTimeout(() => notice.remove(), 3000);
      }

      // Observes for new comments being loaded
      observeCommentChanges(commentsSection);
    } catch (error) {
      console.error("YouTube Comments Sidebar: Error moving comments:", error);
      container.innerHTML =
        '<div class="error">Error loading comments. Please refresh.</div>';
    }
  }

  // Start attempting to move after a delay
  setTimeout(() => attemptMove(0), 2000);
}

// Observes changes in the comments section (for infinite scroll, etc.)
function observeCommentChanges(commentsSection) {
  const observer = new MutationObserver((mutations) => {
    console.log("YouTube Comments Sidebar: Comments section updated");
  });

  observer.observe(commentsSection, {
    childList: true,
    subtree: true,
  });
}

// Toggles sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById("yt-comments-sidebar");
  if (sidebar) {
    sidebar.classList.toggle("hidden");
    const btn = document.getElementById("toggle-sidebar");
    btn.textContent = sidebar.classList.contains("hidden") ? "▲" : "▼";
  }
}

// Initializes
function init() {
  console.log("YouTube Comments Sidebar: Initializing...");

  // Waits for the page to be ready
  waitForElement("#secondary-inner", () => {
    console.log(
      "YouTube Comments Sidebar: Secondary found, creating sidebar in 2s"
    );
    setTimeout(createSidebar, styleContentsDiv, 2000);
  });
}

// Runs on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Handles YouTube's SPA navigation
let lastUrl = location.href;
let isNavigating = false;

let navigationObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("YouTube Comments Sidebar: ====== URL CHANGED ======");
    console.log("YouTube Comments Sidebar: New URL:", url);

    if (url.includes("/watch") && !isNavigating) {
      isNavigating = true;
      console.log(
        "YouTube Comments Sidebar: Watch page detected, reinitializing..."
      );

      // Removes old sidebar if exists
      const oldSidebar = document.getElementById("yt-comments-sidebar");
      if (oldSidebar) {
        console.log("YouTube Comments Sidebar: Removing old sidebar");
        oldSidebar.remove();
      }

      // Waits for YouTube to fully load the new page
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        console.log(
          `YouTube Comments Sidebar: Checks #${checkCount} - Looking for #secondary-inner...`
        );

        const secondary = document.querySelector("#secondary-inner");
        if (secondary) {
          console.log(
            "YouTube Comments Sidebar: Found #secondary-inner! Creating sidebar..."
          );
          clearInterval(checkInterval);
          createSidebar();
          setTimeout(() => {
            isNavigating = false;
          }, 2000);
        } else if (checkCount >= 10) {
          console.error(
            "YouTube Comments Sidebar: Failed to find #secondary-inner after 10 attempts"
          );
          clearInterval(checkInterval);
          isNavigating = false;
        }
      }, 500);
    } else if (!url.includes("/watch")) {
      // Not on watch page, remove sidebar if exists
      const oldSidebar = document.getElementById("yt-comments-sidebar");
      if (oldSidebar) {
        console.log(
          "YouTube Comments Sidebar: Not on watch page, removing sidebar"
        );
        oldSidebar.remove();
      }
      isNavigating = false;
    }
  }
});

function styleContentsDiv() {
  console.log("styleContentsDiv loaded...");

  const contentsDiv = document.getElementById("contents");
  if (contentsDiv) {
    contentsDiv.style.border = "3px solid red"; // example border
    contentsDiv.style.padding = "10px";
    contentsDiv.style.borderRadius = "8px";
  } else {
    // Retry in 500ms if element not found (YouTube dynamically loads content)
    setTimeout(styleContentsDiv, 500);
  }
}

navigationObserver.observe(document.body, { childList: true, subtree: true });
