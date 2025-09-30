

import type React from 'react';
type Comp = React.ComponentType<unknown>;

export function getDiscoveredNodeComponents(): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    return ((window as unknown) as { __NFLOW_NODE_COMPONENTS__?: Record<string, Comp> }).__NFLOW_NODE_COMPONENTS__ || {};
  }
  // Server-side: scanning not available in browser build
  return {};
}

export function reloadDiscoveredNodeComponents(): Record<string, Comp> {
  return getDiscoveredNodeComponents();
}


export function getDiscoveredNodeForms(_opts?: { force?: boolean }): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    return ((window as unknown) as { __NFLOW_NODE_FORMS__?: Record<string, Comp> }).__NFLOW_NODE_FORMS__ || {};
  }
  // Server-side: scanning not available in browser build
  return {};
}

export function reloadDiscoveredNodeForms(): Record<string, Comp> {
  return getDiscoveredNodeForms({ force: true });
}

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
