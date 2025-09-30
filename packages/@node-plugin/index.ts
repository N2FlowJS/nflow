export * from './type';
export * from './discovery/ui-discover';
import { getClientNodeTypes } from './discovery/ui-discover';
import { LoaderOptions, NodePluginConfig, NodePluginConfigMap } from './type';

const DEFAULT_CONFIG_FILENAME = '.nflow.json';
const INTERNAL_ALLOW = new Set(['@flow', '@node-plugin', '@template-processor']);

let _cache: { map: NodePluginConfigMap; ts: number } | null = null;
let _cacheKey = '';

function isNodeEnv() {
  return typeof process !== 'undefined' && !!(process.versions && process.versions.node);
}

function lazyFs(): typeof import('fs') | null {
  if (!isNodeEnv()) return null;
  return require('fs');
}
function lazyPath(): typeof import('path') | null {
  if (!isNodeEnv()) return null;
  return require('path');
}

export function invalidateNodePluginConfigCache() {
  _cache = null;
}

export function getNodePluginConfig(options?: LoaderOptions): NodePluginConfigMap {
  if (!isNodeEnv()) return {}; // never attempt on browser

  const path = lazyPath();
  const fs = lazyFs();
  if (!fs || !path) return {};
  const rootDir = options?.rootDir ?? process.cwd();
  const filename = options?.filename ?? DEFAULT_CONFIG_FILENAME;
  const packagesDir = options?.packagesDir || resolvePackagesDir(rootDir, fs, path);
  if (!packagesDir) return {};

  const newKey = packagesDir + '::' + filename;
  if (_cache && _cacheKey === newKey) return _cache.map; // simple cache

  let entries: Array<{ isDirectory?: () => boolean; name?: string }> = [];
  try {
    entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  } catch {
    return {};
  }

  const map: NodePluginConfigMap = {};
  for (const d of entries) {
    if (!d.isDirectory || !d.isDirectory()) continue;
    const pkgName = d.name ?? '';
    console.log('Found package:', pkgName);

    if (pkgName.startsWith('@') && !INTERNAL_ALLOW.has(pkgName)) continue;
    const pkgPath = path.join(packagesDir, pkgName);
    const cfg = loadPackageConfig(pkgPath, pkgName, filename, fs, path);
    if (cfg) map[pkgName] = cfg;
  }

  _cache = { map, ts: Date.now() };
  _cacheKey = newKey;
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

function isDir(p: string, fs: typeof import('fs')) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function pickFirstExisting(paths: string[], fs: typeof import('fs')) {
  for (const p of paths) if (fs.existsSync(p)) return p;
  return null;
}

function loadPackageConfig(
  pkgPath: string,
  pkgName: string,
  filename: string,
  fs: typeof import('fs'),
  path: typeof import('path')
): NodePluginConfig | null {
  const configPath = pickFirstExisting([path.join(pkgPath, filename), path.join(pkgPath, `${pkgName}.nflow.json`)], fs);

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
    } catch {
      /* ignore */
    }
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

function normalizeConfigShape(obj: unknown): NodePluginConfig | null {
  if (!obj || typeof obj !== 'object') return null;
  const json: NodePluginConfig = { ...(obj as Record<string, unknown>) };
  // backward compat: sort -> order
  if (json.order == null && typeof (json as Record<string, unknown>).sort === 'number') json.order = (json as Record<string, unknown>).sort as number;
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

// Build a dynamic set of node type keys from installed packages (server-only).
// We transform package folder names like "http-request" => type key "httprequest".
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
    const names = entries.filter((d) => d.isDirectory?.()).map((d) => d.name);
    return names.filter((n: string) => !n.startsWith('@') || INTERNAL_ALLOW.has(n)).map((n: string) => n);
  } catch {
    return [];
  }
}

// Cross-env convenience: get node type keys on client (via UI registry) or server (via FS scan)
export function getAllNodeTypeKeys(options?: LoaderOptions): string[] {
  // Browser
  if (typeof window !== 'undefined') {
    try {
      return Object.keys(getClientNodeTypes() as Record<string, unknown>);
    } catch {
      return [];
    }
  }
  // Server / Node
  return getDynamicNodeTypeKeys(options);
}
