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

    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { knowledgeId, query, limit, threshold } = req.body;

    if (!knowledgeId || !query) {
      return res.status(400).json({ error: 'Knowledge ID and query are required' });
    }

    // Use the search functionality
    const result = await searchSimilarContent(query, {
      limit: limit || 5,
      knowledgeId: knowledgeId,
      similarityThreshold: threshold,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error('Error testing knowledge retrieval:', error);
    return res.status(500).json({ error: 'Error testing knowledge retrieval' });
  }
}
