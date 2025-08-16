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
