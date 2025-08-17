export * from './type';
export * from './discovery/ui-discover';
import { LoaderOptions, NodePluginConfig, NodePluginConfigMap } from './type';

// NOTE: Keep this file server-safe. We lazily require fs/path so accidental client import stays light.
// A dedicated browser stub (browser.ts) already exports empty impls; prefer importing that on client.

const DEFAULT_CONFIG_FILENAME = '.nflow.json';
const INTERNAL_ALLOW = new Set(['@flow', '@node-plugin', '@template-processor']);

// In‑memory cache (invalidated manually) to avoid repeated disk scans per request.
let _cache: { map: NodePluginConfigMap; ts: number } | null = null;
let _cacheKey = '';

function isNodeEnv() {
  return typeof process !== 'undefined' && !!(process.versions && process.versions.node);
}

function lazyFs() {
  if (!isNodeEnv()) return null as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('fs') as typeof import('fs');
}
function lazyPath() {
  if (!isNodeEnv()) return null as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('path') as typeof import('path');
}

export function invalidateNodePluginConfigCache() { _cache = null; }

export function getNodePluginConfig(options?: LoaderOptions): NodePluginConfigMap {
  if (!isNodeEnv()) return {}; // never attempt on browser

  const path = lazyPath();
  const fs = lazyFs();
  const rootDir = options?.rootDir ?? process.cwd();
  const filename = options?.filename ?? DEFAULT_CONFIG_FILENAME;
  const packagesDir = options?.packagesDir || resolvePackagesDir(rootDir, fs, path);
  if (!packagesDir) return {};

  const newKey = packagesDir + '::' + filename;
  if (_cache && _cacheKey === newKey) return _cache.map; // simple cache

  let entries: any[] = [];
  try { entries = fs.readdirSync(packagesDir, { withFileTypes: true }); } catch { return {}; }

  const map: NodePluginConfigMap = {};
  for (const d of entries) {
    if (!d.isDirectory?.()) continue;
    const pkgName = d.name;
    if (pkgName.startsWith('@') && !INTERNAL_ALLOW.has(pkgName)) continue;
    const pkgPath = path.join(packagesDir, pkgName);
    const cfg = loadPackageConfig(pkgPath, pkgName, filename, fs, path);
    if (cfg) map[pkgName] = cfg;
  }

  _cache = { map, ts: Date.now() }; _cacheKey = newKey;
  return map;
}

export function getPackageNodePluginConfig(packageName: string, options?: LoaderOptions) {
  return getNodePluginConfig(options)[packageName];
}

// ---------------- internal helpers ----------------
function resolvePackagesDir(base: string, fs: typeof import('fs'), path: typeof import('path')): string | null {
  const direct = path.join(base, 'packages');
  if (isDir(direct, fs)) return direct;
  let current = path.resolve(base);
  const root = path.parse(current).root;
  while (current !== root) {
    const candidate = path.join(current, 'packages');
    if (isDir(candidate, fs)) return candidate;
    current = path.dirname(current);
  }
  return null;
}

function isDir(p: string, fs: typeof import('fs')) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function pickFirstExisting(paths: string[], fs: typeof import('fs')) { for (const p of paths) if (fs.existsSync(p)) return p; return null; }

function loadPackageConfig(pkgPath: string, pkgName: string, filename: string, fs: typeof import('fs'), path: typeof import('path')): NodePluginConfig | null {
  const configPath = pickFirstExisting([
    path.join(pkgPath, filename),
    path.join(pkgPath, `${pkgName}.nflow.json`),
  ], fs);

  let fileCfg: NodePluginConfig | null = null;
  if (configPath) fileCfg = readAndNormalizeFile(configPath, fs);

  // fallback to package.json field
  let pkgCfg: NodePluginConfig | null = null;
  if (!fileCfg) {
    const packageJsonPath = path.join(pkgPath, 'package.json');
    try {
      if (fs.existsSync(packageJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkgJson && typeof pkgJson.nflow === 'object') pkgCfg = normalizeConfigShape(pkgJson.nflow);
      }
    } catch { /* ignore */ }
  }
  return mergeConfigs(pkgCfg, fileCfg);
}

function readAndNormalizeFile(file: string, fs: typeof import('fs')): NodePluginConfig | null {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return normalizeConfigShape(JSON.parse(raw));
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn('[nflow] Failed to read', file, err);
    return null;
  }
}

function normalizeConfigShape(obj: any): NodePluginConfig | null {
  if (!obj || typeof obj !== 'object') return null;
  const json: NodePluginConfig = { ...obj };
  // backward compat: sort -> order
  if (json.order == null && typeof (json as any).sort === 'number') json.order = (json as any).sort;
  return json;
}

function mergeConfigs(base?: NodePluginConfig | null, override?: NodePluginConfig | null): NodePluginConfig | null {
  if (!base && !override) return null;
  if (!base) return override ? { ...override } : null;
  if (!override) return { ...base };
  return { ...base, ...override };
}

// Export internals for potential advanced usages (debug / tooling)
export const _internalNodePlugin = {
  invalidateNodePluginConfigCache,
  normalizeConfigShape,
  mergeConfigs,
};
