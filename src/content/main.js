/**
 * Main entry point - initializes the NIKKE theme extension
 */
(function () {
  'use strict';

  // Match adapter for current site
  const adapter = adapterRegistry.match();

  if (!adapter) {
    console.log('[NIKKE] No adapter for this site. Extension inactive.');
    return;
  }

  console.log(`[NIKKE] Adapter loaded: ${adapter.name}`);

  // Wait for thread container to appear (SPA navigation)
  function waitForReady(callback, maxAttempts = 30) {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (adapter.isReady()) {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 500);
      } else {
        console.log('[NIKKE] Thread container not found after timeout');
      }
    };
    check();
  }

  waitForReady(() => {
    console.log('[NIKKE] Thread container found. Initializing UI.');

    const chattingMode = new ChattingMode();
    const vnMode = new VNMode(adapter);

    const toggle = new ToggleUI();
    toggle.init((mode) => {
      console.log(`[NIKKE] Mode changed to: ${mode}`);

      // Deactivate all first
      chattingMode.deactivate();
      vnMode.deactivate();

      if (mode === 'chatting') {
        chattingMode.activate();
      } else if (mode === 'vn') {
        vnMode.activate();
      }
    });

    // Store globally for other modules
    window.nikkeAdapter = adapter;
    window.nikkeChattingMode = chattingMode;
    window.nikkeVNMode = vnMode;

    // Debug: log current thread state
    const turns = adapter.getAllTurns();
    console.log(`[NIKKE] Found ${turns.length} conversation turns`);
  });
})();
