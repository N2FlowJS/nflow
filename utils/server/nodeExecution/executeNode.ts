import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { NodePlugin } from '../../../packages/@node-plugin/type';
import { getNodePluginConfig } from '../../../packages/@node-plugin';
import { ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow/type';

const BUILTIN_PLUGINS: NodePlugin[] = [];
let PLUGINS: NodePlugin[] = [];

// Helper: type guard to identify a NodePlugin-like object
function isNodePlugin(obj: any): obj is NodePlugin {
  return !!obj && typeof obj.name === 'string' && typeof obj.match === 'function' && typeof obj.run === 'function';
}

// Attempt to require a package module and find a NodePlugin export.
function tryLoadPluginForPackage(pkgName: string): NodePlugin | null {
  try {
  // Resolve from repo root to avoid fragile relative paths
  const _req = (eval('require') as NodeJS.Require);
  const _path = _req('path') as typeof import('path');
  const abs = _path.join(process.cwd(), 'packages', pkgName);
  const mod = _req(abs);
    const candidates: any[] = [];
    if (mod) {
      if (mod.plugin) candidates.push(mod.plugin);
      if (mod.default) candidates.push(mod.default);
      // scan all named exports for NodePlugin shape
      for (const k of Object.keys(mod)) candidates.push(mod[k]);
    }
    for (const c of candidates) if (isNodePlugin(c)) return c as NodePlugin;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[nflow] Failed to load plugin package '${pkgName}':`, err);
    }
  }
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
  const plugin = PLUGINS.find((p) => p.match(node));
  if (!plugin) throw new Error(`Unsupported node type: ${node.type}`);
  return await plugin.run(node, context, callback, dispatcher);
}
