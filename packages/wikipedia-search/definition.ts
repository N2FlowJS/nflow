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
 * Wikipedia Search Node Definition
 * 
 * Search and retrieve Wikipedia articles.
 * No API key required - uses public Wikipedia API.
 * 
 * Configuration:
 * - query: Search query (supports {variable} templates)
 * - language: Wikipedia language edition (en, es, fr, de, etc.)
 * - maxResults: Maximum results (1-20, default: 5)
 * - summaryOnly: Return only summaries (vs full HTML)
 * 
 * Features:
 * - No API key required
 * - Multi-language support
 * - Article summaries
 * - Direct page lookup
 * - Search with fallback
 * 
 * Example:
 * ```json
 * {
 *   "query": "{topic}",
 *   "language": "en",
 *   "maxResults": 5,
 *   "summaryOnly": true
 * }
 * ```
 */
export const WikipediaSearchNodeDefinition: NodeDefinition = {
  id: 'wikipedia-search',
  name: 'Wikipedia Search',
  category: NodeCategory.API,
  description: 'Search Wikipedia articles (no API key required)',
  version: '1.0.0',

  inputs: [
    {
      id: 'query',
      name: 'Search Query',
      type: PortType.TEXT,
      description: 'Search query or article title (supports {variable})',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter article title or search query...' },
    },
    {
      id: 'language',
      name: 'Language',
      type: PortType.TEXT,
      description: 'Wikipedia language edition (en, es, fr, de, ja, etc.)',
      required: false,
      defaultValue: 'en',
      metadata: { inputType: 'text', placeholder: 'en' },
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of articles (1-20)',
      required: false,
      defaultValue: 5,
      metadata: { inputType: 'number', min: 1, max: 20 },
    },
    {
      id: 'summaryOnly',
      name: 'Summary Only',
      type: PortType.BOOLEAN,
      description: 'Return only text summaries (no HTML)',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Articles',
      type: PortType.TEXT,
      description: 'Formatted article summaries',
    },
    {
      id: 'data',
      name: 'Articles Data',
      type: PortType.JSON,
      description: 'Structured article data',
    },
    {
      id: 'count',
      name: 'Article Count',
      type: PortType.NUMBER,
      description: 'Number of articles found',
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

    return [...WikipediaSearchNodeDefinition.inputs, ...dynamicPorts];
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
      const language = (config.language as string) || 'en';
      const maxResults = Math.min((config.maxResults as number) || 5, 20);

      let articles: any[] = [];

      // Try direct page lookup first
      try {
        const searchUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(processedQuery)}`;
        const directResponse = await fetch(searchUrl);
        
        if (directResponse.ok) {
          const pageData = await directResponse.json();
          if (pageData.type === 'standard') {
            articles.push({
              title: pageData.title,
              description: pageData.extract,
              url: pageData.content_urls?.desktop?.page || 
                   `https://${language}.wikipedia.org/wiki/${encodeURIComponent(pageData.title)}`,
              thumbnail: pageData.thumbnail?.source
            });
          }
        }
      } catch (error) {
        console.log('Direct page lookup failed, using search API');
      }

      // If no direct match, use search API
      if (articles.length === 0) {
        const apiUrl = `https://${language}.wikipedia.org/w/api.php`;
        const searchParams = new URLSearchParams({
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: processedQuery,
          srlimit: maxResults.toString(),
          origin: '*'
        });

        const searchResponse = await fetch(`${apiUrl}?${searchParams}`);
        
        if (!searchResponse.ok) {
          throw new Error(`Wikipedia API error (${searchResponse.status})`);
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.query?.search || [];

        // Get summaries for search results
        for (const result of searchResults.slice(0, maxResults)) {
          try {
            const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`;
            const summaryResponse = await fetch(summaryUrl);
            
            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();
              articles.push({
                title: summaryData.title,
                description: config.summaryOnly 
                  ? summaryData.extract 
                  : (summaryData.extract_html || summaryData.extract),
                url: summaryData.content_urls?.desktop?.page || 
                     `https://${language}.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
                thumbnail: summaryData.thumbnail?.source
              });
            }
          } catch (error) {
            console.log(`Failed to get summary for ${result.title}`);
          }
        }
      }

      // Format results
      const resultText = articles.length > 0 
        ? articles.map((article: any, index: number) => 
            `[${index + 1}] ${article.title}\n${article.description}\nURL: ${article.url}\n`
          ).join('\n')
        : 'No Wikipedia articles found.';

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'wikipediasearch');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results: resultText,
          data: articles,
          count: articles.length
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          query: processedQuery,
          language,
          articlesFound: articles.length
        }
      };
    } catch (error: unknown) {
      console.error('Wikipedia Search node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Wikipedia error';

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
