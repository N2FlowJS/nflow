import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';

import { NodePlugin } from '../../../../packages/@node-plugin/type';
import { getNodePluginConfig } from '../../../../packages/@node-plugin';

import { ExecutionResult, FlowExecutionContext } from '../../../../packages/@flow/type';

const BUILTIN_PLUGINS: NodePlugin[] = [];

let PLUGINS: NodePlugin[] = buildPlugins();

function buildPlugins(): NodePlugin[] {
  const cfgMap = getNodePluginConfig();
  // stable ordering with optional explicit order from config
  const withMeta = BUILTIN_PLUGINS.map((p, idx) => {
    // Resolve config by:
    // 1) Direct key match with plugin name
    // 2) Nested config within any package-level object under cfgMap[<pkg>][pluginName]
    const direct = (cfgMap as Record<string, any>)[p.name];
    const nested =
      direct == null
        ? (
            Object.values(cfgMap as Record<string, any>).find(
              (v: any) => v && typeof v === 'object' && p.name in (v as Record<string, any>)
            ) as Record<string, any> | undefined
          )?.[p.name]
        : undefined;
    const cfg = direct ?? nested;
    const enabled = typeof cfg?.enabled === 'boolean' ? cfg.enabled : true;
    const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
    return { p, enabled, order, idx };
  });
  return withMeta
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order || a.idx - b.idx)
    .map((m) => m.p);
}

export function registerNodePlugin(plugin: NodePlugin) {
  // Prevent duplicates by name
  if (PLUGINS.some((p) => p.name === plugin.name)) return;
  PLUGINS.push(plugin);
}

export function registerNodePlugins(plugins: NodePlugin[]) {
  for (const p of plugins) registerNodePlugin(p);
}

export function reloadNodePlugins() {
  PLUGINS = buildPlugins();
}

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const plugin = PLUGINS.find((p) => p.match(node));
  if (plugin) {
    return await plugin.run(node, context, callback, dispatcher);
  }
  throw new Error(`Unsupported node type: ${node.type}`);
}
