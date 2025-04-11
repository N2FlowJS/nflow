import { apiRequest } from './apiUtils';
import { IKnowledge } from '../types/IKnowledge';
import { searchSimilarContent, SearchSimilarResult } from '@lib/services/vectorSearchService';

export const fetchAllKnowledge = async () => {
  return apiRequest<IKnowledge[]>('/api/knowledge');
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
  // Determine which vector database to use
  const result: {
    timestamp: number;
    results: SearchSimilarResult[];
    error?: string;
  } = await searchSimilarContent(options.query, {
    limit: options.limit || 5,
    knowledgeId: knowledgeId,
  });
  console.log('Retrieval test results:', result);
  return result;
};
