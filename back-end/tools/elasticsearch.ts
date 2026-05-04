import { Client as ElasticClient } from '@elastic/elasticsearch';
import { ToolHandler } from './registry';
import { getNodeFieldValue, trimTrailingSlash } from '../utils/common';
import { embedText } from '../llm';

const compactElasticSource = (source: unknown, vectorField: string): Record<string, unknown> => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return { value: source };
  }

  const vectorFieldLower = String(vectorField || '').toLowerCase();

  const sanitize = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const isLargeNumericArray = value.length > 32 && value.every((item) => typeof item === 'number');
      if (isLargeNumericArray) return undefined;
      return value
        .map((item) => sanitize(item))
        .filter((item) => item !== undefined);
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const rawObj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    Object.entries(rawObj).forEach(([key, nestedValue]) => {
      const keyLower = key.toLowerCase();
      const isVectorLikeKey =
        keyLower === vectorFieldLower ||
        keyLower.includes('embedding') ||
        keyLower.includes('vector');
      if (isVectorLikeKey) return;

      const sanitized = sanitize(nestedValue);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    });

    return result;
  };

  return (sanitize(source) as Record<string, unknown>) || {};
};

export const elasticsearchHandler: ToolHandler = async (node, args, options) => {
  const { toolDef, log } = options;
  const endpoint = String(getNodeFieldValue(node, 'endpoint') || '');
  const index = String(getNodeFieldValue(node, 'index') || '');
  const vectorField = String(getNodeFieldValue(node, 'vectorField') || 'embedding');
  const esApiKey = String(getNodeFieldValue(node, 'apiKey') || '');
  if (!endpoint) return 'Error: Elasticsearch endpoint URL is not configured.';

  const esClient = new ElasticClient({
    node: trimTrailingSlash(endpoint),
    auth: esApiKey ? { apiKey: esApiKey } : undefined,
  });

  let body: Record<string, unknown> = { query: { multi_match: { query: args.query, fields: ['*'] } } };
  
  let embeddingCfg = options.inputs?.['embedding_model']?.[0] as Record<string, any> | undefined;

  if (embeddingCfg?.model && args.query) {
      try {
        const vector = await embedText(
          {
            provider: embeddingCfg.provider || 'Google',
            model: embeddingCfg.model,
            apiKey: String(embeddingCfg.apiKey || ''),
            baseUrl: String(embeddingCfg.baseUrl || ''),
          },
          args.query,
        );
      if (Array.isArray(vector) && vector.length > 0) {
        body = {
          knn: {
            field: vectorField,
            query_vector: vector,
            k: 5,
            num_candidates: 50,
          },
          _source: true,
        };
      }
    } catch (e) {
      log(`[Tool: ${node.data.label}] Embedding failed, fallback to text search: ${String(e)}`);
    }
  }

  try {
    const searchParams: Record<string, unknown> = { ...body };
    if (index) searchParams.index = index;

    const resp = await esClient.search(searchParams as any);
    const data = (resp as { hits?: { hits?: Array<{ _source?: unknown; _score?: number }> } }).hits;
    const hits = data?.hits || [];
    if (hits.length === 0) return 'No results found.';

    const compactHits = hits.slice(0, 5).map((h) => ({
      score: h._score,
      source: compactElasticSource(h._source, vectorField),
    }));

    return JSON.stringify(compactHits);
  } catch (e) {
    return `Error fetching from Elasticsearch: ${String(e)}`;
  }
};
