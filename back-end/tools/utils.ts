import { Script, createContext } from 'node:vm';
import { isIP } from 'node:net';
import { ToolHandler } from './registry';
import { getNodeFieldValue, parseJsonSafely, serializeToolResult } from '../utils/common';

/**
 * SSRF Protection: Check if a URL points to an internal resource.
 */
export const isInternalUrl = (urlStr: string): boolean => {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();

    // Block standard local hostnames
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) {
      return true;
    }

    // Block private IP ranges
    if (isIP(host)) {
      // 10.0.0.0/8
      if (host.startsWith('10.')) return true;
      // 172.16.0.0/12
      if (host.startsWith('172.')) {
        const parts = host.split('.');
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) return true;
      }
      // 192.168.0.0/16
      if (host.startsWith('192.168.')) return true;
      // 169.254.0.0/16 (Link-local)
      if (host.startsWith('169.254.')) return true;
    }

    return false;
  } catch {
    return true; // Treat invalid URLs as dangerous
  }
};

/**
 * Configuration Helper: Extract multiple fields from a node's configSchema or params.
 */
export const extractNodeConfig = <T extends Record<string, string | number | boolean | undefined>>(
  node: any,
  keys: (keyof T)[],
): T => {
  const config = {} as T;
  for (const key of keys) {
    config[key] = getNodeFieldValue(node, String(key)) as T[keyof T];
  }
  return config;
};

/**
 * Generic fetch helper for tool HTTP requests with SSRF protection.
 * Returns a serialized JSON string or an error string.
 */
export const fetchToolJson = async (
  url: string,
  headers: Record<string, string>,
  serviceName: string,
  method = 'GET',
  body?: unknown,
): Promise<string> => {
  if (isInternalUrl(url)) {
    return `Security Error: Access to internal URL ${url} is restricted.`;
  }

  const response = await fetch(url, {
    method,
    headers: { 
      'User-Agent': 'n2flow-runtime/1.0',
      ...headers, 
      ...(body ? { 'Content-Type': 'application/json' } : {}) 
    },
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

