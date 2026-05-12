import { Script, createContext } from 'node:vm';
import { ToolHandler } from './registry';
import { getNodeFieldValue, parseJsonSafely, serializeToolResult } from '../utils/common';

/**
 * Generic fetch helper for tool HTTP requests.
 * Returns a serialized JSON string or an error string.
 */
export const fetchToolJson = async (
  url: string,
  headers: Record<string, string>,
  serviceName: string,
  method = 'GET',
  body?: unknown,
): Promise<string> => {
  const response = await fetch(url, {
    method,
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return `Error ${serviceName} ${response.status}: ${text || response.statusText}`;
  }
  const data = await response.json().catch(() => null);
  return serializeToolResult(data);
};

export const conditionHandler: ToolHandler = async (node, args) => {
  const condition = String(getNodeFieldValue(node, 'condition') || '').trim();
  if (!condition) {
    return 'Error: Condition is empty. Set "condition" in Router node.';
  }

  const query = String(args.query || args.input || '');
  const sandbox = Object.create(null);
  Object.assign(sandbox, {
    input: query,
    query,
    args,
    JSON,
    Math,
    Date,
  });

  try {
    const context = createContext(sandbox);
    const script = new Script(`Boolean(${condition})`);
    const value = script.runInContext(context, { timeout: 500 });
    return String(Boolean(value));
  } catch (err) {
    return `Error evaluating condition: ${String(err)}`;
  }
};

