chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHighlight") {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    sendResponse({ text });
  }
});
