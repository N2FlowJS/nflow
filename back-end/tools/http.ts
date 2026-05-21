import { ToolHandler } from './registry';
import { isInternalUrl, extractNodeConfig } from './utils';

export const httpHandler: ToolHandler = async (node, args, options) => {
  const config = extractNodeConfig(node, ['method', 'url']);
  const method = String(config.method || 'GET');
  let url = String(config.url || args.query || '');
  if (typeof url === 'string' && url.includes('{query}')) {
    url = url.replace('{query}', encodeURIComponent(args.query || ''));
  }

  if (isInternalUrl(url)) {
    return `Security Error: Access to internal URL ${url} is restricted.`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'n2flow-runtime/1.0',
      },
      // Forward AbortSignal for instant cancellation
      signal: options?.signal,
    });
    return await res.text();
  } catch (e) {
    return `Error fetching ${url}: ${String(e)}`;
  }
};
