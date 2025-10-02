import React from 'react';
import { normalizeKey } from '../../utils/normalizeKey';
import { RobotOutlined } from '@ant-design/icons';
import { NodeConfig, NodeTypeString } from '@n2flowjs/flow';



function safeGetPluginConfig(): Record<string, any> {
  // 1. Client: read pre-hydrated global (can be injected server-side) or fallback empty
  if (typeof window !== 'undefined') {
    return (window as any).__NFLOW_NODE_PLUGIN_CONFIG__ || {};
  }
  // 2. Server: try requiring heavy scanner (fs). Wrapped so client build won't include it.
  try {
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
    const formDefaults = { ...(cfg.defaults?.form || {}) };

    // Attempt to load a package-specific icon component: packages/<original-pkg>/icon
    let iconNode: React.ReactNode = <RobotOutlined />;
    try {
      const iconMod = (require as any)(`../../packages/${pkg}/icon`);
      const IconExport = iconMod?.default || iconMod?.Icon || iconMod?.icon;
      if (IconExport) {
        // If it's already a React element
        if (React.isValidElement(IconExport)) iconNode = IconExport;
        else if (typeof IconExport === 'function') iconNode = <IconExport />;
      }
    } catch {
    }

    registry[key] = {
      type: key as NodeTypeString,
      icon: iconNode,
      input: cfg.input || 'Input',
      output: cfg.output || 'Output',
      data: { type: key, form: formDefaults } as any,
    };
  });
  return registry as Record<NodeTypeString, NodeConfig>;
}

export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = buildNodeRegistry();
