import { NextApiRequest, NextApiResponse } from 'next';
import { llmOpenAI } from '../../../llm/openai';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate the request
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({ error: 'providerId are required' });
    }
    const provider = await prisma.lLMProvider.findUnique({
      where: { id: providerId },
      include: {
        models: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    // Use llmOpenAI.models on the server side
    const models = await llmOpenAI.models(provider.endpointUrl, provider.apiKey);

    return res.status(200).json(models.flatMap((x) => ({ ...x, id: x.id.replace('models/', '') })));
  } catch (error: any) {
    console.error('Error fetching OpenAI models:', error);
    return res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message || 'Unknown error',
    });
  }
}
