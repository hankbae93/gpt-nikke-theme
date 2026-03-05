/**
 * Service Worker - manages extension state and settings
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ nikkeMode: 'off' });
  console.log('[NIKKE] Extension installed, mode set to off');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getMode') {
    chrome.storage.local.get('nikkeMode', (result) => {
      sendResponse({ mode: result.nikkeMode || 'off' });
    });
    return true;
  }

  if (message.type === 'setMode') {
    chrome.storage.local.set({ nikkeMode: message.mode }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
