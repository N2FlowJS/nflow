// Config loading logic for node plugins
// Handles loading from .nflow.json files and package.json

import { NodePluginConfig } from '../type';
import { isNodeEnv, lazyFs, lazyPath, resolvePackagesDir, pickFirstExisting } from './utils';

const DEFAULT_CONFIG_FILENAME = '.nflow.json';
const INTERNAL_ALLOW = new Set(['@flow', '@node-plugin', '@template-processor']);

let _cache: { map: Record<string, NodePluginConfig>; ts: number } | null = null;
let _cacheKey = '';

export interface LoaderOptions {
  rootDir?: string;    // base directory (defaults to process.cwd())
  filename?: string;   // primary filename (defaults to .nflow.json)
  packagesDir?: string;// override packages folder
}

/**
 * Invalidate the plugin config cache
 */
export function invalidateNodePluginConfigCache(): void {
  _cache = null;
}

/**
 * Load node plugin configuration from all packages
 */
export function getNodePluginConfig(options?: LoaderOptions): Record<string, NodePluginConfig> {
  if (!isNodeEnv()) return {}; // never attempt on browser

  const path = lazyPath();
  const fs = lazyFs();
  if (!fs || !path) return {};
  
  const rootDir = options?.rootDir ?? process.cwd();
  const filename = options?.filename ?? DEFAULT_CONFIG_FILENAME;
  const packagesDir = options?.packagesDir || resolvePackagesDir(rootDir, fs, path);
  
  if (!packagesDir) return {};

  // Check cache
  const newKey = packagesDir + '::' + filename;
  if (_cache && _cacheKey === newKey) return _cache.map;

  // Scan packages directory
  let entries: Array<{ isDirectory?: () => boolean; name?: string }> = [];
  try {
    entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  } catch {
    return {};
  }

  const map: Record<string, NodePluginConfig> = {};
  for (const d of entries) {
    if (!d.isDirectory || !d.isDirectory()) continue;
    const pkgName = d.name ?? '';

    // Skip @ prefixed packages except internal ones
    if (pkgName.startsWith('@') && !INTERNAL_ALLOW.has(pkgName)) continue;
    
    const pkgPath = path.join(packagesDir, pkgName);
    const cfg = loadPackageConfig(pkgPath, pkgName, filename, fs, path);
    if (cfg) map[pkgName] = cfg;
  }

  _cache = { map, ts: Date.now() };
  _cacheKey = newKey;
  return map;
}

/**
 * Get config for a specific package
 */
export function getPackageNodePluginConfig(
  packageName: string, 
  options?: LoaderOptions
): NodePluginConfig | undefined {
  return getNodePluginConfig(options)[packageName];
}

/**
 * Load configuration for a single package
 */
function loadPackageConfig(
  pkgPath: string,
  pkgName: string,
  filename: string,
  fs: typeof import('fs'),
  path: typeof import('path')
): NodePluginConfig | null {
  // Try dedicated config file first
  const configPath = pickFirstExisting(
    [
      path.join(pkgPath, filename),
      path.join(pkgPath, `${pkgName}.nflow.json`)
    ],
    fs
  );

  let fileCfg: NodePluginConfig | null = null;
  if (configPath) {
    fileCfg = readAndNormalizeFile(configPath, fs);
  }

  // Fallback to package.json nflow field
  let pkgCfg: NodePluginConfig | null = null;
  if (!fileCfg) {
    const packageJsonPath = path.join(pkgPath, 'package.json');
    try {
      if (fs.existsSync(packageJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkgJson && typeof pkgJson.nflow === 'object') {
          pkgCfg = normalizeConfigShape(pkgJson.nflow);
        }
      }
    } catch {
      /* ignore */
    }
  }
  
  return mergeConfigs(pkgCfg, fileCfg);
}

/**
 * Read and parse a config file
 */
function readAndNormalizeFile(
  file: string, 
  fs: typeof import('fs')
): NodePluginConfig | null {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return normalizeConfigShape(JSON.parse(raw));
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[nflow] Failed to read config file:', file, err);
    }
    return null;
  }
}

/**
 * Normalize config shape and handle backward compatibility
 */
function normalizeConfigShape(obj: unknown): NodePluginConfig | null {
  if (!obj || typeof obj !== 'object') return null;
  
  const json: NodePluginConfig = { ...(obj as Record<string, unknown>) };
  
  // Backward compat: sort -> order
  if (json.order == null && typeof (json as Record<string, unknown>).sort === 'number') {
    json.order = (json as Record<string, unknown>).sort as number;
  }
  
  return json;
}

/**
 * Merge two config objects with override precedence
 */
function mergeConfigs(
  base?: NodePluginConfig | null, 
  override?: NodePluginConfig | null
): NodePluginConfig | null {
  if (!base && !override) return null;
  if (!base) return override ? { ...override } : null;
  if (!override) return { ...base };
  return { ...base, ...override };
}
