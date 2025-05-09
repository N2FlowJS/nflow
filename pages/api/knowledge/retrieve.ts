import { NextApiRequest, NextApiResponse } from 'next';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import { searchSimilarContent } from '../../../lib/services/vectorSearchService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Authenticate user
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { knowledgeId, query, maxResults, threshold } = req.body;

    if (!knowledgeId || !query) {
      return res.status(400).json({ error: 'Knowledge ID and query are required' });
    }

    // Search for similar content
    const result = await searchSimilarContent(query, {
      limit: maxResults || 5,
      similarityThreshold: threshold || 0.7,
      knowledgeId: knowledgeId,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Transform the results to the expected format
    const formattedResults = result.results.map(item => ({
      text: item.content || "",
      source: item.knowledgeId || "Unknown source",
      relevance: item.similarity || 0
    }));

    return res.status(200).json(formattedResults);
  } catch (error: unknown) {
    console.error('Error retrieving from knowledge base:', error);
    return res.status(500).json({ error: 'Error retrieving from knowledge base' });
  }
}
