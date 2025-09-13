import { NextApiRequest, NextApiResponse } from 'next';
import llm, { SupportedProvider } from '../../../llm/llm';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate the request
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = await verifyToken(token);
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
    const models = await llm.models(provider.providerType as SupportedProvider, provider.endpointUrl, provider.apiKey);
    // normalize id to strip `models/` prefix if exists
    return res.status(200).json(models.map((x) => ({ ...x, id: String(x.id).replace('models/', '') })));
  } catch (error: unknown) {
    console.error('Error fetching models:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to fetch models',
      message,
    });
  }
}
