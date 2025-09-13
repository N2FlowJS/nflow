import { NextApiRequest, NextApiResponse } from 'next';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import { searchSimilarContent } from '../../../lib/services/vectorSearchService';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Authenticate user
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { knowledgeId, query, maxResults, threshold } = req.body;

    if (!knowledgeId || !query) {
      res.status(400).json({ error: 'Knowledge ID and query are required' });
      return;
    }

    // Search for similar content
    const result = await searchSimilarContent(query, {
      limit: maxResults || 5,
      similarityThreshold: threshold || 0.7,
      knowledgeId: knowledgeId,
    });

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Transform the results to the expected format
    const formattedResults = result.results.map(item => ({
      text: item.content || "",
      source: item.knowledgeId || "Unknown source",
      relevance: item.similarity || 0
    }));

    res.status(200).json(formattedResults);
    return;
  } catch (error: unknown) {
    console.error('Error retrieving from knowledge base:', error);
    res.status(500).json({ error: 'Error retrieving from knowledge base' });
    return;
  }
}
