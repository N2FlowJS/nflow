import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { RetrievalForm } from './types';
import { searchSimilarContent } from '../../lib/services/vectorSearchService';

export class RetrievalExecutor extends BaseNodeExecutor<RetrievalForm> {
  constructor() {
    super({
      nodeType: 'retrieval',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['query'],
    });
  }

  protected async executeLogic(form: RetrievalForm, context: ExecutionContext): Promise<string> {
    const { knowledgeIds, maxResults, threshold } = form;

    // Get query from resolved inputs
    const query = String(context.resolvedInputs.query || '');
    if (!query) {
      throw new Error('No query provided for retrieval');
    }

    // Get knowledge base IDs
    let kbIds = knowledgeIds;
    if (!kbIds || kbIds.length === 0) {
      throw new Error('No knowledge base IDs provided');
    }

    // Search parameters
    const limit = maxResults || 5;
    const similarityThreshold = threshold || 0.7;

    // Search each knowledge base
    const retrievalResults = await Promise.all(
      kbIds.map(async (knowledgeId) => {
        try {
          const result = await searchSimilarContent(query, {
            limit,
            similarityThreshold,
            knowledgeId,
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
      .slice(0, limit);

    // Format results as text
    const formattedResults = allResults
      .map((result, index) => {
        return `[${index + 1}] ${result.text}\nSource: ${result.source}\nRelevance: ${(result.relevance * 100).toFixed(1)}%`;
      })
      .join('\n\n');

    // Calculate metrics
    const count = allResults.length;
    const topScore = allResults.length > 0 ? allResults[0].relevance : 0;

    // Return structured result
    return JSON.stringify({
      results: allResults,
      formatted: formattedResults,
      count,
      topScore,
      metadata: {
        queryLength: query.length,
        knowledgeBaseCount: kbIds.length,
        resultCount: count,
        topScore,
        averageScore: count > 0 ? allResults.reduce((sum, r) => sum + r.relevance, 0) / count : 0,
      }
    });
  }
}

export const retrievalExecutor = new RetrievalExecutor();
