/**
 * Retrieval Node - NEW ARCHITECTURE
 * 
 * Knowledge base retrieval node with explicit input/output ports.
 * Migrated from legacy format to NodeDefinition format.
 * 
 * This node handles:
 * - Vector similarity search
 * - Multi-knowledge base queries
 * - Result filtering and ranking
 * - RAG (Retrieval-Augmented Generation) support
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { RetrievalForm } from './types';
import { searchSimilarContent } from '../../lib/services/vectorSearchService';

/**
 * Retrieval Node Definition
 * 
 * Searches knowledge bases for relevant content using vector similarity.
 * Supports multiple knowledge bases and configurable result limits.
 */
export const RetrievalNodeDefinition: NodeDefinition<RetrievalForm> = {
  // Metadata
  id: 'retrieval',
  name: 'Retrieval',
  category: NodeCategory.DATABASE,
  description: 'Search knowledge bases using vector similarity for RAG workflows',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['retrieval', 'rag', 'knowledge', 'vector', 'search', 'embedding'],

  // Input Ports
  inputs: [
    {
      id: 'query',
      name: 'Query',
      type: PortType.TEXT,
      description: 'Search query text',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 3,
        placeholder: 'Enter search query...',
      },
    },
    {
      id: 'knowledgeIds',
      name: 'Knowledge Bases',
      type: PortType.ARRAY,
      description: 'Array of knowledge base IDs to search',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: '["kb1", "kb2"]',
      },
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of results to return',
      required: false,
      defaultValue: 5,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 50,
      },
    },
    {
      id: 'threshold',
      name: 'Similarity Threshold',
      type: PortType.NUMBER,
      description: 'Minimum similarity score (0-1)',
      required: false,
      defaultValue: 0.7,
      metadata: {
        inputType: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
  ] as InputPort[],

  // Output Ports
  outputs: [
    {
      id: 'results',
      name: 'Results',
      type: PortType.ARRAY,
      description: 'Array of search results with text, source, and relevance',
      required: true,
    },
    {
      id: 'formatted',
      name: 'Formatted Text',
      type: PortType.TEXT,
      description: 'Formatted results as text (for LLM context)',
      required: true,
    },
    {
      id: 'count',
      name: 'Result Count',
      type: PortType.NUMBER,
      description: 'Number of results returned',
      required: false,
    },
    {
      id: 'topScore',
      name: 'Top Score',
      type: PortType.NUMBER,
      description: 'Highest similarity score',
      required: false,
    },
  ] as OutputPort[],

  // Execution Function
  async execute(context: NodeExecutionContext<RetrievalForm>): Promise<NodeExecutionResult> {
    const { config, inputs, flowState, dispatcher } = context;
    const startTime = new Date().toISOString();

    try {
      // Get query from input or flowState
      let query = inputs.query as string;

      // Fallback: try to get from last component output
      if (!query && flowState?.components) {
        const componentIds = Object.keys(flowState.components);
        for (let i = componentIds.length - 1; i >= 0; i--) {
          const comp = flowState.components[componentIds[i]];
          if (comp?.output) {
            query = comp.output;
            break;
          }
        }
      }

      if (!query) {
        throw new Error(
          'No query provided. Connect a text output to the query input or provide query text.'
        );
      }

      // Get knowledge base IDs from input or config
      let knowledgeIds = inputs.knowledgeIds as string[] | undefined;
      if (!knowledgeIds || knowledgeIds.length === 0) {
        knowledgeIds = config.knowledgeIds || [];
      }

      if (!knowledgeIds || knowledgeIds.length === 0) {
        throw new Error(
          'No knowledge base IDs provided. Configure knowledge bases in node settings or connect to knowledge base input.'
        );
      }

      // Get parameters
      const maxResults = (inputs.maxResults as number) || config.maxResults || 5;
      const threshold = (inputs.threshold as number) || config.threshold || 0.7;

      // Search each knowledge base
      const retrievalResults = await Promise.all(
        knowledgeIds.map(async (knowledgeId) => {
          try {
            const result = await searchSimilarContent(query, {
              limit: maxResults,
              similarityThreshold: threshold,
              knowledgeId: knowledgeId,
            });

            return result.results.map((item) => ({
              text: item.content || '',
              source: item.knowledgeId || knowledgeId,
              relevance: item.similarity || 0,
              metadata: {
                chunkId: item.id,
                knowledgeId: item.knowledgeId,
              },
            }));
          } catch (error) {
            console.error(`Failed to search knowledge base ${knowledgeId}:`, error);
            return [];
          }
        })
      );

      // Flatten and sort by relevance
      const allResults = retrievalResults
        .flat()
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults);

      // Format results as text
      const formattedResults = allResults
        .map((result, index) => {
          return `[${index + 1}] ${result.text}\nSource: ${result.source}\nRelevance: ${(result.relevance * 100).toFixed(1)}%`;
        })
        .join('\n\n');

      // Calculate metrics
      const count = allResults.length;
      const topScore = allResults.length > 0 ? allResults[0].relevance : 0;

      // Update flow state through dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(context.node.id, formattedResults, 'retrieval');
        dispatcher.setCurrentNode(context.node);
      }

      return {
        outputs: {
          results: allResults,
          formatted: formattedResults,
          count,
          topScore,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          queryLength: query.length,
          knowledgeBaseCount: knowledgeIds.length,
          resultCount: count,
          topScore,
          averageScore: count > 0 ? allResults.reduce((sum, r) => sum + r.relevance, 0) / count : 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          results: [],
          formatted: '',
          count: 0,
          topScore: 0,
        },
        status: 'error',
        error: `Retrieval failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default RetrievalNodeDefinition;
