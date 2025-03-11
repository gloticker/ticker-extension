export {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    initialized: true,
    lastUpdate: new Date().toISOString(),
  });
});
