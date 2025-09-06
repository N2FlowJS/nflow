import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { NodePlugin } from '../../../packages/@node-plugin/type';
import { getNodePluginConfig } from '../../../packages/@node-plugin';
import { ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow/type';

const BUILTIN_PLUGINS: NodePlugin[] = [];
let PLUGINS: NodePlugin[] = [];

// In dev/test, allow requiring TypeScript files directly (without per-package build)
let _tsNodeRegistered = false;
function ensureTsSupport() {
  if (_tsNodeRegistered) return;
  try {
    // Prefer transpile-only for speed and avoid type-check cost at runtime.
    // Explicitly set JSX transform so TSX in shared libs (@flow) compiles for Node.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tsNode = require('ts-node');
    tsNode.register({
      transpileOnly: true,
      compilerOptions: {
        jsx: 'react-jsx',
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
      },
    });
    // Respect tsconfig "paths" so imports like @n2flowjs/template/* work in Node
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('tsconfig-paths/register');
    } catch {
      /* optional: tsconfig-paths may not be present */
    }
    _tsNodeRegistered = true;
    if (process.env.NODE_ENV !== 'production') console.log('[nflow] ts-node register enabled for plugin loading');
  } catch {
    // ts-node may not be installed in some environments; ignore and try .js files
  }
}

// Helper: type guard to identify a NodePlugin-like object
function isNodePlugin(obj: any): obj is NodePlugin {
  return !!obj && typeof obj.name === 'string' && typeof obj.match === 'function' && typeof obj.run === 'function';
}

// Attempt to require a package module and find a NodePlugin export.
function tryLoadPluginForPackage(pkgName: string): NodePlugin | null {
  // Resolve from repo root to avoid fragile relative paths
  const _req = (eval('require') as NodeJS.Require);
  const _path = _req('path') as typeof import('path');
  const _fs = _req('fs') as typeof import('fs');
  const abs = _path.join(process.cwd(), 'packages', pkgName);

  // In dev, register ts-node so we can require .ts files
  if (process.env.NODE_ENV !== 'production') ensureTsSupport();

  const tryPaths: string[] = [];
  // Try the directory directly (in case it has a resolvable index.js)
  tryPaths.push(abs);
  // Common entry files
  const bases = ['index', 'plugin'];
  const exts = ['.js', '.ts', '.mjs', '.cjs', '.tsx'];
  for (const b of bases) {
    const basePath = _path.join(abs, b);
    tryPaths.push(basePath);
    for (const ext of exts) tryPaths.push(basePath + ext);
  }

  let lastErr: any = null;
  for (const p of tryPaths) {
    try {
      // If path ends with no extension and is a directory, emulate Node's index resolution for .ts as well
      const statOk = (() => {
        try { return _fs.statSync(p); } catch { return null; }
      })();
      if (statOk?.isDirectory?.()) {
        for (const file of bases) {
          for (const ext of exts) {
            const candidate = _path.join(p, file + ext);
            if (_fs.existsSync(candidate)) {
              const mod = _req(candidate);
              const plg = pickNodePluginFromModule(mod);
              if (plg) return plg;
            }
          }
        }
        // Also try plain index.js if present
        const idxJs = _path.join(p, 'index.js');
        if (_fs.existsSync(idxJs)) {
          const mod = _req(idxJs);
          const plg = pickNodePluginFromModule(mod);
          if (plg) return plg;
        }
        continue;
      }

      // If file exists (with or without extension), require it directly
      if (_fs.existsSync(p) || exts.some((ext) => _fs.existsSync(p + ext))) {
        const target = _fs.existsSync(p) ? p : (exts.map((e) => p + e).find((f) => _fs.existsSync(f)) as string);
        const mod = _req(target);
        const plg = pickNodePluginFromModule(mod);
        if (plg) return plg;
      }
    } catch (err) {
      lastErr = err;
      // keep trying other paths
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (lastErr) console.warn(`[nflow] Failed to load plugin package '${pkgName}':`, lastErr);
    else console.warn(`[nflow] No loadable module found for package directory '${abs}'.`);
  }
  return null;
}

function pickNodePluginFromModule(mod: any): NodePlugin | null {
  if (!mod) return null;
  const candidates: any[] = [];
  if (mod.plugin) candidates.push(mod.plugin);
  if (mod.default) candidates.push(mod.default);
  for (const k of Object.keys(mod)) candidates.push(mod[k]);
  for (const c of candidates) if (isNodePlugin(c)) return c as NodePlugin;
  return null;
}

// Auto-register plugins based on configuration discovery
function autoRegisterConfiguredPlugins() {
  const cfgMap = getNodePluginConfig() as Record<string, any>;
  for (const pkgName of Object.keys(cfgMap)) {
    // Skip internal scoped packages (not executors)
    if (pkgName.startsWith('@')) continue;
    const cfg = cfgMap[pkgName];
    if (cfg?.enabled === false) continue; // skip disabled
    const loaded = tryLoadPluginForPackage(pkgName);
    if (loaded) registerNodePlugin(loaded);
    else if (process.env.NODE_ENV !== 'production') console.warn(`[nflow] No NodePlugin export found in package '${pkgName}'.`);
  }
}

function buildPlugins(): NodePlugin[] {
  const cfgMap = getNodePluginConfig() as Record<string, any>;
  
  return BUILTIN_PLUGINS.map((p, idx) => {
    const cfg = cfgMap[p.name];
    const enabled = cfg?.enabled !== false; // default true
    const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
    return { p, enabled, order, idx };
  })
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order || a.idx - b.idx)
    .map((m) => m.p);
}

export function registerNodePlugin(plugin: NodePlugin) {
  if (BUILTIN_PLUGINS.some((p) => p.name === plugin.name)) return;
  BUILTIN_PLUGINS.push(plugin);
  // Keep PLUGINS in sync without forcing full reload cost for entire map.
  const cfgMap = getNodePluginConfig() as Record<string, any>;
  const cfg = cfgMap[plugin.name];
  if (cfg?.enabled === false) return; // skip disabled
  const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
  // Insert maintaining order (rare operation, O(n) ok)
  let inserted = false;
  for (let i = 0; i < PLUGINS.length; i++) {
    const existingCfg = cfgMap[PLUGINS[i].name];
    const existingOrder = typeof existingCfg?.order === 'number' ? existingCfg.order : Number.MAX_SAFE_INTEGER;
    if (order < existingOrder) {
      PLUGINS.splice(i, 0, plugin);
      inserted = true;
      break;
    }
  }
  if (!inserted) PLUGINS.push(plugin);
}

export function registerNodePlugins(plugins: NodePlugin[]) {
  plugins.forEach(registerNodePlugin);
}

export function reloadNodePlugins() {
  console.log('Reloading node plugins...');

  PLUGINS = buildPlugins();
  if (process.env.NODE_ENV !== 'production') {
    console.log('Loaded node plugins:', PLUGINS.map((p) => p.name));
    console.log(`Total ${PLUGINS.length} node plugins loaded.`);
  }
}

// Perform initial auto-registration and then build the ordered plugin list
autoRegisterConfiguredPlugins();
reloadNodePlugins();

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const plugin = PLUGINS.find((p) => {
    try {
      return p.match(node);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[nflow] plugin '${p.name}' match() threw:`, err);
      }
      return false;
    }
  });
  if (!plugin) throw new Error(`Unsupported node type: ${node.type}`);
  return await plugin.run(node, context, callback, dispatcher);
}
