/**
 * ImageStore - chrome.storage.local helper for custom images
 * Stores images as base64 data URLs so both popup and content scripts
 * can access them (IndexedDB is origin-scoped and doesn't work cross-context).
 *
 * Keys: 'nikkeImg_background', 'nikkeImg_character', 'nikkeImg_profile'
 */
const ImageStore = (() => {
  const PREFIX = 'nikkeImg_';

  function _key(name) {
    return PREFIX + name;
  }

  function _contextValid() {
    return !!(chrome.runtime && chrome.runtime.id);
  }

  /**
   * Convert a File/Blob to a base64 data URL.
   */
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Save an image (File or Blob) as base64 data URL.
   */
  async function saveImage(key, blob) {
    if (!_contextValid()) return;
    const dataURL = await blobToDataURL(blob);
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [_key(key)]: dataURL }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Load a stored data URL string (or null if not set).
   */
  function loadImage(key) {
    if (!_contextValid()) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(_key(key), (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(result[_key(key)] || null);
      });
    });
  }

  /**
   * Delete a stored image.
   */
  function deleteImage(key) {
    if (!_contextValid()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(_key(key), () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Delete all stored images.
   */
  function deleteAll() {
    if (!_contextValid()) return Promise.resolve();
    const keys = ['background', 'character', 'profile'].map(_key);
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Alias: loadImage already returns a usable data URL string.
   */
  const loadImageAsURL = loadImage;

  return { saveImage, loadImage, deleteImage, deleteAll, loadImageAsURL, blobToDataURL };
})();
