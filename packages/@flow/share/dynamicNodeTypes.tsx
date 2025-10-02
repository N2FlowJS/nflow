import React, { useEffect, useRef } from 'react';
import { NodeTypes as ReactFlowNodeTypes } from '@xyflow/react';
import { getDiscoveredNodeComponents } from '../../@node-plugin/discovery/ui-discover';
import { normalizeKey } from '../../../utils/normalizeKey';
import { DynamicNode } from '../node/DynamicNode';

// Global cache using Map for better performance with dynamic keys
const componentCache = new Map<string, React.ComponentType<any>>();
const failedImports = new Set<string>(); // Track failed imports to avoid retry
const normalizedKeyCache = new Map<string, string>(); // Cache normalized keys
const loadingPromises = new Map<string, Promise<React.ComponentType<any> | null>>(); // Dedupe concurrent imports

// Cached normalize to avoid repeated computation
function getCachedNormalizedKey(key: string): string {
  if (!normalizedKeyCache.has(key)) {
    normalizedKeyCache.set(key, normalizeKey(key));
  }
  return normalizedKeyCache.get(key)!;
}

// Initialize cache once with discovered components
let discoveredLoaded = false;
function ensureDiscoveredLoaded() {
  if (discoveredLoaded) return;
  discoveredLoaded = true;
  
  const discovered = typeof window !== 'undefined' 
    ? (window as any).__NFLOW_NODE_COMPONENTS__ || {}
    : getDiscoveredNodeComponents();
  
  for (const [key, comp] of Object.entries(discovered)) {
    const normalized = getCachedNormalizedKey(key);
    componentCache.set(normalized, comp as React.ComponentType<any>);
    // Also set original key if different for faster lookup
    if (key !== normalized) {
      componentCache.set(key, comp as React.ComponentType<any>);
    }
  }
}

// Attempt dynamic import with deduplication and failure tracking
// NOTE: Currently unused - we use DynamicNode by default
// @ts-ignore - keep for potential future use
async function tryDynamicImport(rawType: string): Promise<React.ComponentType<any> | null> {
  const normalized = getCachedNormalizedKey(rawType);
  
  // Check cache first
  if (componentCache.has(normalized)) {
    return componentCache.get(normalized)!;
  }
  
  // Don't retry failed imports
  if (failedImports.has(normalized)) {
    return null;
  }
  
  // Dedupe concurrent imports
  if (loadingPromises.has(normalized)) {
    return loadingPromises.get(normalized)!;
  }
  
  const loadPromise = (async () => {
    try {
      // Try primary path (normalized key is what server uses)
      const mod = await import(/* webpackMode: "lazy" */ `../../../packages/${normalized}/node`);
      const comp = (mod as any).default || Object.values(mod).find(v => typeof v === 'function');
      
      if (comp) {
        const component = comp as React.ComponentType<any>;
        componentCache.set(normalized, component);
        if (rawType !== normalized) {
          componentCache.set(rawType, component);
        }
        return component;
      }
    } catch (err) {
      // Mark as failed to avoid retry
      failedImports.add(normalized);
    } finally {
      loadingPromises.delete(normalized);
    }
    return null;
  })();
  
  loadingPromises.set(normalized, loadPromise);
  return loadPromise;
}

// Optimized lazy wrapper that uses global cache and event-driven updates
// NOTE: Currently unused - we use DynamicNode by default
// @ts-ignore - keep for potential future use
function makeLazyWrapper(rawType: string): React.ComponentType<any> {
  const normalized = getCachedNormalizedKey(rawType);
  
  const LazyNode = (props: any) => {
    const forceUpdateRef = useRef<(() => void) | undefined>(undefined);
    const [, setTick] = React.useState(0);
    forceUpdateRef.current = () => setTick(t => t + 1);
    
    useEffect(() => {
      // Check if already loaded
      if (componentCache.has(normalized)) {
        return;
      }
      
      // Start loading
      let mounted = true;
      tryDynamicImport(rawType).then(() => {
        if (mounted && forceUpdateRef.current) {
          forceUpdateRef.current();
        }
      });
      
      return () => { mounted = false; };
    }, []); // Empty deps - only load once per component instance
    
    const Component = componentCache.get(normalized);
    if (Component) {
      return React.createElement(Component, props);
    }
    
    // Show loading or error state
    const isFailed = failedImports.has(normalized);
    return React.createElement(
      'div',
      { style: { padding: 8, fontSize: 12, opacity: 0.7 } },
      isFailed ? 'Failed to load ' : 'Loading ',
      React.createElement('strong', null, rawType)
    );
  };
  
  return LazyNode as React.ComponentType<any>;
}

let NODE_TYPES_CACHE: ReactFlowNodeTypes | null = null;
const lazyWrapperCache = new Map<string, React.ComponentType<any>>(); // Cache lazy wrappers

export function getNodeTypes(): ReactFlowNodeTypes {
  if (NODE_TYPES_CACHE) return NODE_TYPES_CACHE;
  
  // Ensure discovered components are loaded into cache
  ensureDiscoveredLoaded();

  // Create a Proxy for on-demand lazy loading
  const proxied = new Proxy({} as Record<string, React.ComponentType<any>>, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      
      // Check if wrapper already cached
      if (lazyWrapperCache.has(prop)) {
        return lazyWrapperCache.get(prop);
      }
      
      const normalized = getCachedNormalizedKey(prop);
      
      // Check if component is in cache (by original or normalized key)
      if (componentCache.has(prop)) {
        const comp = componentCache.get(prop)!;
        lazyWrapperCache.set(prop, comp);
        return comp;
      }
      if (componentCache.has(normalized)) {
        const comp = componentCache.get(normalized)!;
        lazyWrapperCache.set(prop, comp);
        return comp;
      }
      
      // OPTIMIZATION: Use DynamicNode as default instead of lazy loading custom components
      // This eliminates need for 97 custom node components
      // Custom components can still be registered in componentCache if needed
      lazyWrapperCache.set(prop, DynamicNode);
      return DynamicNode;
      
      // OLD: Create lazy wrapper and cache it
      // const wrapper = makeLazyWrapper(prop);
      // lazyWrapperCache.set(prop, wrapper);
      // return wrapper;
    },
    
    has(_target, prop: string | symbol) {
      if (typeof prop !== 'string') return false;
      const normalized = getCachedNormalizedKey(prop);
      return componentCache.has(prop) || componentCache.has(normalized);
    },
    
    ownKeys() {
      // Return all known component keys
      return Array.from(componentCache.keys());
    },
    
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop !== 'string') return undefined;
      const normalized = getCachedNormalizedKey(prop);
      if (componentCache.has(prop) || componentCache.has(normalized)) {
        return {
          enumerable: true,
          configurable: true,
        };
      }
      return undefined;
    },
  });

  NODE_TYPES_CACHE = proxied as ReactFlowNodeTypes;
  return NODE_TYPES_CACHE;
}

export function reloadNodeTypes() {
  NODE_TYPES_CACHE = null;
  lazyWrapperCache.clear();
  // Keep componentCache and failedImports - actual components should persist
  // Reset discovery flag to reload from window
  discoveredLoaded = false;
  return getNodeTypes();
}

export const nodeTypes = getNodeTypes();
