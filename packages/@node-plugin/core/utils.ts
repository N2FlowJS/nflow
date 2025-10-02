// File system utilities for server-side operations
// Only used in Node.js environment

export function isNodeEnv(): boolean {
  return typeof process !== 'undefined' && !!(process.versions && process.versions.node);
}

export function lazyFs(): typeof import('fs') | null {
  if (!isNodeEnv()) return null;
  return require('fs');
}

export function lazyPath(): typeof import('path') | null {
  if (!isNodeEnv()) return null;
  return require('path');
}

export function isDir(p: string, fs: typeof import('fs')): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function pickFirstExisting(paths: string[], fs: typeof import('fs')): string | null {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Resolve the packages directory by searching up from base
 */
export function resolvePackagesDir(
  base: string, 
  fs: typeof import('fs'), 
  path: typeof import('path')
): string | null {
  // Try direct path first
  const direct = path.join(base, 'packages');
  if (isDir(direct, fs)) return direct;
  
  // Walk up the directory tree
  let current = path.resolve(base);
  const root = path.parse(current).root;
  
  while (current !== root) {
    const candidate = path.join(current, 'packages');
    if (isDir(candidate, fs)) return candidate;
    current = path.dirname(current);
  }
  
  return null;
}
