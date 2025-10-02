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
 * DuckDuckGo Search Node Definition
 * 
 * Privacy-focused search using DuckDuckGo Instant Answer API.
 * No API key required - free to use with rate limits.
 * 
 * Configuration:
 * - query: Search query (supports {variable} templates)
 * - maxResults: Maximum results (1-30, default: 10)
 * - safeSearch: Safe search level (off, moderate, strict)
 * - noHTML: Remove HTML tags from results
 * - noRedirect: Disable automatic redirects
 * 
 * Features:
 * - No API key required
 * - Privacy-focused (no tracking)
 * - Instant answers
 * - Related topics
 * 
 * Example:
 * ```json
 * {
 *   "query": "{topic} definition",
 *   "maxResults": 10,
 *   "safeSearch": "moderate",
 *   "noHTML": true
 * }
 * ```
 */
export const DuckGoSearchNodeDefinition: NodeDefinition = {
  id: 'duckgo-search',
  name: 'DuckDuckGo Search',
  category: NodeCategory.API,
  description: 'Privacy-focused search using DuckDuckGo (no API key required)',
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
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of results (1-30)',
      required: false,
      defaultValue: 10,
      metadata: { inputType: 'number', min: 1, max: 30 },
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
      id: 'noHTML',
      name: 'No HTML',
      type: PortType.BOOLEAN,
      description: 'Remove HTML tags from results',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'noRedirect',
      name: 'No Redirect',
      type: PortType.BOOLEAN,
      description: 'Disable automatic redirects',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Search Results',
      type: PortType.JSON,
      description: 'Search results and instant answers',
    },
    {
      id: 'answer',
      name: 'Instant Answer',
      type: PortType.TEXT,
      description: 'Direct answer if available',
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

    return [...DuckGoSearchNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.query as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { results: {}, answer: '' },
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

      const getSafeSearchValue = (level: string) => {
        switch (level) {
          case 'off': return '-2';
          case 'moderate': return '-1';
          case 'strict': return '1';
          default: return '-1';
        }
      };

      // DuckDuckGo Instant Answer API
      const params = new URLSearchParams({
        q: processedQuery,
        format: 'json',
        pretty: '1',
        no_html: config.noHTML ? '1' : '0',
        skip_disambig: '1',
        no_redirect: config.noRedirect ? '1' : '0',
        t: 'nflow', // app name
      });

      const safeSearch = getSafeSearchValue((config.safeSearch as string) || 'moderate');
      if (safeSearch !== '-1') {
        params.append('kp', safeSearch);
      }

      const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error (${response.status})`);
      }

      const data = await response.json();

      // Extract results
      const instantAnswer = data.AbstractText || data.Answer || '';
      const relatedTopics = (data.RelatedTopics || [])
        .filter((topic: any) => topic.Text)
        .slice(0, (config.maxResults as number) || 10)
        .map((topic: any, index: number) => ({
          position: index + 1,
          text: topic.Text,
          url: topic.FirstURL,
        }));

      const searchResults = {
        query: processedQuery,
        instantAnswer,
        heading: data.Heading || '',
        abstract: data.Abstract || '',
        abstractSource: data.AbstractSource || '',
        abstractURL: data.AbstractURL || '',
        relatedTopics,
        timestamp: new Date().toISOString(),
      };

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(searchResults), 'duckgosearch');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results: searchResults,
          answer: instantAnswer
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          query: processedQuery,
          hasInstantAnswer: !!instantAnswer,
          topicsCount: relatedTopics.length
        }
      };
    } catch (error: unknown) {
      console.error('DuckDuckGo Search node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown DuckDuckGo error';

      return {
        outputs: {
          results: { error: errorMessage },
          answer: ''
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
