export {};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  chrome.storage.local.set({
    initialized: true,
    lastUpdate: new Date().toISOString(),
  });
});
