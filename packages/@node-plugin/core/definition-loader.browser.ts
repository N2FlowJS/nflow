/**
 * BROWSER-SAFE NODE DEFINITION LOADER
 * 
 * Browser version that loads from pre-bundled modules.
 * Works with Webpack/Next.js module system.
 */

import { NodeDefinition } from '../type';
import { NodeRegistry } from '../../@flow/node-registry';

/**
 * Browser-safe definition registration
 * Requires manual imports but works without filesystem
 */
export function registerDefinitions(...definitions: NodeDefinition<any>[]): void {
  console.log(`[NodePluginLoader:Browser] Registering ${definitions.length} definitions...`);
  
  definitions.forEach(def => {
    NodeRegistry.register(def);
  });

  console.log(`[NodePluginLoader:Browser] ✅ Registered ${definitions.length} definitions`);
}

/**
 * Browser-safe helper to check if definitions are loaded
 */
export function isDefinitionsLoaded(): boolean {
  return NodeRegistry.size > 0;
}

/**
 * Get loading stats (browser version)
 */
export function getLoadingStats(): { registered: number; categories: Record<string, number> } {
  const all = NodeRegistry.getAll();
  const categories: Record<string, number> = {};

  all.forEach(def => {
    const cat = def.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return {
    registered: NodeRegistry.size,
    categories,
  };
}

// Export a no-op for browser compatibility
export async function loadAllNodeDefinitions(): Promise<void> {
  console.warn('[NodePluginLoader:Browser] Auto-discovery not available in browser. Use registerDefinitions() instead.');
}

export default registerDefinitions;
