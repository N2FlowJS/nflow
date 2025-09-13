import {  FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext } from '../@flow';
import { CacheNodeData } from './types';

// In-memory cache storage with TTL support
interface CacheEntry {
  value: any;
  expiry: number; // timestamp when entry expires
}

const cache: Map<string, CacheEntry> = new Map();

export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as CacheNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = [
    ...getInputFromTemplate(form.cacheKey || ''),
    ...getInputFromTemplate(form.cacheValue || ''),
    ...getInputFromTemplate(form.defaultValue || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready && form.operation !== 'clear') {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for cache operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'cache',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  try {
    const vars: Record<string, string> = {};
    inputs.forEach((key) => {
      if (flowState.components[key] !== undefined) {
        vars[key] = flowState.components[key].output || '';
      }
    });

    console.log(`Executing Cache node: ${node.id} with operation: ${form.operation}`);

    let result: any;
    const now = Date.now();

    // Clean expired entries
    cleanExpiredEntries();

    switch (form.operation) {
      case 'set':
        const setKey = processTemplate(form.cacheKey || '', vars);
        const setValue = processTemplate(form.cacheValue || '', vars);
        const ttl = (form.ttl || 3600) * 1000; // Convert to milliseconds
        const expiry = ttl === 0 ? Number.MAX_SAFE_INTEGER : now + ttl;
        
        cache.set(setKey, { value: setValue, expiry });
        
        result = {
          operation: 'set',
          key: setKey,
          value: setValue,
          ttl: form.ttl || 3600,
          success: true,
        };
        break;

      case 'get':
        const getKey = processTemplate(form.cacheKey || '', vars);
        const cacheEntry = cache.get(getKey);
        
        if (cacheEntry && cacheEntry.expiry > now) {
          result = {
            operation: 'get',
            key: getKey,
            value: cacheEntry.value,
            found: true,
          };
        } else {
          // Cache miss - remove expired entry if exists
          if (cacheEntry) {
            cache.delete(getKey);
          }
          
          const defaultValue = form.defaultValue ? processTemplate(form.defaultValue, vars) : null;
          result = {
            operation: 'get',
            key: getKey,
            value: defaultValue,
            found: false,
          };
        }
        break;

      case 'delete':
        const deleteKey = processTemplate(form.cacheKey || '', vars);
        const wasDeleted = cache.delete(deleteKey);
        
        result = {
          operation: 'delete',
          key: deleteKey,
          deleted: wasDeleted,
        };
        break;

      case 'clear':
        const beforeSize = cache.size;
        cache.clear();
        
        result = {
          operation: 'clear',
          clearedCount: beforeSize,
        };
        break;

      default:
        throw new Error(`Unsupported cache operation: ${form.operation}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    let finalState = flowState;

    if (dispatcher) {
      const outputValue = result.value !== undefined ? String(result.value) : JSON.stringify(result);
      dispatcher.setNodeOutput(node.id, outputValue, 'cache');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      const outputValue = result.value !== undefined ? String(result.value) : JSON.stringify(result);
      flowState.components[node.id]['output'] = outputValue;
      flowState.components[node.id]['type'] = 'cache';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'cache',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Cache execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown cache error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Cache operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'cache',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper function to clean expired entries
function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiry <= now) {
      cache.delete(key);
    }
  }
}

// Helper functions for external access
export function getCacheValue(key: string): any | null {
  cleanExpiredEntries();
  const entry = cache.get(key);
  return entry && entry.expiry > Date.now() ? entry.value : null;
}

export function setCacheValue(key: string, value: any, ttlSeconds: number = 3600): void {
  const ttl = ttlSeconds * 1000;
  const expiry = ttl === 0 ? Number.MAX_SAFE_INTEGER : Date.now() + ttl;
  cache.set(key, { value, expiry });
}

export function clearCache(): void {
  cache.clear();
}
