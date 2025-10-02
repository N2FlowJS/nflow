// Package discovery and scanning utilities
// Handles finding and listing node plugin packages

import { isNodeEnv, lazyFs, lazyPath, resolvePackagesDir } from './utils';
import { LoaderOptions } from './config-loader';

const INTERNAL_ALLOW = new Set(['@flow', '@node-plugin', '@template-processor']);

/**
 * Build a dynamic set of node type keys from installed packages (server-only).
 * Returns raw package folder names like "http-request", "begin", etc.
 */
export function getDynamicNodeTypeKeys(options?: LoaderOptions): string[] {
  if (!isNodeEnv()) return [];

  const path = lazyPath();
  const fs = lazyFs();
  if (!fs || !path) return [];

  const rootDir = options?.rootDir ?? process.cwd();
  const packagesDir = options?.packagesDir || resolvePackagesDir(rootDir, fs, path);
  if (!packagesDir) return [];

  try {
    const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
    const names = entries
      .filter((d) => d.isDirectory?.())
      .map((d) => d.name)
      .filter((n: string) => !n.startsWith('@') || INTERNAL_ALLOW.has(n));
    
    return names;
  } catch {
    return [];
  }
}

/**
 * Get list of package directories in the packages folder
 */
export function getPackageDirectories(options?: LoaderOptions): string[] {
  return getDynamicNodeTypeKeys(options);
}

/**
 * Check if a package exists in the packages directory
 */
export function packageExists(packageName: string, options?: LoaderOptions): boolean {
  const packages = getDynamicNodeTypeKeys(options);
  return packages.includes(packageName);
}
