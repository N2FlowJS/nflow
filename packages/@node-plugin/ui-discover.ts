// Runtime UI node component discovery (server-side). Client expects injected global.
// Avoid static fs/path imports in environments without Node APIs.

export function getDiscoveredNodeComponents(): Record<string, any> {
  if (typeof window !== 'undefined') {
    return (window as any).__NFLOW_NODE_COMPONENTS__ || {};
  }
  // Lazy require to keep bundlers happy
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs: typeof import('fs') = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path: typeof import('path') = require('path');
  const pkgsDir = path.join(process.cwd(), 'packages');
  const map: Record<string, any> = {};
  if (!fs.existsSync(pkgsDir)) return map;
  for (const dirEnt of fs.readdirSync(pkgsDir, { withFileTypes: true })) {
    if (!dirEnt.isDirectory()) continue;
    const pkg = dirEnt.name;
    if (pkg.startsWith('@')) continue; // skip internal scoped dirs
    const nodeDir = path.join(pkgsDir, pkg, 'node');
    if (!fs.existsSync(nodeDir) || !fs.statSync(nodeDir).isDirectory()) continue;
    const files = fs.readdirSync(nodeDir).filter(f => /.(t|j)sx?$/.test(f));
    const index = files.find(f => /^index\.(t|j)sx?$/.test(f));
    const nodeLike = files.find(f => /-node\.(t|j)sx?$/.test(f));
    const chosen = index || nodeLike;
    if (!chosen) continue;
    const abs = path.join(nodeDir, chosen);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(abs);
      const comp = mod.default || Object.values(mod)[0];
      if (comp) map[pkg.replace(/-+/g, '')] = comp;
    } catch {
      // ignore
    }
  }
  return map;
}

export function reloadDiscoveredNodeComponents() {
  // Simply rebuild each call (small cost acceptable); could add cache var if needed.
  return getDiscoveredNodeComponents();
}
