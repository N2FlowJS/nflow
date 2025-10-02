/**
 * NODE PLUGIN LOADER
 * 
 * Automatically discover and load all node definitions from packages.
 * Integrates with @node-plugin architecture for auto-discovery.
 * 
 * This replaces manual registration in init-nodes.ts with automatic scanning.
 */

import { NodeDefinition } from '../type';
import { NodeRegistry } from '../../@flow/node-registry';
import { getPackageNodePluginConfig, type LoaderOptions } from './config-loader';
import { getDynamicNodeTypeKeys } from './package-scanner';

/**
 * Load a single node definition from a package
 */
async function loadNodeDefinition(packageName: string): Promise<NodeDefinition<any> | null> {
  try {
    // Try to import definition.ts from package
    const definitionModule = await import(`../../${packageName}/definition`);
    const definition = definitionModule.default || definitionModule[`${toCamelCase(packageName)}NodeDefinition`];
    
    if (!definition) {
      console.warn(`[NodePluginLoader] No definition found in package: ${packageName}`);
      return null;
    }

    if (!definition.id || !definition.name) {
      console.warn(`[NodePluginLoader] Invalid definition in package: ${packageName}`);
      return null;
    }

    return definition;
  } catch (error) {
    // Not all packages have definition.ts yet - this is ok
    console.debug(`[NodePluginLoader] No definition.ts in ${packageName}:`, error instanceof Error ? error.message : '');
    return null;
  }
}

/**
 * Convert package name to camelCase
 * e.g., 'http-request' -> 'HttpRequest'
 */
function toCamelCase(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if a package should be loaded
 */
function shouldLoadPackage(packageName: string, options?: LoaderOptions): boolean {
  // Skip internal packages (they don't have node definitions)
  if (packageName.startsWith('@')) {
    return false;
  }

  // Check if package is enabled in .nflow.json config
  const config = getPackageNodePluginConfig(packageName, options);
  if (config?.enabled === false) {
    console.log(`[NodePluginLoader] Skipping disabled package: ${packageName}`);
    return false;
  }

  return true;
}

/**
 * Auto-discover and load all node definitions
 * 
 * This function:
 * 1. Scans packages/ directory using @node-plugin
 * 2. Loads definition.ts from each package
 * 3. Registers with NodeRegistry
 * 4. Respects .nflow.json config (enabled/disabled)
 */
export async function loadAllNodeDefinitions(options?: LoaderOptions): Promise<void> {
  console.log('[NodePluginLoader] Starting auto-discovery...');

  // Get all package names using @node-plugin scanner
  const packageNames = getDynamicNodeTypeKeys(options);
  
  if (packageNames.length === 0) {
    console.warn('[NodePluginLoader] No packages found in packages/ directory');
    return;
  }

  console.log(`[NodePluginLoader] Found ${packageNames.length} packages to scan`);

  let loaded = 0;
  let skipped = 0;
  let failed = 0;

  // Load definitions in parallel
  const results = await Promise.allSettled(
    packageNames.map(async (packageName: string) => {
      // Check if should load
      if (!shouldLoadPackage(packageName, options)) {
        skipped++;
        return null;
      }

      // Load definition
      const definition = await loadNodeDefinition(packageName);
      
      if (definition) {
        // Register with NodeRegistry
        NodeRegistry.register(definition);
        loaded++;
        return definition;
      }
      
      return null;
    })
  );

  // Count failures
  failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

  console.log(`[NodePluginLoader] ✅ Loaded: ${loaded} | ⏭️ Skipped: ${skipped} | ❌ Failed: ${failed}`);
  console.log(`[NodePluginLoader] NodeRegistry now has ${NodeRegistry.size} definitions`);
}

/**
 * Load node definitions for specific packages
 */
export async function loadNodeDefinitions(packageNames: string[], options?: LoaderOptions): Promise<void> {
  console.log(`[NodePluginLoader] Loading ${packageNames.length} specific packages...`);

  const results = await Promise.allSettled(
    packageNames.map(async (packageName) => {
      if (!shouldLoadPackage(packageName, options)) {
        return null;
      }

      const definition = await loadNodeDefinition(packageName);
      if (definition) {
        NodeRegistry.register(definition);
        return definition;
      }
      return null;
    })
  );

  const loaded = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  console.log(`[NodePluginLoader] ✅ Loaded ${loaded}/${packageNames.length} packages`);
}

/**
 * Reload all node definitions (clears registry first)
 */
export async function reloadAllNodeDefinitions(options?: LoaderOptions): Promise<void> {
  console.log('[NodePluginLoader] Reloading all definitions...');
  NodeRegistry.clear();
  await loadAllNodeDefinitions(options);
}

/**
 * Get loading statistics
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

export default loadAllNodeDefinitions;
