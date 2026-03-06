/**
 * VNMode - Full-screen visual novel overlay
 *
 * - ChatGPT renders underneath, overlay covers it
 * - Polls last assistant response, extracts rendered HTML (preserves markdown)
 * - Chunks by top-level block elements (p, pre, ul, ol, h1-h6, etc.)
 * - Click to advance dialogue like a visual novel
 * - Full View panel shows complete rendered response
 * - Composer themed via CSS to blend with VN overlay (no more show/hide hack)
 */
class VNMode {
  constructor(adapter) {
    this._adapter = adapter;
    this._active = false;
    this._overlay = null;
    this._pollTimer = null;

    // DOM refs
    this._dialogueText = null;
    this._clickIndicator = null;
    this._fullviewBtn = null;
    this._fullviewPanel = null;
    this._fullviewContent = null;

    // Chunk state (HTML chunks)
    this._chunks = [];
    this._chunkIndex = 0;
    this._lastContentHash = '';

    // Composer reparenting state
    this._composerParent = null;
    this._composerNext = null;

    // Bound handler for cleanup
    this._onClickAdvance = this._onClickAdvance.bind(this);
  }

  activate() {
    if (this._active) return;
    this._active = true;

    if (!this._overlay) {
      this._buildOverlay();
    }

    this._overlay.style.display = 'block';
    this._liftComposer();
    this._resetChunks();
    this._startPolling();
    this._syncDialoguePadding();
    console.log('[NIKKE] VN mode activated');
  }

  deactivate() {
    if (!this._active) return;
    this._active = false;

    if (this._overlay) {
      this._overlay.style.display = 'none';
    }
    this._closeFullView();
    this._stopPolling();
    this._restoreComposer();
    console.log('[NIKKE] VN mode deactivated');
  }

  get isActive() {
    return this._active;
  }

  _buildOverlay() {
    const bgUrl = chrome.runtime.getURL('assets/default_background.webp');
    const charUrl = chrome.runtime.getURL('assets/default_character.png');

    this._overlay = document.createElement('div');
    this._overlay.id = 'nikke-vn-overlay';

    this._overlay.innerHTML = `
      <div id="nikke-vn-bg" style="background-image: url('${bgUrl}')"></div>
      <img id="nikke-vn-character" src="${charUrl}" alt="">
      <div id="nikke-vn-click-zone"></div>
      <button class="nikke-vn-fullview-btn" title="Full view">Full View</button>
      <div id="nikke-vn-bottom">
        <div id="nikke-vn-dialogue-area">
          <div class="nikke-vn-dialogue-box">
            <div class="nikke-vn-speaker-row">
              <div class="nikke-vn-color-bar"></div>
              <div class="nikke-vn-speaker-name">Enik</div>
            </div>
            <div class="nikke-vn-dialogue-text"></div>
            <div class="nikke-vn-click-indicator">&#9660;</div>
          </div>
        </div>
      </div>
      <div id="nikke-vn-fullview-panel">
        <div class="nikke-vn-fullview-header">
          <span class="nikke-vn-fullview-title">Full Response</span>
          <button class="nikke-vn-fullview-close">&times;</button>
        </div>
        <div class="nikke-vn-fullview-content"></div>
      </div>
    `;

    document.body.appendChild(this._overlay);

    // Cache refs
    this._dialogueText = this._overlay.querySelector('.nikke-vn-dialogue-text');
    this._clickIndicator = this._overlay.querySelector('.nikke-vn-click-indicator');
    this._fullviewBtn = this._overlay.querySelector('.nikke-vn-fullview-btn');
    this._fullviewPanel = this._overlay.querySelector('#nikke-vn-fullview-panel');
    this._fullviewContent = this._overlay.querySelector('.nikke-vn-fullview-content');

    // Click zone advances dialogue
    const clickZone = this._overlay.querySelector('#nikke-vn-click-zone');
    clickZone.addEventListener('click', this._onClickAdvance);

    // Full view toggle
    this._fullviewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleFullView();
    });
    this._overlay.querySelector('.nikke-vn-fullview-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this._closeFullView();
    });
  }

  // --- Composer reparenting (escape stacking contexts by moving to body) ---

  _liftComposer() {
    const composer = this._adapter.getComposer();
    if (!composer || composer.parentElement === document.body) return;
    this._composerParent = composer.parentElement;
    this._composerNext = composer.nextElementSibling;
    document.body.appendChild(composer);
    console.log('[NIKKE] Composer lifted to body');
  }

  _restoreComposer() {
    const composer = this._adapter.getComposer();
    if (!composer || !this._composerParent) return;
    if (this._composerNext && this._composerNext.parentElement === this._composerParent) {
      this._composerParent.insertBefore(composer, this._composerNext);
    } else {
      this._composerParent.appendChild(composer);
    }
    this._composerParent = null;
    this._composerNext = null;
    console.log('[NIKKE] Composer restored');
  }

  // --- Input visibility ---

  _getComposerHeight() {
    if (!this._adapter) return 0;
    const composer = this._adapter.getComposer();
    if (!composer) return 0;
    return composer.offsetHeight || 0;
  }

  _syncDialoguePadding() {
    if (!this._overlay) return;
    const h = this._getComposerHeight();
    const bottom = this._overlay.querySelector('#nikke-vn-bottom');
    if (bottom) bottom.style.paddingBottom = h > 0 ? h + 'px' : '0';
  }

  // --- Click advance ---

  _onClickAdvance() {
    if (!this._active) return;

    if (this._chunkIndex < this._chunks.length - 1) {
      this._chunkIndex++;
      this._renderCurrentChunk();
    }
  }

  // --- Chunking (HTML block-element based) ---

  _resetChunks() {
    this._chunks = [];
    this._chunkIndex = 0;
    this._lastContentHash = '';
    if (this._dialogueText) {
      this._dialogueText.innerHTML = '';
    }
    this._syncDialoguePadding();
    if (this._clickIndicator) {
      this._clickIndicator.classList.remove('hidden');
    }
  }

  /**
   * Chunk by top-level block elements from the .markdown.prose container.
   * Groups small elements (p) into chunks of ~3, keeps large elements
   * (pre, table, blockquote, headings) as standalone chunks.
   */
  _chunkHtml(contentEl) {
    const children = contentEl.children;
    if (!children || children.length === 0) {
      const html = contentEl.innerHTML.trim();
      return html ? [html] : [];
    }

    const chunks = [];
    let buffer = [];
    const STANDALONE_TAGS = new Set(['PRE', 'TABLE', 'BLOCKQUOTE', 'HR', 'DETAILS']);
    const MAX_PER_CHUNK = 3;

    for (const child of children) {
      const tag = child.tagName;

      // Standalone: code blocks, tables, blockquotes, headings
      if (STANDALONE_TAGS.has(tag) || (tag && tag.match(/^H[1-6]$/))) {
        if (buffer.length > 0) {
          chunks.push(buffer.join(''));
          buffer = [];
        }
        chunks.push(child.outerHTML);
        continue;
      }

      buffer.push(child.outerHTML);

      if (buffer.length >= MAX_PER_CHUNK) {
        chunks.push(buffer.join(''));
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      chunks.push(buffer.join(''));
    }

    return chunks;
  }

  _renderCurrentChunk() {
    if (!this._dialogueText || this._chunks.length === 0) return;

    const chunk = this._chunks[this._chunkIndex];
    this._dialogueText.innerHTML = chunk;

    const isLast = this._chunkIndex >= this._chunks.length - 1;

    // Show/hide click indicator
    if (this._clickIndicator) {
      this._clickIndicator.classList.toggle('hidden', isLast);
    }

    // Show full view button if multiple chunks
    this._fullviewBtn.classList.toggle('visible', this._chunks.length > 1);

    // Keep dialogue above composer
    this._syncDialoguePadding();

    // Update full view if open
    if (this._fullviewPanel.classList.contains('open')) {
      this._updateFullViewContent();
    }
  }

  // --- Polling ---

  _startPolling() {
    this._pollNow();
    this._pollTimer = setInterval(() => this._pollNow(), 500);
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  _pollNow() {
    if (!this._adapter || !this._active) return;

    const lastTurn = this._adapter.getLastAssistantTurn();
    if (!lastTurn) return;

    const contentEl = this._adapter.getTurnContent(lastTurn);
    if (!contentEl) return;

    // Use innerHTML to preserve rendered markdown
    const html = contentEl.innerHTML || '';
    // Quick hash to detect changes
    const hash = html.length + ':' + html.slice(0, 100) + html.slice(-100);
    if (hash === this._lastContentHash) return;

    const oldChunks = this._chunks;
    const newChunks = this._chunkHtml(contentEl);

    if (newChunks.length === 0) return;

    // Detect new response: chunk count dropped or first chunk changed
    const isNewResponse = oldChunks.length > 0 &&
      (newChunks.length < oldChunks.length ||
       newChunks[0] !== oldChunks[0]);

    this._lastContentHash = hash;
    this._chunks = newChunks;

    if (oldChunks.length === 0 || isNewResponse) {
      this._chunkIndex = 0;
    } else if (this._chunkIndex >= this._chunks.length) {
      this._chunkIndex = this._chunks.length - 1;
    }

    this._renderCurrentChunk();
  }

  // --- Full View ---

  _toggleFullView() {
    if (this._fullviewPanel.classList.contains('open')) {
      this._closeFullView();
    } else {
      this._openFullView();
    }
  }

  _openFullView() {
    this._updateFullViewContent();
    this._fullviewPanel.classList.add('open');
  }

  /**
   * Clone rendered HTML from ChatGPT's own markdown rendering into full view.
   */
  _updateFullViewContent() {
    const lastTurn = this._adapter.getLastAssistantTurn();
    if (!lastTurn) return;
    const contentEl = this._adapter.getTurnContent(lastTurn);
    if (!contentEl) return;
    this._fullviewContent.innerHTML = contentEl.innerHTML;
  }

  _closeFullView() {
    if (this._fullviewPanel) {
      this._fullviewPanel.classList.remove('open');
    }
  }

  destroy() {
    this._stopPolling();
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    this._active = false;
  }
}

window.VNMode = VNMode;
