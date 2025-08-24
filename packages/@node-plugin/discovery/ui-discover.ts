// UI discovery helpers (React client first). Actual scanning isolated in lib/discovery/scanPlugins
// to prevent fs/path from polluting client bundles. This file can be imported safely anywhere.

import type React from 'react';
type Comp = React.ComponentType<any>;

export function getDiscoveredNodeComponents(): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    return (window as any).__NFLOW_NODE_COMPONENTS__ || {};
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { scanNodeComponents } = require('../../../lib/discovery/scanPlugins');
    return scanNodeComponents();
  } catch {
    return {};
  }
}

export function reloadDiscoveredNodeComponents() { return getDiscoveredNodeComponents(); }

export function getDiscoveredNodeForms(opts?: { force?: boolean }): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    return (window as any).__NFLOW_NODE_FORMS__ || {};
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { scanNodeForms, invalidateFormScanCache } = require('../../../lib/discovery/scanPlugins');
    if (opts?.force) invalidateFormScanCache();
    return scanNodeForms(opts?.force);
  } catch {
    return {};
  }
}

export function reloadDiscoveredNodeForms() { return getDiscoveredNodeForms({ force: true }); }

// Build a node types map on the client by leveraging discovered components
export function getClientNodeTypes(): Record<string, Comp> {
  return getDiscoveredNodeComponents();
}

// Convenience: dynamic node type keys on client
export function getClientNodeTypeKeys(): string[] {
  return Object.keys(getClientNodeTypes());
}

// Convenience: NODE_TYPES-like map on client
export function getClientNODE_TYPES(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const k of getClientNodeTypeKeys()) map[k] = k;
  return map;
}
