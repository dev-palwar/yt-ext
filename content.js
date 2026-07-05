// Waits for YouTube to load

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

  // Checks if sidebar already exists
  if (document.getElementById("yt-comments-sidebar")) {
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
      <button id="refresh-comments" title="Refresh">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        </svg>
      </button>
      <button id="toggle-sidebar" title="Toggle">
        <svg id="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </button>
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
    // Inserts sidebar above secondary
    secondary.parentNode.insertBefore(sidebar, secondary);

    // Modifys secondary styling to accommodate sidebar
    secondary.style.display = "block";
  } else {
    return;
  }

  // Moves comments into sidebar
  moveCommentsToSidebar();

  // Adds event listeners
  const refreshBtn = document.getElementById("refresh-comments");
  const toggleBtn = document.getElementById("toggle-sidebar");

  if (refreshBtn && toggleBtn) {
    refreshBtn.addEventListener("click", () => {
      moveCommentsToSidebar();
    });
    toggleBtn.addEventListener("click", toggleSidebar);
  } else {
  }
}

// Moves the actual YouTube comments section into the sidebar
function moveCommentsToSidebar() {

  const container = document.getElementById("sidebar-comments");
  if (!container) {
    return;
  }

  // Checks if we already moved comments
  const existingComments = container.querySelector("ytd-comments#comments");
  if (existingComments) {
    return;
  }

  // Function to trigger YouTube to load comments by scrolling
  function triggerCommentsLoad() {

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


    // Checks if comments section has loaded content
    const commentRenderer = commentsSection.querySelector(
      "ytd-comment-thread-renderer"
    );
    const hasSpinner = commentsSection.querySelector("tp-yt-paper-spinner");
    const hasContinuation = commentsSection.querySelector("#continuations");


    // If no comments yet and still early, keep waiting
    if (!commentRenderer && retryCount < 5) {
      container.innerHTML = `<div class="loading">Comments loading... (${
        retryCount + 1
      }/5)<br><small>Try scrolling down on the page</small></div>`;
      setTimeout(() => attemptMove(retryCount + 1), 1000);
      return;
    }

    // Checks if comments are already in sidebar
    if (container.contains(commentsSection)) {
      return;
    }


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
    const icon = document.getElementById("toggle-icon");
    if (icon) {
      if (sidebar.classList.contains("hidden")) {
        icon.style.transform = "rotate(180deg)";
        icon.style.transition = "transform 0.3s ease";
      } else {
        icon.style.transform = "rotate(0deg)";
      }
    }
  }
}

// Initializes
function init() {

  // Waits for the page to be ready
  waitForElement("#secondary-inner", () => {
    setTimeout(createSidebar, 2000);
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

    if (url.includes("/watch") && !isNavigating) {
      isNavigating = true;

      // Removes old sidebar if exists
      const oldSidebar = document.getElementById("yt-comments-sidebar");
      if (oldSidebar) {
        oldSidebar.remove();
      }

      // Waits for YouTube to fully load the new page
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;

        const secondary = document.querySelector("#secondary-inner");
        if (secondary) {
          clearInterval(checkInterval);
          createSidebar();
          setTimeout(() => {
            isNavigating = false;
          }, 2000);
        } else if (checkCount >= 10) {
          clearInterval(checkInterval);
          isNavigating = false;
        }
      }, 500);
    } else if (!url.includes("/watch")) {
      // Not on watch page, remove sidebar if exists
      const oldSidebar = document.getElementById("yt-comments-sidebar");
      if (oldSidebar) {
        oldSidebar.remove();
      }
      isNavigating = false;
    }
  }
});

navigationObserver.observe(document.body, { childList: true, subtree: true });
