import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

// In-memory cache storage with TTL support
interface CacheEntry {
  value: any;
  expiry: number;
}

const cache: Map<string, CacheEntry> = new Map();

// Clean expired entries
function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiry <= now) {
      cache.delete(key);
    }
  }
}

/**
 * Cache Node Definition
 * 
 * In-memory caching with TTL (Time To Live) support.
 * Useful for storing temporary data, reducing API calls, and improving performance.
 * 
 * Operations:
 * - set: Store value with TTL
 * - get: Retrieve cached value
 * - delete: Remove cache entry
 * - clear: Clear all cache entries
 * 
 * Features:
 * - TTL (Time To Live) support
 * - Automatic expiry cleanup
 * - Default values for cache miss
 * - Template variable support
 * 
 * Example:
 * ```json
 * {
 *   "operation": "set",
 *   "cacheKey": "user_{userId}",
 *   "cacheValue": "{userData}",
 *   "ttl": 3600
 * }
 * ```
 */
export const CacheNodeDefinition: NodeDefinition = {
  id: 'cache',
  name: 'Cache',
  category: NodeCategory.UTILITY,
  description: 'In-memory caching with TTL support for temporary data storage',
  version: '1.0.0',

  inputs: [
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Cache operation',
      required: true,
      defaultValue: 'get',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Get', value: 'get' },
          { label: 'Set', value: 'set' },
          { label: 'Delete', value: 'delete' },
          { label: 'Clear', value: 'clear' },
        ],
      },
    },
    {
      id: 'cacheKey',
      name: 'Cache Key',
      type: PortType.TEXT,
      description: 'Unique cache key (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'my-cache-key' },
    },
    {
      id: 'cacheValue',
      name: 'Cache Value',
      type: PortType.TEXT,
      description: 'Value to cache (supports {variable} templates, for set operation)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Value to cache...' },
    },
    {
      id: 'ttl',
      name: 'TTL (seconds)',
      type: PortType.NUMBER,
      description: 'Time to live in seconds (0 = no expiry)',
      required: false,
      defaultValue: 3600,
      metadata: { inputType: 'number', min: 0 },
    },
    {
      id: 'defaultValue',
      name: 'Default Value',
      type: PortType.TEXT,
      description: 'Default value if cache miss (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Default value...' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'value',
      name: 'Value',
      type: PortType.ANY,
      description: 'Cached value or operation result',
    },
    {
      id: 'found',
      name: 'Found',
      type: PortType.BOOLEAN,
      description: 'Whether cache entry was found (get operation)',
    },
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Complete operation result',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.cacheKey) {
      getInputFromTemplate(config.cacheKey as string).forEach(v => variableNames.add(v));
    }
    if (config.cacheValue) {
      getInputFromTemplate(config.cacheValue as string).forEach(v => variableNames.add(v));
    }
    if (config.defaultValue) {
      getInputFromTemplate(config.defaultValue as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...CacheNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.cacheKey as string) || ''),
      ...getInputFromTemplate((config.cacheValue as string) || ''),
      ...getInputFromTemplate((config.defaultValue as string) || ''),
    ];

    if (!isNodeReady(templateVars, flowState) && config.operation !== 'clear') {
      return {
        outputs: { value: null, found: false, result: {} },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      let result: any;
      const now = Date.now();

      // Clean expired entries
      cleanExpiredEntries();

      switch (config.operation) {
        case 'set':
          const setKey = processTemplate((config.cacheKey as string) || '', vars);
          const setValue = processTemplate((config.cacheValue as string) || '', vars);
          const ttl = ((config.ttl as number) || 3600) * 1000;
          const expiry = ttl === 0 ? Number.MAX_SAFE_INTEGER : now + ttl;
          
          cache.set(setKey, { value: setValue, expiry });
          
          result = {
            operation: 'set',
            key: setKey,
            value: setValue,
            ttl: (config.ttl as number) || 3600,
            success: true,
          };
          break;

        case 'get':
          const getKey = processTemplate((config.cacheKey as string) || '', vars);
          const cacheEntry = cache.get(getKey);
          
          if (cacheEntry && cacheEntry.expiry > now) {
            result = {
              operation: 'get',
              key: getKey,
              value: cacheEntry.value,
              found: true,
            };
          } else {
            if (cacheEntry) {
              cache.delete(getKey);
            }
            
            const defaultValue = config.defaultValue 
              ? processTemplate(config.defaultValue as string, vars) 
              : null;
            result = {
              operation: 'get',
              key: getKey,
              value: defaultValue,
              found: false,
            };
          }
          break;

        case 'delete':
          const deleteKey = processTemplate((config.cacheKey as string) || '', vars);
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
          throw new Error(`Unsupported cache operation: ${config.operation}`);
      }

      if (dispatcher) {
        const outputValue = result.value !== undefined ? String(result.value) : JSON.stringify(result);
        dispatcher.setNodeOutput(node.id, outputValue, 'cache');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          value: result.value,
          found: result.found !== undefined ? result.found : true,
          result
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation: config.operation,
          cacheSize: cache.size
        }
      };
    } catch (error: unknown) {
      console.error('Cache node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown cache error';

      return {
        outputs: {
          value: null,
          found: false,
          result: { error: errorMessage }
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
