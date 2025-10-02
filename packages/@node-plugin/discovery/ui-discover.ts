// Browser/UI-friendly component discovery
// Accesses pre-injected components from window object

import type React from 'react';

type Comp = React.ComponentType<unknown>;

interface WindowWithComponents extends Window {
  __NFLOW_NODE_COMPONENTS__?: Record<string, Comp>;
  __NFLOW_NODE_FORMS__?: Record<string, Comp>;
}

/**
 * Get discovered node components from window (injected by _app or _document)
 */
export function getDiscoveredNodeComponents(): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithComponents;
    return win.__NFLOW_NODE_COMPONENTS__ || {};
  }
  return {};
}

/**
 * Reload/refresh discovered components (returns current state)
 */
export function reloadDiscoveredNodeComponents(): Record<string, Comp> {
  return getDiscoveredNodeComponents();
}

/**
 * Get discovered node forms from window
 */
export function getDiscoveredNodeForms(_opts?: { force?: boolean }): Record<string, Comp> {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithComponents;
    return win.__NFLOW_NODE_FORMS__ || {};
  }
  return {};
}

/**
 * Reload/refresh discovered forms
 */
export function reloadDiscoveredNodeForms(): Record<string, Comp> {
  return getDiscoveredNodeForms({ force: true });
}

/**
 * Build a node types map on the client by leveraging discovered components
 */
export function getClientNodeTypes(): Record<string, Comp> {
  return getDiscoveredNodeComponents();
}

/**
 * Get array of available node type keys on client
 */
export function getClientNodeTypeKeys(): string[] {
  return Object.keys(getClientNodeTypes());
}

/**
 * Get NODE_TYPES-like map on client (key -> key mapping)
 */
export function getClientNODE_TYPES(): Record<string, string> {
  const keys = getClientNodeTypeKeys();
  return keys.reduce((acc, k) => {
    acc[k] = k;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Check if a specific node type is available on client
 */
export function hasNodeType(nodeType: string): boolean {
  return nodeType in getDiscoveredNodeComponents();
}

/**
 * Get all available components (both nodes and forms)
 */
export function getAllDiscoveredComponents(): {
  nodes: Record<string, Comp>;
  forms: Record<string, Comp>;
} {
  return {
    nodes: getDiscoveredNodeComponents(),
    forms: getDiscoveredNodeForms(),
  };
}
