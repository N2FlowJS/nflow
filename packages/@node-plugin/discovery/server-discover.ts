// Server-side component and form discovery
// Scans packages directory and loads React components

import type React from 'react';
import { normalizeKey } from '../../../utils/normalizeKey';

// Lazy require for server-side only
const path: typeof import('path') = (eval('require') as NodeJS.Require)('path');
const fs: typeof import('fs') = (eval('require') as NodeJS.Require)('fs');

/**
 * Scan and load all node components from packages
 * Returns a map of normalized package names to React components
 */
export function scanNodeComponents(): Record<string, React.ComponentType<any>> {
  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, React.ComponentType<any>> = {};
  
  if (!fs.existsSync(pkgsDir)) return map;

  const entries = fs.readdirSync(pkgsDir, { withFileTypes: true });
  
  for (const dirEnt of entries) {
    if (!dirEnt.isDirectory()) continue;
    
    const pkg = dirEnt.name;
    // Skip internal packages
    if (pkg.startsWith('@')) continue;

    const nodeDir = path.join(pkgsDir, pkg, 'node');
    if (!fs.existsSync(nodeDir) || !fs.statSync(nodeDir).isDirectory()) continue;

    // Find entry file
    const files = fs.readdirSync(nodeDir).filter(f => /\.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const nodeLike = files.find(f => /-node\.(t|j)sx?$/.test(f));
    const chosen = index || nodeLike;
    
    if (!chosen) continue;

    try {
      const mod = (eval('require') as NodeJS.Require)(path.join(nodeDir, chosen));
      const comp = (mod && (mod.default || Object.values(mod)[0])) as React.ComponentType<any> | undefined;
      
      if (comp) {
        map[normalizeKey(pkg)] = comp;
      }
    } catch (err) {
      // Silently ignore load errors
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[nflow] Failed to load node component for ${pkg}:`, err);
      }
    }
  }
  
  return map;
}

// Form cache to avoid re-scanning
let formCache: Record<string, React.ComponentType<any>> | null = null;

/**
 * Scan and load all node forms from packages
 * Returns a map of normalized package names to React form components
 */
export function scanNodeForms(force?: boolean): Record<string, React.ComponentType<any>> {
  if (!force && formCache) return formCache;

  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, React.ComponentType<any>> = {};
  
  if (!fs.existsSync(pkgsDir)) return map;

  const entries = fs.readdirSync(pkgsDir, { withFileTypes: true });
  
  for (const dirEnt of entries) {
    if (!dirEnt.isDirectory()) continue;
    
    const pkg = dirEnt.name;
    // Skip internal packages
    if (pkg.startsWith('@')) continue;

    const formDir = path.join(pkgsDir, pkg, 'form');
    if (!fs.existsSync(formDir) || !fs.statSync(formDir).isDirectory()) continue;

    // Find entry file
    const files = fs.readdirSync(formDir).filter(f => /\.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const chosen = index || files[0];
    
    if (!chosen) continue;

    try {
      const mod = (eval('require') as NodeJS.Require)(path.join(formDir, chosen));
      const comp = (mod && (mod.default || Object.values(mod)[0])) as React.ComponentType<any> | undefined;
      
      if (comp) {
        map[normalizeKey(pkg)] = comp;
      }
    } catch (err) {
      // Silently ignore load errors
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[nflow] Failed to load form component for ${pkg}:`, err);
      }
    }
  }
  
  formCache = map;
  return map;
}

/**
 * Invalidate the form scan cache, forcing a re-scan on next call
 */
export function invalidateFormScanCache(): void {
  formCache = null;
}

/**
 * Get both node components and forms in one call
 */
export function scanAllComponents(): {
  nodes: Record<string, React.ComponentType<any>>;
  forms: Record<string, React.ComponentType<any>>;
} {
  return {
    nodes: scanNodeComponents(),
    forms: scanNodeForms(),
  };
}
