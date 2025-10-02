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
 * Google Search Node Definition
 * 
 * Integration with Google Custom Search API.
 * Search the web using Google's powerful search engine.
 * 
 * Configuration:
 * - query: Search query (supports {variable} templates)
 * - apiKey: Google API key (or use GOOGLE_SEARCH_API_KEY env)
 * - searchEngineId: Custom Search Engine ID (or use GOOGLE_SEARCH_ENGINE_ID env)
 * - maxResults: Maximum results (1-10, default: 10)
 * - safeSearch: Safe search level (off, medium, high)
 * - language: Search language (e.g., en, es, fr)
 * - country: Target country (e.g., us, gb, ca)
 * 
 * Requirements:
 * - Google Custom Search API enabled
 * - API key and Search Engine ID
 * 
 * Example:
 * ```json
 * {
 *   "query": "{topic} latest news",
 *   "maxResults": 10,
 *   "safeSearch": "medium",
 *   "language": "en"
 * }
 * ```
 */
export const GoogleSearchNodeDefinition: NodeDefinition = {
  id: 'google-search',
  name: 'Google Search',
  category: NodeCategory.API,
  description: 'Search the web using Google Custom Search API',
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
      id: 'useSystemConfig',
      name: 'Use System Config',
      type: PortType.BOOLEAN,
      description: 'Use environment variables for API credentials',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'apiKey',
      name: 'API Key',
      type: PortType.TEXT,
      description: 'Google API key (if not using system config)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Your Google API key' },
    },
    {
      id: 'searchEngineId',
      name: 'Search Engine ID',
      type: PortType.TEXT,
      description: 'Custom Search Engine ID (if not using system config)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Your Search Engine ID' },
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of results (1-10)',
      required: false,
      defaultValue: 10,
      metadata: { inputType: 'number', min: 1, max: 10 },
    },
    {
      id: 'safeSearch',
      name: 'Safe Search',
      type: PortType.TEXT,
      description: 'Safe search filter',
      required: false,
      defaultValue: 'medium',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Off', value: 'off' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
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
      description: 'Target country (e.g., us, gb, ca)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'us' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Search Results',
      type: PortType.TEXT,
      description: 'Formatted search results',
    },
    {
      id: 'data',
      name: 'Results Data',
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

    return [...GoogleSearchNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.query as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { results: '', data: [], count: 0 },
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

      if (!config.query || String(config.query).trim() === '') {
        throw new Error('No search query specified');
      }

      const processedQuery = processTemplate(config.query as string, vars);

      // Get API configuration
      let apiKey: string;
      let searchEngineId: string;

      if (config.useSystemConfig) {
        apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
        searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
      } else {
        apiKey = (config.apiKey as string) || '';
        searchEngineId = (config.searchEngineId as string) || '';
      }

      if (!apiKey || !searchEngineId) {
        throw new Error('Google Search API key and Search Engine ID are required');
      }

      // Build search URL
      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
      searchUrl.searchParams.append('key', apiKey);
      searchUrl.searchParams.append('cx', searchEngineId);
      searchUrl.searchParams.append('q', processedQuery);
      searchUrl.searchParams.append('num', Math.min((config.maxResults as number) || 10, 10).toString());
      
      if (config.safeSearch) {
        searchUrl.searchParams.append('safe', config.safeSearch as string);
      }
      if (config.language) {
        searchUrl.searchParams.append('lr', `lang_${config.language}`);
      }
      if (config.country) {
        searchUrl.searchParams.append('gl', config.country as string);
      }

      // Execute search
      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Search API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Format results
      const items = data.items || [];
      const formattedResults = items.map((item: any, index: number) => ({
        position: index + 1,
        title: item.title || '',
        description: item.snippet || '',
        url: item.link || '',
        displayLink: item.displayLink || ''
      }));

      const resultText = formattedResults.length > 0 
        ? formattedResults.map((result: any) => 
            `[${result.position}] ${result.title}\n${result.description}\nURL: ${result.url}\n`
          ).join('\n')
        : 'No search results found.';

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'googlesearch');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results: resultText,
          data: formattedResults,
          count: formattedResults.length
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          query: processedQuery,
          totalResults: formattedResults.length
        }
      };
    } catch (error: unknown) {
      console.error('Google Search node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Google Search error';

      return {
        outputs: {
          results: `Error: ${errorMessage}`,
          data: [],
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
