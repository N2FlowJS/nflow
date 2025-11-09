import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { CacheForm } from './types';

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

export class CacheExecutor extends BaseNodeExecutor<CacheForm> {
  constructor() {
    super({
      nodeType: 'cache',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['cacheKey', 'cacheValue', 'defaultValue'],
    });
  }

  protected async executeLogic(form: CacheForm, context: ExecutionContext): Promise<string> {
    const { operation, cacheKey, cacheValue, ttl, defaultValue } = form;

    // Process templates
    const processedKey = this.processTemplate(cacheKey || '', context);
    const processedValue = cacheValue ? this.processTemplate(cacheValue, context) : undefined;
    const processedDefault = defaultValue ? this.processTemplate(defaultValue, context) : undefined;

    let result: any;
    const now = Date.now();

    // Clean expired entries
    cleanExpiredEntries();

    switch (operation) {
      case 'set':
        if (!processedValue) {
          throw new Error('Cache value is required for set operation');
        }
        const setTtl = (ttl || 3600) * 1000;
        const expiry = setTtl === 0 ? Number.MAX_SAFE_INTEGER : now + setTtl;

        cache.set(processedKey, { value: processedValue, expiry });

        result = {
          operation: 'set',
          key: processedKey,
          value: processedValue,
          ttl: ttl || 3600,
          success: true,
        };
        break;

      case 'get':
        const cacheEntry = cache.get(processedKey);

        if (cacheEntry && cacheEntry.expiry > now) {
          result = {
            operation: 'get',
            key: processedKey,
            value: cacheEntry.value,
            found: true,
          };
        } else {
          if (cacheEntry) {
            cache.delete(processedKey);
          }

          result = {
            operation: 'get',
            key: processedKey,
            value: processedDefault || null,
            found: false,
          };
        }
        break;

      case 'delete':
        const wasDeleted = cache.delete(processedKey);

        result = {
          operation: 'delete',
          key: processedKey,
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
        throw new Error(`Unsupported cache operation: ${operation}`);
    }

    // Return structured result
    return JSON.stringify({
      value: result.value,
      found: result.found !== undefined ? result.found : true,
      result,
      metadata: {
        operation,
        cacheSize: cache.size
      }
    });
  }
}

export const cacheExecutor = new CacheExecutor();
