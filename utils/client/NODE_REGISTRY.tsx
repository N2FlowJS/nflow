import React from 'react';
import { NodeTypeString, NodeConfig } from '../../models/flowTypes';
import { RobotOutlined } from '@ant-design/icons';
// IMPORTANT: Do NOT import '../../packages/@node-plugin' here because it uses fs/path.
// We resolve plugin config lazily inside a guarded function to keep the client bundle clean.


function normalizeKey(name: string) { return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }

function safeGetPluginConfig(): Record<string, any> {
  // 1. Client: read pre-hydrated global (can be injected server-side) or fallback empty
  if (typeof window !== 'undefined') {
    return (window as any).__NFLOW_NODE_PLUGIN_CONFIG__ || {};
  }
  // 2. Server: try requiring heavy scanner (fs). Wrapped so client build won't include it.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../packages/@node-plugin');
    return (mod.getNodePluginConfig ? mod.getNodePluginConfig() : {}) || {};
  } catch {
    return {};
  }
}

function buildNodeRegistry(): Record<NodeTypeString, NodeConfig> {
  const pluginCfg: Record<string, any> = safeGetPluginConfig();
  const registry: Record<string, NodeConfig> = {};
  Object.entries(pluginCfg).forEach(([pkg, cfg]) => {
    if (!cfg || cfg.enabled === false) return;
    const key = normalizeKey(pkg);
    const formDefaults = {  ...(cfg.defaults?.form || {}) };

    // Attempt to load a package-specific icon component: packages/<original-pkg>/icon
    let iconNode: React.ReactNode = <RobotOutlined />;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const iconMod = (require as any)(`../../packages/${pkg}/icon`);
      const IconExport = iconMod?.default || iconMod?.Icon || iconMod?.icon;
      if (IconExport) {
        // If it's already a React element
        if (React.isValidElement(IconExport)) iconNode = IconExport;
        else if (typeof IconExport === 'function') iconNode = <IconExport />;
      }
    } catch { /* no custom icon provided */ }

    registry[key] = {
      type: key as NodeTypeString,
      icon: iconNode,
      input: cfg.input || 'Input',
      output: cfg.output || 'Output',
      data: { type: key, form: formDefaults } as any,
    };
  });
  ['begin','interface','generate'].forEach(k => { if (!registry[k]) registry[k] = { type: k as NodeTypeString, icon: <RobotOutlined />, input: 'Input', output: 'Output', data: { type: k, form: {} } as any }; });
  return registry as Record<NodeTypeString, NodeConfig>;
}

export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = buildNodeRegistry();
export function reloadNodeRegistry() { return buildNodeRegistry(); }
export const NODE_REGISTRY_PROXY: Record<string, NodeConfig> = new Proxy(NODE_REGISTRY, { get(target, prop: string) { if (prop in target) return (target as any)[prop]; return (target as any)[normalizeKey(prop)]; } });
export function getQueryInputSources() { return [ { id: 'user_input', name: 'User Input', description: 'Most recent user input' }, { id: 'generated_text', name: 'Generated Text', description: 'Output from last Generate node' }, { id: 'retrieval_results', name: 'Retrieval Results', description: 'Results from last Retrieval node' } ]; }
export function getNodeInputInfo(nodeType: NodeTypeString) { return NODE_REGISTRY[nodeType]?.input; }
// END CLEAN DYNAMIC IMPLEMENTATION
