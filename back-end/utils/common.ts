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

export const resolveVariablePlaceholders = (
  value: unknown,
  globalVariables: GlobalVariable[] = [],
): unknown => {
  if (typeof value !== 'string' || globalVariables.length === 0) {
    return value;
  }

  const variableMap = Object.fromEntries(
    globalVariables.map((variable) => [variable.name, variable.value]),
  );

  return value.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, rawName) => {
    const name = String(rawName).trim();
    const resolved = variableMap[name];
    return resolved !== undefined ? resolved : match;
  });
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
