import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import llm, { SupportedProvider } from '../../../llm/llm';
import { MessagePart } from '../../../models/MessagePart';

/**
 * API handler for testing LLM providers.
 *
 * This handler supports the following HTTP methods:
 * - `POST`: Tests a connection to an LLM provider.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### POST Method:
 * Tests a connection to an LLM provider by sending a simple message and receiving a response.
 * Requires authentication via a token in the `Authorization` header.
 *
 * #### Request Body:
 * - `providerId` (string, required): The ID of the provider to test.
 * - `modelId` (string, optional): The ID of a specific model to use for the test.
 * - `message` (string, required): The test message to send to the LLM.
 *
 * #### Response:
 * - `200 OK`: Returns the test result with success status, response text, and metrics.
 * - `400 Bad Request`: If required fields are missing or provider configuration is invalid.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `404 Not Found`: If the provider or model is not found.
 * - `500 Internal Server Error`: If an error occurs during the test.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get token from Authorization header
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { providerId, modelId, message } = req.body;

  if (!providerId || !message) {
    return res.status(400).json({ error: 'Missing providerId or test message' });
  }

  try {
    // Get provider information
    const provider = await prisma.lLMProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (!provider.apiKey) {
      return res.status(400).json({ error: 'Provider has no API key configured' });
    }

    // Get model if specified, or find default for chat
    let modelName = '';

    if (modelId) {
      const model = await prisma.lLMModel.findUnique({
        where: { id: modelId },
      });

      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      modelName = model.name;
    } else {
      // Try to find default chat model for this provider
      const defaultModel = await prisma.lLMModel.findFirst({
        where: {
          providerId: provider.id,
          modelType: 'chat',
        },
      });

      if (defaultModel) {
        modelName = defaultModel.name;
      } else {
        // Try any chat model from this provider
        const anyModel = await prisma.lLMModel.findFirst({
          where: {
            providerId: provider.id,
            modelType: 'chat',
          },
        });

        if (anyModel) {
          modelName = anyModel.name;
        } else {
          return res.status(400).json({ error: 'No suitable model found for testing' });
        }
      }
    }
    // Single-path test using LLM dispatcher for all providers
    const startTime = Date.now();
    const msgs: MessagePart[] = [{ role: 'user', content: message }];
    const providerType = provider.providerType as SupportedProvider;

    try {
      const text = await llm.completions(
        providerType,
        provider.endpointUrl,
        provider.apiKey,
        modelName,
        msgs,
        { temperature: 0.7, maxTokens: 150 }
      );
      const latency = Date.now() - startTime;
      return res.status(200).json({ success: true, response: text || 'No response', latency });
    } catch (e: unknown) {
      const latency = Date.now() - startTime;
      return res.status(200).json({
        success: false,
        error: e instanceof Error ? e.message : 'Network or API error',
        latency,
      });
    }
  } catch (error: unknown) {
    console.error('Error testing LLM provider:', error);
    return res.status(500).json({
      error: 'Failed to test LLM provider',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// No helper functions needed; all providers are routed via LLM dispatcher


