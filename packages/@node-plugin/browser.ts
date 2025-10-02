// Browser-only exports
// Provides browser-safe stubs and UI-friendly functions

export * from './type';

// Browser-friendly exports: expose UI discovery helpers
export {
  getDiscoveredNodeComponents,
  reloadDiscoveredNodeComponents,
  getDiscoveredNodeForms,
  reloadDiscoveredNodeForms,
  getClientNodeTypes,
  getClientNodeTypeKeys,
  getClientNODE_TYPES,
  hasNodeType,
  getAllDiscoveredComponents,
} from './discovery/ui-discover';

// Browser stubs for server-only functions
export function getNodePluginConfig(): Record<string, unknown> { 
  return {}; 
}

export function getPackageNodePluginConfig(_packageName: string): undefined { 
  return undefined; 
}

export function invalidateNodePluginConfigCache(): void {
  // No-op in browser
}

/**
 * Get dynamic node type keys - browser version uses UI registry
 */
export function getDynamicNodeTypeKeys(): string[] {
  try {
    if (typeof window !== 'undefined') {
      const { getClientNodeTypeKeys } = require('./discovery/ui-discover');
      return getClientNodeTypeKeys();
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get all node type keys - browser version
 */
export function getAllNodeTypeKeys(): string[] {
  return getDynamicNodeTypeKeys();
}

// Browser stubs for scanning functions
export function scanNodeComponents(): Record<string, unknown> {
  console.warn('[nflow] scanNodeComponents not available in browser');
  return {};
}

export function scanNodeForms(): Record<string, unknown> {
  console.warn('[nflow] scanNodeForms not available in browser');
  return {};
}

export function invalidateFormScanCache(): void {
  // No-op in browser
}

export function packageExists(_packageName: string): boolean {
  console.warn('[nflow] packageExists not available in browser');
  return false;
}

export function getPackageDirectories(): string[] {
  console.warn('[nflow] getPackageDirectories not available in browser');
  return [];
}

