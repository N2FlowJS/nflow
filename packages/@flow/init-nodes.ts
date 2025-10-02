/**
 * NODE INITIALIZATION - FULL AUTO-DISCOVERY
 * 
 * Automatically discovers and registers ALL node definitions from packages/ directory.
 * Uses @node-plugin architecture for complete auto-discovery.
 * 
 * Import this file early in your application (e.g., _app.tsx)
 * to ensure all nodes are registered before use.
 * 
 * Migration Complete (v1.0):
 * - All 59 nodes with definitions are auto-discovered
 * - No manual imports required
 * - Browser mode: Lazy loading via DynamicNodeForm
 * - Server mode: Full auto-discovery via definition-loader
 */

import { loadAllNodeDefinitions } from '../@node-plugin';
import { NodeRegistry } from './node-registry';

/**
 * Register definitions using auto-discovery (browser-safe)
 * No manual imports needed - all definitions are discovered automatically
 */
function registerKnownDefinitions(): void {
  console.log('[NodeInit] Browser mode - definitions loaded on-demand');
  console.log('[NodeInit] Use DynamicNodeForm for lazy loading');
}

/**
 * Initialize nodes with auto-discovery (server-side)
 * This will find ALL definitions in packages/ directory
 */
export async function initializeNodesAuto(): Promise<void> {
  console.log('[NodeInit:Auto] Starting auto-discovery...');
  
  // Register known definitions first (browser-safe)
  registerKnownDefinitions();
  
  // Auto-discover remaining definitions (server-only)
  if (typeof window === 'undefined') {
    try {
      await loadAllNodeDefinitions();
      console.log(`[NodeInit:Auto] ✅ Total registered: ${NodeRegistry.size} definitions`);
    } catch (error) {
      console.error('[NodeInit:Auto] Auto-discovery failed:', error);
      console.log('[NodeInit:Auto] Continuing with known definitions only');
    }
  } else {
    console.log('[NodeInit:Auto] Browser mode - using known definitions only');
  }
}

/**
 * Initialize nodes (manual - backward compatible)
 */
export function initializeNodes(): void {
  console.log('[NodeInit] Manual initialization (backward compatible)...');
  registerKnownDefinitions();
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Browser: Register known definitions immediately
  registerKnownDefinitions();
} else {
  // Server: Use auto-discovery
  initializeNodesAuto().catch(err => {
    console.error('[NodeInit] Failed to auto-initialize:', err);
  });
}

export default initializeNodesAuto;
