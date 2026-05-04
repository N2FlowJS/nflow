import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../utils/common';

const runSerperSearch = async (apiKey: string, query: string) => {
  if (!apiKey) return 'Error: Serper API Key is missing.';
  if (!query) return 'Error: Search query is empty.';

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return `Error Serper ${response.status}: ${errorText || response.statusText}`;
    }

    const data: any = await response.json();
    const organic = (data.organic || []).slice(0, 5).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    return JSON.stringify(organic);
  } catch (e) {
    return `Error calling Serper API: ${String(e)}`;
  }
};

export const serperHandler: ToolHandler = async (node, args) => {
  const serperApiKey = String(getNodeFieldValue(node, 'apiKey') || '');
  const query = String(args.query || getNodeFieldValue(node, 'query') || '').replace('{query}', args.query || '');
  return await runSerperSearch(serperApiKey, query);
};
