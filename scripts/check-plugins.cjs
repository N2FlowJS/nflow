#!/usr/bin/env node
/* Simple plugin export checker: scans packages/* for standardized plugin exports */
const fs = require('fs');
const path = require('path');

function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

const root = process.cwd();
const packagesDir = path.join(root, 'packages');
if (!isDir(packagesDir)) {
  console.error('[check-plugins] packages directory not found');
  process.exit(1);
}

const INTERNAL_ALLOW = new Set(['@flow', '@node-plugin', '@template', '@input']);
const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
const pkgs = entries
  .filter(d => d.isDirectory())
  .map(d => d.name)
  // Only check real plugin package dirs (skip all scoped ones)
  .filter(n => !n.startsWith('@'));

const issues = [];
for (const name of pkgs) {
  const dir = path.join(packagesDir, name);
  const idx = path.join(dir, 'index.ts');
  const pkgJson = path.join(dir, 'package.json');
  const anyPluginFile = ['plugin.ts', `${name}.ts`, `${name}.tsx`].some(f => exists(path.join(dir, f)));
  const hasIndex = exists(idx);
  // Consider index.ts sufficient as an entry; it may define and export the plugin directly
  if (!anyPluginFile && !hasIndex) issues.push({ name, issue: 'missing plugin entry (index.ts or plugin.ts/<name>.ts)' });
  if (!hasIndex) issues.push({ name, issue: 'missing index.ts re-export' });
  if (!exists(pkgJson)) {
    // optional, not required inside monorepo, but useful when publishing
  }
}

if (issues.length) {
  console.log('[check-plugins] Found issues:');
  for (const it of issues) console.log(` - ${it.name}: ${it.issue}`);
  process.exitCode = 2;
} else {
  console.log('[check-plugins] All packages look standardized.');
}
