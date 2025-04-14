import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

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
  const payload = verifyToken(token);
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
          isDefault: true,
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

    // Start timer for latency measurement
    const startTime = Date.now();

    // Handle different provider types
    let result;
    switch (provider.providerType) {
      case 'openai':
        result = await testOpenAIProvider(provider.endpointUrl, provider.apiKey, modelName, message);
        break;

      case 'azure':
        result = await testAzureOpenAIProvider(provider.endpointUrl, provider.apiKey, modelName, message, provider.config);
        break;

      case 'anthropic':
        result = await testAnthropicProvider(provider.endpointUrl, provider.apiKey, modelName, message);
        break;

      case 'custom':
        // Assume custom follows OpenAI format
        result = await testOpenAIProvider(provider.endpointUrl, provider.apiKey, modelName, message);
        break;

      default:
        return res.status(400).json({
          error: `Unsupported provider type: ${provider.providerType}`,
        });
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error('Error testing LLM provider:', error);
    return res.status(500).json({
      error: 'Failed to test LLM provider',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Helper functions for testing different provider types
// ...existing code...

// Helper function to test OpenAI provider
async function testOpenAIProvider(endpointUrl: string, apiKey: string, modelName: string, message: string) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${endpointUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Error ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    return {
      success: true,
      response: data.choices[0]?.message?.content || 'No response',
      latency,
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network or API error',
      latency: Date.now() - startTime,
    };
  }
}

// Helper function to test Azure OpenAI provider
async function testAzureOpenAIProvider(endpointUrl: string, apiKey: string, modelName: string, message: string, config: any) {
  const startTime = Date.now();

  try {
    // Azure OpenAI requires a deployment name
    const deploymentName = config?.deploymentName || modelName;

    const response = await fetch(`${endpointUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${config?.apiVersion || '2023-05-15'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Error ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    return {
      success: true,
      response: data.choices[0]?.message?.content || 'No response',
      latency,
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network or API error',
      latency: Date.now() - startTime,
    };
  }
}

// Helper function to test Anthropic provider
async function testAnthropicProvider(endpointUrl: string, apiKey: string, modelName: string, message: string) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${endpointUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: message }],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Error ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    return {
      success: true,
      response: data.content[0]?.text || 'No response',
      latency,
      // Anthropic doesn't provide token counts in the same way
      tokens: {
        input: 0,
        output: 0,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network or API error',
      latency: Date.now() - startTime,
    };
  }
}
