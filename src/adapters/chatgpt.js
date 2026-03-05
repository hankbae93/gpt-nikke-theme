/**
 * ChatGPTAdapter - DOM selectors and queries for ChatGPT (chatgpt.com)
 *
 * Key DOM structure (as of 2025):
 *   main#main
 *     #thread
 *       article[data-testid="conversation-turn-N"][data-turn="user"|"assistant"]
 *         [data-message-author-role="user"|"assistant"]
 *           .markdown.prose  (assistant content)
 *           .whitespace-pre-wrap  (user content)
 *       form[data-type="unified-composer"]
 *         #prompt-textarea (ProseMirror contenteditable)
 */
class ChatGPTAdapter extends LLMAdapter {
  get name() {
    return 'chatgpt';
  }

  static get hostnames() {
    return ['chatgpt.com', 'chat.openai.com'];
  }

  get threadSelector() {
    return '#thread';
  }

  getThreadContainer() {
    return document.querySelector('#thread');
  }

  getComposer() {
    return document.querySelector('form[data-type="unified-composer"]');
  }

  getAllTurns() {
    const thread = this.getThreadContainer();
    if (!thread) return [];
    return [...thread.querySelectorAll('article[data-testid^="conversation-turn-"]')];
  }

  getLastAssistantTurn() {
    const turns = this.getAllTurns();
    for (let i = turns.length - 1; i >= 0; i--) {
      if (this.getTurnRole(turns[i]) === 'assistant') {
        return turns[i];
      }
    }
    return null;
  }

  getTurnRole(turnEl) {
    const role = turnEl.getAttribute('data-turn');
    if (role === 'user' || role === 'assistant') return role;
    // Fallback: check inner message div
    if (turnEl.querySelector('[data-message-author-role="user"]')) return 'user';
    if (turnEl.querySelector('[data-message-author-role="assistant"]')) return 'assistant';
    return null;
  }

  getTurnContent(turnEl) {
    const role = this.getTurnRole(turnEl);
    if (role === 'assistant') {
      return turnEl.querySelector('.markdown.prose');
    }
    if (role === 'user') {
      return turnEl.querySelector('.whitespace-pre-wrap');
    }
    return null;
  }
}

window.ChatGPTAdapter = ChatGPTAdapter;
