import { SearchSimilarResult } from '../lib/services/vectorSearchService';
import { IKnowledge } from '../models/IKnowledge';
import { apiRequest } from './apiUtils';

export const fetchAllKnowledge = async (queryString?: string) => {
  return apiRequest<IKnowledge[]>(`/api/knowledge${queryString || ''}`);
};

export const createKnowledge = async (data: { name: string; description: string }) => {
  return apiRequest<IKnowledge>('/api/knowledge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateKnowledge = async (id: string, data: { name?: string; description?: string }) => {
  return apiRequest<IKnowledge>(`/api/knowledge/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteKnowledge = async (id: string) => {
  return apiRequest<boolean>(`/api/knowledge/${id}`, {
    method: 'DELETE',
  });
};

export const fetchKnowledgeById = async (id: string) => {
  return apiRequest<IKnowledge>(`/api/knowledge/${id}`);
};

/**
 * Test retrieval from a knowledge base with a specific query
 * @param id - Knowledge base ID
 * @param options - Test options including query and parameters
 */
export const testKnowledgeRetrieval = async (
  knowledgeId: string,
  options: {
    query: string;
    limit?: number;
    threshold?: number;
  }
) => {
  return apiRequest<{
    timestamp: number;
    results: SearchSimilarResult[];
    error?: string;
  }>('/api/knowledge/test', {
    method: 'POST',
    body: JSON.stringify({
      knowledgeId,
      query: options.query,
      limit: options.limit || 5,
      threshold: options.threshold
    }),
  });
};

/**
 * Retrieve information from a knowledge base
 */
export async function retrieveFromKnowledgeBase(
  knowledgeId: string,
  query: string,
  options: {
    maxResults?: number;
    threshold?: number;
  } = {}
): Promise<{ text: string; source: string; relevance: number }[]> {
  try {
    return apiRequest<{ text: string; source: string; relevance: number }[]>(
      '/api/knowledge/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          knowledgeId,
          query,
          maxResults: options.maxResults || 5,
          threshold: options.threshold || 0.7
        }),
      }
    );
  } catch (error: unknown) {
    console.error('Error retrieving from knowledge base:', error);
    throw error;
  }
}
