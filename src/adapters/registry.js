/**
 * AdapterRegistry - Matches the current site to the correct LLMAdapter
 */
class AdapterRegistry {
  constructor() {
    this._adapters = [];
  }

  /**
   * Register an adapter class
   * @param {typeof LLMAdapter} AdapterClass
   */
  register(AdapterClass) {
    this._adapters.push(AdapterClass);
  }

  /**
   * Find the matching adapter for the current hostname
   * @returns {LLMAdapter|null}
   */
  match() {
    const hostname = window.location.hostname;
    for (const AdapterClass of this._adapters) {
      if (AdapterClass.hostnames.includes(hostname)) {
        console.log(`[NIKKE] Adapter matched: ${AdapterClass.name} for ${hostname}`);
        return new AdapterClass();
      }
    }
    console.log(`[NIKKE] No adapter found for ${hostname}`);
    return null;
  }
}

// Create global registry and register known adapters
const adapterRegistry = new AdapterRegistry();
adapterRegistry.register(ChatGPTAdapter);

window.AdapterRegistry = AdapterRegistry;
window.adapterRegistry = adapterRegistry;
