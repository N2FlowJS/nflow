import React, { useEffect, useState } from 'react';
import { NodeTypes as ReactFlowNodeTypes } from '@xyflow/react';
import { getDiscoveredNodeComponents } from '../../../packages/@node-plugin/discovery/ui-discover';

// Dynamic cache for lazily imported node components (client side)
const dynamicNodeCache: Record<string, React.ComponentType<any>> = {};

// Helper: normalize a raw node type / package name into the discovery key (mirrors server scan)
function normalizeKey(raw: string) {
  return (raw || '').replace(/[^a-zA-Z0-9\-]/g, ''); // remove non-alphanumerics (similar to NodeForm logic)
}

// Load whatever has already been discovered (server scan or window injection)
function loadDiscovered(): Record<string, React.ComponentType<any>> {
  if (typeof window !== 'undefined') return (window as any).__NFLOW_NODE_COMPONENTS__ || {};
  return getDiscoveredNodeComponents() as Record<string, React.ComponentType<any>>;
}

// Attempt a dynamic (client) import for a given raw type / package name.
async function tryDynamicImport(rawType: string): Promise<React.ComponentType<any> | null> {
  console.log(`Trying dynamic import for: ${rawType}`);

  const key = normalizeKey(rawType);
  if (dynamicNodeCache[key]) return dynamicNodeCache[key];
  const candidates = Array.from(new Set([rawType, key]));
  for (const c of candidates) {
    try {
      // Expect a /node entry folder similar to server scan (packages/<pkg>/node)
      const mod = await import(/* webpackMode: "lazy" */ `../../../packages/${c}/node`);
      const comp = (mod as any).default || Object.values(mod)[0];
      if (comp) {
        dynamicNodeCache[key] = comp as React.ComponentType<any>;
        return dynamicNodeCache[key];
      }
    } catch {
      // keep trying other candidates
    }
  }
  return null;
}

// Lazy wrapper component returned when a node type was not pre-discovered.
// It will attempt to dynamically import the real component on mount and then render it.
function makeLazyWrapper(rawType: string, placeholder?: React.ComponentType<any>): React.ComponentType<any> {
  const key = normalizeKey(rawType);
  const Fallback = (props: any) => {
    const [Comp, setComp] = useState<React.ComponentType<any> | null>(() => dynamicNodeCache[key] || placeholder || null);
    useEffect(() => {
      let cancelled = false;
      if (dynamicNodeCache[key]) return; // already loaded
      (async () => {
        const loaded = await tryDynamicImport(rawType);
        if (!cancelled && loaded) setComp(() => loaded);
      })();
      return () => { cancelled = true; };
    }, [rawType]);
    if (Comp) return React.createElement(Comp as any, { ...props });
    return React.createElement(
      'div',
      { style: { padding: 8, fontSize: 12, opacity: 0.7 } },
      'Loading node ',
      React.createElement('strong', null, rawType),
      '...'
    );
  };
  return Fallback as React.ComponentType<any>;
}

let CACHE: ReactFlowNodeTypes | null = null;

export function getNodeTypes(): ReactFlowNodeTypes {
  if (CACHE) return CACHE;
  const discovered = loadDiscovered();
  // Seed cache with discovered
  Object.entries(discovered).forEach(([k, comp]) => {
    if (!dynamicNodeCache[k]) dynamicNodeCache[k] = comp;
  });

  // Build initial mapping from dynamic cache (all known so far)
  const base: Record<string, React.ComponentType<any>> = { ...dynamicNodeCache };

  // Create a Proxy so that access to an unknown key (nodeTypes['xyz']) returns a lazy wrapper.
  const proxied = new Proxy(base, {
    get(target, prop: string | symbol, receiver) {
      if (typeof prop !== 'string') return Reflect.get(target, prop, receiver);
      if (prop in target) return Reflect.get(target, prop, receiver);
      // Create & cache a lazy loader for this on-demand type
      const wrapper = makeLazyWrapper(prop);
      (target as any)[prop] = wrapper;
      return wrapper;
    },
  });

  CACHE = proxied as ReactFlowNodeTypes;
  return CACHE;
}

export function reloadNodeTypes() {
  CACHE = null; // keep dynamicNodeCache so already loaded nodes persist
  return getNodeTypes();
}

export const nodeTypes = getNodeTypes();