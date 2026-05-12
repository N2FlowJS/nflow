import type { FlowNode } from '../flowTypes';
import type { GlobalVariable } from '../flowTypes';

export const getNodeFieldValue = (
  node: FlowNode | undefined,
  key: string,
): string | number | boolean | undefined => {
  const configValue = node?.data?.configSchema?.find((field: any) => field.name === key)?.value;
  if (configValue !== undefined) return configValue;
  return node?.data?.params?.[key] as string | number | boolean | undefined;
};

export const trimTrailingSlash = (url: unknown) => String(url || '').replace(/\/+$/, '');

export const interpolate = (template: string, values: Record<string, string>) =>
  String(template || '').replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, key) => {
    const value = values[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });

export const formatValidationMessage = (
  template: string,
  values: Record<string, string>,
): string => {
  return template.replace(/\{(label|type|nodeId|field|level|ruleKey|defaultMessage)\}/g, (_, k) => values[k] || '');
};

export const resolveVariablePlaceholders = (
  value: unknown,
  globalVariables: GlobalVariable[] = [],
): unknown => {
  if (Array.isArray(value)) {
    return value.map(v => resolveVariablePlaceholders(v, globalVariables));
  }
  if (value && typeof value === 'object') {
    const resolved: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolveVariablePlaceholders(v, globalVariables);
    }
    return resolved;
  }
  if (typeof value !== 'string') {
    return value;
  }
  
  // First resolve global variables {{VAR}}
  let result = value;
  if (globalVariables.length > 0) {
    const variableMap = Object.fromEntries(
      globalVariables.map((variable) => [variable.name, variable.value]),
    );

    result = result.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, rawName) => {
      const name = String(rawName).trim();
      const resolved = variableMap[name];
      return resolved !== undefined ? resolved : match;
    });
  }

  // Then resolve environment secrets {{SECRET}} if {{ is still present
  if (result.includes('{{')) {
    result = result.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (m, n) => process.env[String(n).trim()] ?? m);
  }

  return result;
};

export const parseJsonSafely = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const serializeToolResult = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value);
  } catch {
    // Handle circular structures safely
    const seen = new WeakSet();
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    }, 2);
  }
};




/** Extract a plain error message string from any caught value. */
export const toErrorMessage = (err: unknown, fallback = 'An unexpected error occurred'): string =>
  err instanceof Error ? err.message : (typeof err === 'string' ? err : fallback);

/** Mask an API key for safe logging. */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return 'missing';
  if (apiKey.length <= 8) return `${apiKey.slice(0, 2)}***`;
  return `${apiKey.slice(0, 4)}***${apiKey.slice(-4)}`;
};

/** Normalize an API key by trimming and removing Bearer prefix. */
export const normalizeApiKey = (apiKey: unknown): string => {
  const raw = String(apiKey || '').trim();
  if (!raw) return '';
  return raw.replace(/^Bearer\s+/i, '').trim();
};

/** Race a promise against a timeout that rejects with the given message. */
export const withTimeout = <T>(operation: Promise<T>, ms: number, message: string): Promise<T> =>
  Promise.race([
    operation,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
