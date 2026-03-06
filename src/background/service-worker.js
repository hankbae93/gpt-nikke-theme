/**
 * Service Worker - manages extension state and settings
 */

const DEFAULT_SETTINGS = {
  speakerName: 'Enik'
};

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

  if (message.type === 'getSettings') {
    chrome.storage.local.get('nikkeSettings', (result) => {
      sendResponse({ settings: result.nikkeSettings || DEFAULT_SETTINGS });
    });
    return true;
  }

  if (message.type === 'setSettings') {
    chrome.storage.local.get('nikkeSettings', (result) => {
      const current = result.nikkeSettings || DEFAULT_SETTINGS;
      const updated = { ...current, ...message.settings };
      chrome.storage.local.set({ nikkeSettings: updated }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === 'resetSettings') {
    chrome.storage.local.set({ nikkeSettings: DEFAULT_SETTINGS }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
