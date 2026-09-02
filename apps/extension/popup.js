const API_URL = "http://localhost:3000/api";

let currentTab = null;
let authToken = null;

async function init() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];

  const stored = await chrome.storage.local.get(["authToken"]);
  authToken = stored.authToken;

  render();
}

function render() {
  const app = document.getElementById("app");

  if (!authToken) {
    app.innerHTML = `
      <div class="header">
        <h1>Tala</h1>
      </div>
      <div class="auth-form">
        <input type="email" id="email" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button id="loginBtn">Sign in</button>
        <div class="auth-link">
          Don't have an account? <a href="http://localhost:3000/signup" target="_blank">Sign up</a>
        </div>
      </div>
    `;

    document.getElementById("loginBtn").addEventListener("click", handleLogin);
  } else {
    app.innerHTML = `
      <div class="header">
        <h1>Tala</h1>
        <button id="logoutBtn">Sign out</button>
      </div>
      <div class="content">
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="title" placeholder="Page title" value="${escapeHtml(currentTab?.title || "")}" />
        </div>
        <div class="input-group">
          <label>Note (optional)</label>
          <textarea id="note" placeholder="Add a note..."></textarea>
        </div>
        <div class="button-group">
          <button class="button button-primary" id="captureBtn">Capture</button>
          <button class="button button-secondary" id="highlightBtn">Save Highlight</button>
        </div>
        <div id="status"></div>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    document.getElementById("captureBtn").addEventListener("click", handleCapture);
    document.getElementById("highlightBtn").addEventListener("click", handleHighlight);
  }
}

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showStatus("Please fill in all fields", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      authToken = data.token;
      await chrome.storage.local.set({ authToken });
      render();
    } else {
      showStatus("Invalid email or password", "error");
    }
  } catch (error) {
    showStatus("Failed to sign in", "error");
  }
}

async function handleLogout() {
  authToken = null;
  await chrome.storage.local.remove(["authToken"]);
  render();
}

async function handleCapture() {
  const title = document.getElementById("title").value;
  const note = document.getElementById("note").value;

  if (!currentTab?.url) {
    showStatus("No page URL available", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        url: currentTab.url,
        type: "url",
        title: title || currentTab.title,
        note: note || undefined,
      }),
    });

    if (response.ok) {
      showStatus("Page captured!", "success");
      document.getElementById("note").value = "";
    } else {
      showStatus("Failed to capture page", "error");
    }
  } catch (error) {
    showStatus("Failed to capture page", "error");
  }
}

async function handleHighlight() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "getHighlight" }, async (response) => {
    if (response?.text) {
      const note = document.getElementById("note").value;

      try {
        const response = await fetch(`${API_URL}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            url: tab.url,
            type: "highlight",
            content: response.text,
            note: note || undefined,
            title: tab.title,
          }),
        });

        if (response.ok) {
          showStatus("Highlight saved!", "success");
          document.getElementById("note").value = "";
        } else {
          showStatus("Failed to save highlight", "error");
        }
      } catch (error) {
        showStatus("Failed to save highlight", "error");
      }
    } else {
      showStatus("Select some text first", "error");
    }
  });
}

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.innerHTML = `<div class="status status-${type}">${message}</div>`;
  setTimeout(() => {
    status.innerHTML = "";
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

init();
