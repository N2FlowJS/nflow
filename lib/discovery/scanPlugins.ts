// Server-side plugin scanning utilities. Not imported on the client bundle.
// Each scan loads the default export (or first named export) from package node/form entry.
// Returned maps use normalized package names (remove dashes) as keys.

import type React from 'react';

const path: typeof import('path') = require('path');
const fs: typeof import('fs') = require('fs');

function normalizeKey(pkgName: string) { return pkgName.replace(/-+/g, ''); }

export function scanNodeComponents(): Record<string, React.ComponentType<any>> {
  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, React.ComponentType<any>> = {};
  if (!fs.existsSync(pkgsDir)) return map;
  for (const dirEnt of fs.readdirSync(pkgsDir, { withFileTypes: true })) {
    if (!dirEnt.isDirectory()) continue;
    const pkg = dirEnt.name;
    if (pkg.startsWith('@')) continue;
    const nodeDir = path.join(pkgsDir, pkg, 'node');
    if (!fs.existsSync(nodeDir) || !fs.statSync(nodeDir).isDirectory()) continue;
    const files = fs.readdirSync(nodeDir).filter(f => /\.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const nodeLike = files.find(f => /-node\.(t|j)sx?$/.test(f));
    const chosen = index || nodeLike;
    if (!chosen) continue;
    try {
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
