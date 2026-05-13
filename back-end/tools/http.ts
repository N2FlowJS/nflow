import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../utils/common';
import { isInternalUrl } from './utils';

export const httpHandler: ToolHandler = async (node, args) => {
  const method = String(getNodeFieldValue(node, 'method') || 'GET');
  let url = String(getNodeFieldValue(node, 'url') || args.query || '');
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
      }
    });
    return await res.text();
  } catch (e) {
    return `Error fetching ${url}: ${String(e)}`;
  }
};
