import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';
import { NodePlugin } from '../../../../packages/@node-plugin/type';
import { getNodePluginConfig } from '../../../../packages/@node-plugin';
import { ExecutionResult, FlowExecutionContext } from '../../../../packages/@flow/type';

// Registry of built-in (statically bundled) plugins. Populate elsewhere before execution.
const BUILTIN_PLUGINS: NodePlugin[] = [];
let PLUGINS: NodePlugin[] = [];
reloadNodePlugins();

function buildPlugins(): NodePlugin[] {
  const cfgMap = getNodePluginConfig() as Record<string, any>;
  return BUILTIN_PLUGINS
    .map((p, idx) => {
      const alt = p.name.replace(/-/g, '');
      const cfg = cfgMap[p.name] || cfgMap[alt];
      const enabled = cfg?.enabled !== false; // default true
      const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
      return { p, enabled, order, idx };
    })
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order || a.idx - b.idx)
    .map(m => m.p);
}

export function registerNodePlugin(plugin: NodePlugin) {
  if (BUILTIN_PLUGINS.some(p => p.name === plugin.name)) return;
  BUILTIN_PLUGINS.push(plugin);
  // Keep PLUGINS in sync without forcing full reload cost for entire map.
  const cfg = (getNodePluginConfig() as Record<string, any>)[plugin.name];
  if (cfg?.enabled === false) return; // skip disabled
  const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
  // Insert maintaining order (rare operation, O(n) ok)
  let inserted = false;
  for (let i = 0; i < PLUGINS.length; i++) {
    const existingCfg = (getNodePluginConfig() as Record<string, any>)[PLUGINS[i].name];
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

export function reloadNodePlugins() { PLUGINS = buildPlugins(); }

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const plugin = PLUGINS.find(p => p.match(node));
  if (!plugin) throw new Error(`Unsupported node type: ${node.type}`);
  return await plugin.run(node, context, callback, dispatcher);
}
