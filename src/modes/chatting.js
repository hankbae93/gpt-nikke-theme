/**
 * ChattingMode - NIKKE Blabla chat theme
 *
 * Strategy (StyleGPT pattern):
 *   1. Toggle html.dark -> html.light globally (activates GPT light variables)
 *   2. Inject <style> tag with NIKKE custom overrides
 *   3. Re-apply dark theme to sidebar via CSS
 *   4. On deactivate, restore original dark/light state
 */
class ChattingMode {
  constructor() {
    this._active = false;
    this._styleTag = null;
    this._onStorageChange = this._onStorageChange.bind(this);
    chrome.storage.onChanged.addListener(this._onStorageChange);
  }

  activate() {
    if (this._active) return;
    this._active = true;

    this._loadAndInject();
    this._applyBgColor();
    console.log('[NIKKE] Chatting mode activated');
  }

  async _loadAndInject() {
    if (!chrome.runtime?.id) return;
    const profileDataURL = await ImageStore.loadImage('profile');
    const result = await new Promise(resolve => {
      chrome.storage.local.get('nikkeSettings', resolve);
    });
    const speakerName = (result.nikkeSettings && result.nikkeSettings.speakerName) || 'Enik';
    this._injectStyleTag(profileDataURL, speakerName);
  }

  _onStorageChange(changes, area) {
    if (!chrome.runtime?.id) return; // extension context invalidated
    if (area !== 'local' || !this._active) return;
    const imageChanged = Object.keys(changes).some(k => k.startsWith('nikkeImg_'));
    if (imageChanged || changes.nikkeSettings) {
      this._removeStyleTag();
      this._loadAndInject();
    }
  }

  deactivate() {
    if (!this._active) return;
    this._active = false;

    this._removeBgColor();
    this._removeStyleTag();
    console.log('[NIKKE] Chatting mode deactivated');
  }

  get isActive() {
    return this._active;
  }

  _injectStyleTag(customProfileURL, speakerName) {
    if (this._styleTag) return;

    const topUrl = chrome.runtime.getURL('assets/blabla/top.png');
    const pfpUrl = customProfileURL || chrome.runtime.getURL('assets/profile.png');
    const name = speakerName || 'Enik';
    // Escape single quotes for CSS content
    const cssName = name.replace(/'/g, "\\'");

    this._styleTag = document.createElement('style');
    this._styleTag.id = 'nikke-chatting-theme';
    this._styleTag.textContent = `
      /* === Assistant profile picture === */
      body.llm-nikke-chatting [data-message-author-role="assistant"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: url("${pfpUrl}") center/cover no-repeat;
        background-color: #e0ddd8;
      }

      /* === Speaker name (dynamic) === */
      body.llm-nikke-chatting [data-message-author-role="assistant"] > div > .markdown.prose::before {
        content: '${cssName}';
      }

      /* === Scope light text to main content area (exclude sidebar & header) === */
      body.llm-nikke-chatting [role="presentation"] {
        --text-primary: #333;
        --token-text-primary: #333;
        --text-secondary: #666;
        --token-text-secondary: #666;
        --token-text-tertiary: #999;
        color-scheme: light;
      }

      /* Sidebar: preserve dark theme */
      body.llm-nikke-chatting #stage-slideover-sidebar {
        --text-primary: #ececec;
        --token-text-primary: #ececec;
        --text-secondary: #b4b4b4;
        --token-text-secondary: #b4b4b4;
        --token-text-tertiary: #888;
        color-scheme: dark;
      }

      /* === Page header: NIKKE orange banner === */
      body.llm-nikke-chatting #page-header {
        background: url("${topUrl}") !important;
        background-size: cover !important;
        background-position: center !important;
        border-bottom: 2px solid #c4841a;
      }

      /* Header buttons/text: white for readability on orange */
      body.llm-nikke-chatting #page-header button,
      body.llm-nikke-chatting #page-header a,
      body.llm-nikke-chatting #page-header span,
      body.llm-nikke-chatting #page-header svg {
        color: #fff !important;
        fill: #fff !important;
      }
    `;
    document.head.appendChild(this._styleTag);
  }

  _applyBgColor() {
    const el = document.querySelector('[role="presentation"]');
    if (el) {
      this._origBg = el.style.backgroundColor;
      el.style.backgroundColor = '#f2f2f2';
    }
  }

  _removeBgColor() {
    const el = document.querySelector('[role="presentation"]');
    if (el) {
      el.style.backgroundColor = this._origBg || '';
    }
  }

  _removeStyleTag() {
    if (this._styleTag) {
      this._styleTag.remove();
      this._styleTag = null;
    }
  }
}

window.ChattingMode = ChattingMode;
