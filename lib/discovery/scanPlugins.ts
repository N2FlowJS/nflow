/* eslint-disable @typescript-eslint/no-require-imports */
// Server-side plugin scanning utilities. Not imported on the client bundle.
// Each scan loads the default export (or first named export) from package node/form entry.
// Returned maps use normalized package names (remove dashes) as keys.

import type React from 'react';

const path: typeof import('path') = (eval('require') as NodeJS.Require)('path');
const fs: typeof import('fs') = (eval('require') as NodeJS.Require)('fs');

// Debug helper: wrap path.join to log non-string args (Turbopack may replace requires with numbers)
try {
  const _origJoin = path.join.bind(path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (path as any).join = (...parts: any[]) => {
    const bad = parts.filter(p => typeof p !== 'string');
    if (bad.length) {
      try {
        console.error('[DEBUG path.join] non-string parts:', parts.map(p => ({ type: typeof p, value: p })));
        console.error(new Error('[DEBUG path.join] stack').stack);
      } catch (e) {}
    }
    return _origJoin(...parts.map(p => (typeof p === 'string' ? p : String(p))));
  };
} catch (e) {
  // ignore
}

// Normalize a package folder name to a node type key, e.g. "http-request" => "httprequest"
function normalizeKey(pkgName: string) {
  return pkgName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function scanNodeComponents(): Record<string, React.ComponentType<any>> {
  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, React.ComponentType<any>> = {};
  if (!fs.existsSync(pkgsDir)) return map;
  for (const dirEnt of fs.readdirSync(pkgsDir, { withFileTypes: true })) {
    if (!dirEnt.isDirectory()) continue;
    const pkg = dirEnt.name;
    if (pkg.startsWith('@')) continue;
    const nodeDir = path.join(pkgsDir, pkg, 'node');
    // debug
    // console.log('[scanNodeComponents] pkgsDir type:', typeof pkgsDir, 'pkg:', pkg, 'nodeDir type:', typeof nodeDir);
    if (!fs.existsSync(nodeDir) || !fs.statSync(nodeDir).isDirectory()) continue;
    const files = fs.readdirSync(nodeDir).filter(f => /\.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const nodeLike = files.find(f => /-node\.(t|j)sx?$/.test(f));
    const chosen = index || nodeLike;
    if (!chosen) continue;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = (eval('require') as NodeJS.Require)(path.join(nodeDir, chosen));
      const comp = (mod && (mod.default || Object.values(mod)[0])) as React.ComponentType<any> | undefined;
      if (comp) map[normalizeKey(pkg)] = comp;
    } catch {
      // swallow
    }
  }
  return map;
}

let formCache: Record<string, React.ComponentType<any>> | null = null;
export function scanNodeForms(force?: boolean): Record<string, React.ComponentType<any>> {
  if (!force && formCache) return formCache;
  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, React.ComponentType<any>> = {};
  if (!fs.existsSync(pkgsDir)) return map;
  for (const dirEnt of fs.readdirSync(pkgsDir, { withFileTypes: true })) {
    if (!dirEnt.isDirectory()) continue;
    const pkg = dirEnt.name;
    if (pkg.startsWith('@')) continue;
  const formDir = path.join(pkgsDir, pkg, 'form');
    if (!fs.existsSync(formDir) || !fs.statSync(formDir).isDirectory()) continue;
    const files = fs.readdirSync(formDir).filter(f => /\.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const chosen = index || files[0];
    if (!chosen) continue;
    try {
      const mod = (eval('require') as NodeJS.Require)(path.join(formDir, chosen));
      const comp = (mod && (mod.default || Object.values(mod)[0])) as React.ComponentType<any> | undefined;
      if (comp) map[normalizeKey(pkg)] = comp;
    } catch {
      // swallow
    }
  }
  formCache = map;
  return map;
}

export function invalidateFormScanCache() { formCache = null; }
