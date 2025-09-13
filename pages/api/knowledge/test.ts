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

    const { knowledgeId, query, limit, threshold } = req.body;

    if (!knowledgeId || !query) {
      res.status(400).json({ error: 'Knowledge ID and query are required' });
      return;
    }

    // Use the search functionality
    const result = await searchSimilarContent(query, {
      limit: limit || 5,
      knowledgeId: knowledgeId,
      similarityThreshold: threshold,
    });

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json(result);
    return;
  } catch (error: unknown) {
    console.error('Error testing knowledge retrieval:', error);
    res.status(500).json({ error: 'Error testing knowledge retrieval' });
    return;
  }
}
