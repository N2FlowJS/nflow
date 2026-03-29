import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../../utils/common';
import { isIP } from 'node:net';

const isInternalUrl = (urlStr: string): boolean => {
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
