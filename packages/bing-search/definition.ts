import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Bing Search Node Definition
 * 
 * Integration with Bing Search API (Microsoft).
 * Supports web, image, news, and video search.
 * 
 * Configuration:
 * - query: Search query (supports {variable} templates)
 * - apiKey: Bing Search API key (or use BING_SEARCH_API_KEY env)
 * - searchType: Type of search (web, images, news, videos)
 * - maxResults: Maximum results (1-50, default: 10)
 * - safeSearch: Safe search level (off, moderate, strict)
 * - language: Search language (e.g., en, es, fr)
 * - country: Target country (e.g., us, gb, ca)
 * 
 * Requirements:
 * - Bing Search API subscription (Azure)
 * - API key
 * 
 * Example:
 * ```json
 * {
 *   "query": "{topic} news",
 *   "searchType": "news",
 *   "maxResults": 20,
 *   "safeSearch": "moderate"
 * }
 * ```
 */
export const BingSearchNodeDefinition: NodeDefinition = {
  id: 'bing-search',
  name: 'Bing Search',
  category: NodeCategory.API,
  description: 'Search web, images, news, videos using Bing Search API',
  version: '1.0.0',

  inputs: [
    {
      id: 'query',
      name: 'Search Query',
      type: PortType.TEXT,
      description: 'Search query (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter search query...' },
    },
    {
      id: 'apiKey',
      name: 'API Key',
      type: PortType.TEXT,
      description: 'Bing Search API key (or use BING_SEARCH_API_KEY env)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Your Bing API key' },
    },
    {
      id: 'searchType',
      name: 'Search Type',
      type: PortType.TEXT,
      description: 'Type of search',
      required: true,
      defaultValue: 'web',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Web', value: 'web' },
          { label: 'Images', value: 'images' },
          { label: 'News', value: 'news' },
          { label: 'Videos', value: 'videos' },
        ],
      },
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of results (1-50)',
      required: false,
      defaultValue: 10,
      metadata: { inputType: 'number', min: 1, max: 50 },
    },
    {
      id: 'safeSearch',
      name: 'Safe Search',
      type: PortType.TEXT,
      description: 'Safe search filter',
      required: false,
      defaultValue: 'moderate',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Off', value: 'off' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Strict', value: 'strict' },
        ],
      },
    },
    {
      id: 'language',
      name: 'Language',
      type: PortType.TEXT,
      description: 'Search language (e.g., en, es, fr)',
      required: false,
      defaultValue: 'en',
      metadata: { inputType: 'text', placeholder: 'en' },
    },
    {
      id: 'country',
      name: 'Country',
      type: PortType.TEXT,
      description: 'Target country code (e.g., us, gb, ca)',
      required: false,
      defaultValue: 'us',
      metadata: { inputType: 'text', placeholder: 'us' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Search Results',
      type: PortType.JSON,
      description: 'Structured search results',
    },
    {
      id: 'count',
      name: 'Result Count',
      type: PortType.NUMBER,
      description: 'Number of results found',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.query) {
      getInputFromTemplate(config.query as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...BingSearchNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.query as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { results: {}, count: 0 },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      const processedQuery = processTemplate((config.query as string) || '', vars);
      
      if (!processedQuery.trim()) {
        throw new Error('Search query is empty');
      }

      const apiKey = (config.apiKey as string) || process.env.BING_SEARCH_API_KEY;
      
      if (!apiKey) {
        throw new Error('Bing Search API key required');
      }

      const searchType = (config.searchType as string) || 'web';
      const maxResults = Math.min((config.maxResults as number) || 10, 50);
      
      let endpoint = 'https://api.bing.microsoft.com/v7.0/search';
      
      switch (searchType) {
        case 'images':
          endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';
          break;
        case 'news':
          endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';
          break;
        case 'videos':
          endpoint = 'https://api.bing.microsoft.com/v7.0/videos/search';
          break;
      }

      const params = new URLSearchParams({
        q: processedQuery,
        count: maxResults.toString(),
        safeSearch: (config.safeSearch as string) || 'moderate',
        setLang: (config.language as string) || 'en',
        cc: (config.country as string) || 'us',
      });

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Bing Search API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      
      // Format results
      let results = [];
      
      switch (searchType) {
        case 'web':
          results = (data.webPages?.value || []).map((item: any) => ({
            title: item.name,
            description: item.snippet,
            url: item.url,
            displayUrl: item.displayUrl,
          }));
          break;
        case 'images':
          results = (data.value || []).map((item: any) => ({
            title: item.name,
            url: item.contentUrl,
            thumbnailUrl: item.thumbnailUrl,
            width: item.width,
            height: item.height,
          }));
          break;
        case 'news':
          results = (data.value || []).map((item: any) => ({
            title: item.name,
            description: item.description,
            url: item.url,
            datePublished: item.datePublished,
            provider: item.provider?.[0]?.name,
          }));
          break;
        case 'videos':
          results = (data.value || []).map((item: any) => ({
            title: item.name,
            description: item.description,
            url: item.contentUrl,
            thumbnailUrl: item.thumbnailUrl,
            duration: item.duration,
          }));
          break;
      }

      const searchResults = {
        query: processedQuery,
        searchType,
        totalEstimatedMatches: data.webPages?.totalEstimatedMatches || data.totalEstimatedMatches || 0,
        results,
        timestamp: new Date().toISOString(),
      };

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(searchResults), 'bingsearch');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results: searchResults,
          count: results.length
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          query: processedQuery,
          searchType,
          totalResults: results.length
        }
      };
    } catch (error: unknown) {
      console.error('Bing Search node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Bing Search error';

      return {
        outputs: {
          results: { error: errorMessage },
          count: 0
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
