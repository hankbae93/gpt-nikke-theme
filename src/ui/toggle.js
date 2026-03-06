/**
 * ToggleUI - Floating toggle button for mode switching
 * Cycles: OFF -> Chatting -> VN -> OFF
 */
class ToggleUI {
  constructor() {
    this.modes = ['off', 'chatting', 'vn'];
    this.currentIndex = 0;
    this.button = null;
    this.onModeChange = null;
  }

  init(onModeChange) {
    this.onModeChange = onModeChange;
    this._createButton();
    this._loadSavedMode();
  }

  _createButton() {
    this.button = document.createElement('div');
    this.button.id = 'nikke-toggle-btn';
    this.button.textContent = 'N';
    this.button.title = 'NIKKE Theme: OFF';
    this.button.addEventListener('click', () => this._cycleMode());
    document.body.appendChild(this.button);
  }

  _cycleMode() {
    this.currentIndex = (this.currentIndex + 1) % this.modes.length;
    const mode = this.modes[this.currentIndex];
    this._applyMode(mode);
  }

  _applyMode(mode) {
    // Remove all mode classes
    document.body.classList.remove('llm-nikke-chatting', 'llm-nikke-vn');

    // Update button state
    this.button.classList.remove('nikke-toggle--chatting', 'nikke-toggle--vn');

    if (mode === 'chatting') {
      document.body.classList.add('llm-nikke-chatting');
      this.button.classList.add('nikke-toggle--chatting');
      this.button.title = 'NIKKE Theme: Chatting';
    } else if (mode === 'vn') {
      document.body.classList.add('llm-nikke-vn');
      this.button.classList.add('nikke-toggle--vn');
      this.button.title = 'NIKKE Theme: VN';
    } else {
      this.button.title = 'NIKKE Theme: OFF';
    }

    // Persist mode (guard against invalidated context after extension reload)
    if (chrome.runtime?.id) {
      chrome.storage.local.set({ nikkeMode: mode });
    }

    // Notify callback
    if (this.onModeChange) {
      this.onModeChange(mode);
    }

    console.log(`[NIKKE] Mode: ${mode}`);
  }

  _loadSavedMode() {
    if (!chrome.runtime?.id) return;
    chrome.storage.local.get('nikkeMode', (result) => {
      const saved = result.nikkeMode || 'off';
      this.currentIndex = this.modes.indexOf(saved);
      if (this.currentIndex === -1) this.currentIndex = 0;
      if (saved !== 'off') {
        this._applyMode(saved);
      }
    });
  }

  getCurrentMode() {
    return this.modes[this.currentIndex];
  }

  destroy() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }
}

window.ToggleUI = ToggleUI;
