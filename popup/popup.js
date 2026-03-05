document.addEventListener('DOMContentLoaded', () => {
  const modeDisplay = document.getElementById('current-mode');

  chrome.storage.local.get('nikkeMode', (result) => {
    const mode = result.nikkeMode || 'off';
    modeDisplay.textContent = mode.toUpperCase();
  });
});
