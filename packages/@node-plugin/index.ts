export * from './type';
import * as fs from 'fs';
import * as path from 'path';
import { LoaderOptions, NodePluginConfig, NodePluginConfigMap } from './type';


const DEFAULT_CONFIG_FILENAME = '.nflow.json';

export function getNodePluginConfig(options?: LoaderOptions): NodePluginConfigMap {
  const rootDir = options?.rootDir ?? process.cwd();
  const filename = options?.filename ?? DEFAULT_CONFIG_FILENAME;

  // Resolve packages directory (direct or by walking up)
  const packagesDir =
    options?.packagesDir || resolvePackagesDir(rootDir);
  if (!packagesDir) return {};

  let dirEntries: fs.Dirent[];
  try {
    dirEntries = fs.readdirSync(packagesDir, { withFileTypes: true });
  } catch {
    return {};
  }

  const result: NodePluginConfigMap = {};
  for (const d of dirEntries) {
    if (!d.isDirectory()) continue;
    const pkgName = d.name;
    const pkgPath = path.join(packagesDir, pkgName);
    const configPath = pickFirstExisting([
      path.join(pkgPath, filename),
      path.join(pkgPath, `${pkgName}.nflow.json`),
    ]);
    if (!configPath) continue;

    const cfg = readAndNormalizeConfig(configPath);
    if (cfg) result[pkgName] = cfg;
  }
  return result;
}

export function getPackageNodePluginConfig(packageName: string, options?: LoaderOptions) {
  return getNodePluginConfig(options)[packageName];
}


function resolvePackagesDir(base: string): string | null {
  const direct = path.join(base, 'packages');
  if (isDir(direct)) return direct;
  // walk upward
  let current = path.resolve(base);
  const root = path.parse(current).root;
  while (current !== root) {
    const candidate = path.join(current, 'packages');
    if (isDir(candidate)) return candidate;
    current = path.dirname(current);
  }
  return null;
}

function isDir(p: string): boolean {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function pickFirstExisting(paths: string[]): string | null {
  for (const p of paths) if (fs.existsSync(p)) return p; return null;
}

function readAndNormalizeConfig(file: string): NodePluginConfig | null {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const json: NodePluginConfig = JSON.parse(raw);
    if (json && typeof json === 'object' && json.order == null && typeof json.sort === 'number') {
      json.order = json.sort;
    }
    return json;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[nflow] Failed to read ${file}:`, err);
    }
    return null;
  }
}
