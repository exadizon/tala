chrome.runtime.onInstalled.addListener(() => {
  console.log("Tala extension installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    handleCapture(request.data).then(sendResponse);
    return true;
  }
});

async function handleCapture(data) {
  const stored = await chrome.storage.local.get(["authToken"]);
  const authToken = stored.authToken;

  if (!authToken) {
    return { error: "Not authenticated" };
  }

  try {
    const response = await fetch("http://localhost:3000/api/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: "Failed to capture" };
  }
}
