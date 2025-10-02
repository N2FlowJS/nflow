// Main entry point for @node-plugin package
// Smart exports based on environment (server/browser)

// Export types
export * from './type';

// Note: Adapters removed - legacy migration complete

// Export discovery functions (UI-friendly, works in browser)
export * from './discovery/ui-discover';

// Server-side exports (config loading, scanning)
export {
  getNodePluginConfig,
  getPackageNodePluginConfig,
  invalidateNodePluginConfigCache,
  type LoaderOptions,
} from './core/config-loader';

export {
  getDynamicNodeTypeKeys,
  getPackageDirectories,
  packageExists,
} from './core/package-scanner';

// Node definition loading (server)
export {
  loadAllNodeDefinitions,
  loadNodeDefinitions,
  reloadAllNodeDefinitions,
  getLoadingStats,
} from './core/definition-loader';

// Browser-safe registration
export {
  registerDefinitions,
  isDefinitionsLoaded,
} from './core/definition-loader.browser';

// Re-export server discovery if available
export {
  scanNodeComponents,
  scanNodeForms,
  invalidateFormScanCache,
  scanAllComponents,
} from './discovery/server-discover';

// Cross-env convenience functions
import { getDynamicNodeTypeKeys as serverGetKeys } from './core/package-scanner';
import { getClientNodeTypes } from './discovery/ui-discover';
import type { LoaderOptions } from './core/config-loader';

/**
 * Get all node type keys - works in both browser and server
 * Browser: uses UI registry
 * Server: uses filesystem scan
 */
export function getAllNodeTypeKeys(options?: LoaderOptions): string[] {
  // Browser
  if (typeof window !== 'undefined') {
    try {
      return Object.keys(getClientNodeTypes() as Record<string, unknown>);
    } catch {
      return [];
    }
  }
  // Server / Node
  return serverGetKeys(options);
}

/**
 * Frozen map of NODE_TYPE constants (key -> key)
 * Generated at module load time
 */
export const NODE_TYPES = Object.freeze(
  (() => {
    try {
      const keys = serverGetKeys();
      return keys.reduce((acc, k) => {
        (acc as Record<string, string>)[k] = k;
        return acc;
      }, {} as Record<string, string>);
    } catch {
      return {} as Record<string, string>;
    }
  })()
);
