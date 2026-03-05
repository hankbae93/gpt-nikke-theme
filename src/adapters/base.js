/**
 * LLMAdapter - Base class for LLM service adapters
 * Each adapter defines DOM selectors and queries for a specific LLM UI.
 */
class LLMAdapter {
  constructor() {
    if (new.target === LLMAdapter) {
      throw new Error('LLMAdapter is abstract and cannot be instantiated directly');
    }
  }

  /** @returns {string} Service name (e.g. 'chatgpt', 'gemini') */
  get name() {
    throw new Error('Not implemented');
  }

  /** @returns {string[]} Hostnames this adapter handles */
  static get hostnames() {
    throw new Error('Not implemented');
  }

  // --- Container selectors ---

  /** @returns {Element|null} The thread/conversation container (excludes sidebar) */
  getThreadContainer() {
    throw new Error('Not implemented');
  }

  /** @returns {Element|null} The composer/input area */
  getComposer() {
    throw new Error('Not implemented');
  }

  // --- Message queries ---

  /** @returns {Element[]} All message turn elements in the thread */
  getAllTurns() {
    throw new Error('Not implemented');
  }

  /** @returns {Element|null} The last assistant turn element */
  getLastAssistantTurn() {
    throw new Error('Not implemented');
  }

  /**
   * Get the role of a turn element
   * @param {Element} turnEl
   * @returns {'user'|'assistant'|null}
   */
  getTurnRole(turnEl) {
    throw new Error('Not implemented');
  }

  /**
   * Get the text content element inside a turn
   * @param {Element} turnEl
   * @returns {Element|null}
   */
  getTurnContent(turnEl) {
    throw new Error('Not implemented');
  }

  // --- Scoping ---

  /**
   * CSS selector for the area where theme styles should be applied
   * (thread only, not sidebar)
   * @returns {string}
   */
  get threadSelector() {
    throw new Error('Not implemented');
  }

  /**
   * Check if the page is ready (thread container exists)
   * @returns {boolean}
   */
  isReady() {
    return this.getThreadContainer() !== null;
  }
}

window.LLMAdapter = LLMAdapter;
