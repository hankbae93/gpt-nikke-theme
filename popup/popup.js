document.addEventListener('DOMContentLoaded', async () => {
  const modeDisplay = document.getElementById('current-mode');
  const speakerInput = document.getElementById('speaker-name');
  const saveBtn = document.getElementById('save-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  const IMAGE_KEYS = [
    { key: 'background', thumbId: 'bg-thumb', fileId: 'bg-file', resetId: 'bg-reset', defaultAsset: 'assets/default_background.webp' },
    { key: 'character', thumbId: 'char-thumb', fileId: 'char-file', resetId: 'char-reset', defaultAsset: 'assets/default_character.png' },
    { key: 'profile', thumbId: 'profile-thumb', fileId: 'profile-file', resetId: 'profile-reset', defaultAsset: 'assets/profile.png' }
  ];

  const SIZE_WARN_BYTES = 5 * 1024 * 1024; // 5MB

  // --- Load current state ---

  chrome.storage.local.get(['nikkeMode', 'nikkeSettings'], (result) => {
    modeDisplay.textContent = (result.nikkeMode || 'off').toUpperCase();
    const settings = result.nikkeSettings || {};
    speakerInput.value = settings.speakerName || 'Enik';
  });

  // Load image thumbnails
  for (const img of IMAGE_KEYS) {
    const thumb = document.getElementById(img.thumbId);
    try {
      const dataURL = await ImageStore.loadImage(img.key);
      thumb.src = dataURL || chrome.runtime.getURL(img.defaultAsset);
    } catch {
      thumb.src = chrome.runtime.getURL(img.defaultAsset);
    }
  }

  // --- File choose buttons ---

  document.querySelectorAll('.setting-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.target).click();
    });
  });

  // --- File input handlers ---

  for (const img of IMAGE_KEYS) {
    const fileInput = document.getElementById(img.fileId);
    const thumb = document.getElementById(img.thumbId);

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      if (file.size > SIZE_WARN_BYTES) {
        const ok = confirm(`This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Large images may slow down the extension. Continue?`);
        if (!ok) {
          fileInput.value = '';
          return;
        }
      }

      try {
        await ImageStore.saveImage(img.key, file);
        // Reload the saved data URL for thumbnail
        const dataURL = await ImageStore.loadImage(img.key);
        thumb.src = dataURL;
        showToast(`${img.key} image updated`);
      } catch (e) {
        showToast('Failed to save image', true);
        console.error('[NIKKE] Image save error:', e);
      }
    });

    // Reset individual image
    document.getElementById(img.resetId).addEventListener('click', async () => {
      try {
        await ImageStore.deleteImage(img.key);
        thumb.src = chrome.runtime.getURL(img.defaultAsset);
        showToast(`${img.key} image reset`);
      } catch (e) {
        showToast('Failed to reset image', true);
      }
    });
  }

  // --- Save speaker name ---

  saveBtn.addEventListener('click', () => {
    const name = speakerInput.value.trim() || 'Enik';
    chrome.runtime.sendMessage({ type: 'setSettings', settings: { speakerName: name } }, (resp) => {
      if (resp && resp.success) {
        showToast('Settings saved');
      } else {
        showToast('Failed to save', true);
      }
    });
  });

  // --- Reset all ---

  resetAllBtn.addEventListener('click', async () => {
    if (!confirm('Reset all settings to defaults?')) return;

    try {
      await ImageStore.deleteAll();
      chrome.runtime.sendMessage({ type: 'resetSettings' }, () => {
        speakerInput.value = 'Enik';
        for (const img of IMAGE_KEYS) {
          const thumb = document.getElementById(img.thumbId);
          thumb.src = chrome.runtime.getURL(img.defaultAsset);
        }
        showToast('All settings reset');
      });
    } catch (e) {
      showToast('Failed to reset', true);
    }
  });

  // --- Toast ---

  function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast' + (isError ? ' toast-error' : '') + ' toast-show';
    setTimeout(() => { toast.className = 'toast'; }, 2000);
  }
});
