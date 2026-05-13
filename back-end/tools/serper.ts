import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../utils/common';
import { fetchToolJson } from './utils';

const runSerperSearch = async (apiKey: string, query: string) => {
  if (!apiKey) return 'Error: Serper API Key is missing.';
  if (!query) return 'Error: Search query is empty.';

  try {
    const rawResult = await fetchToolJson(
      'https://google.serper.dev/search',
      { 'X-API-KEY': apiKey },
      'Serper',
      'POST',
      { q: query }
    );

    if (rawResult.startsWith('Error') || rawResult.startsWith('Security Error')) {
      return rawResult;
    }

    const data = JSON.parse(rawResult);
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
