import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

/**
 * API handler for categorizing text using an LLM model.
 *
 * This handler supports the following HTTP methods:
 * - `POST`: Categorizes text using a specified LLM model.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### POST Method:
 * Categorizes text into one of the provided categories.
 *
 * #### Request Body:
 * - `text` (string, required): The text to categorize.
 * - `categories` (array, required): The categories to choose from.
 * - `modelId` (string, optional): The ID of a specific LLM model to use.
 *
 * #### Response:
 * - `200 OK`: Returns the chosen category and confidence score.
 * - `400 Bad Request`: If required fields are missing or invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `500 Internal Server Error`: If an error occurs during categorization.
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

  const { text, categories, modelId } = req.body;

  if (!text || !categories || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: 'Text and categories array are required' });
  }

  try {
    // Get default chat model if no model specified
    let model;
    if (modelId) {
      model = await prisma.lLMModel.findUnique({
        where: { id: modelId },
        include: { provider: true },
      });
    } else {
      model = await prisma.lLMModel.findFirst({
        where: {
          modelType: 'chat',
          isDefault: true,
          isActive: true,
        },
        include: { provider: true },
      });
    }

    if (!model) {
      return res.status(404).json({ error: 'No suitable model found for categorization' });
    }

    if (!model.provider) {
      return res.status(404).json({ error: 'Provider not found for this model' });
    }

    // Build the prompt for categorization
    const categoriesDescription = categories.map((c) => `- ${c.name}: ${c.description}${c.examples ? `\n  Examples: ${c.examples.join(', ')}` : ''}`).join('\n');

    const prompt = `
I need to categorize the following text into one of these categories:

${categoriesDescription}

Text to categorize:
"""
${text}
"""

Analyze the text and determine which category it belongs to. Respond with ONLY the category name and a confidence score between 0 and 1, in this exact JSON format:
{"category": "category_name", "confidence": 0.95}
`.trim();

    // Process based on provider type
    let responseText = '';

    switch (model.provider.providerType) {
      case 'openai':
        responseText = await callOpenAIAPI(model.provider, model, prompt);
        break;
     
      case 'openai-compatible':
        responseText = await callCustomAPI(model.provider, model, prompt);
        break;
      default:
        return res.status(400).json({ error: `Unsupported provider type: ${model.provider.providerType}` });
    }

    // Parse the JSON response
    try {
      // Extract JSON from potential text (in case LLM adds extra explanation)
      const jsonMatch = responseText.match(/\{[^{]*"category"[^}]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({
          error: 'Failed to parse LLM response',
          rawResponse: responseText,
        });
      }

      const responseJson = JSON.parse(jsonMatch[0]);

      if (!responseJson.category) {
        return res.status(500).json({
          error: 'Invalid response format from LLM',
          rawResponse: responseText,
        });
      }

      // Ensure confidence is a number between 0 and 1
      const confidence = typeof responseJson.confidence === 'number' ? Math.min(Math.max(responseJson.confidence, 0), 1) : 1.0;

      return res.status(200).json({
        category: responseJson.category,
        confidence,
        model: model.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to parse LLM response',
        details: error instanceof Error ? error.message : 'Unknown error',
        rawResponse: responseText,
      });
    }
  } catch (error) {
    console.error('Error categorizing text with LLM:', error);
    return res.status(500).json({
      error: 'Failed to categorize text',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
  const response = await fetch(provider.endpointUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more deterministic categorization
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call a custom API endpoint
 */
async function callCustomAPI(provider: any, model: any, prompt: string): Promise<string> {
  // Get custom configuration
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication if provided
  if (provider.apiKey) {
    const authType = provider.config?.auth_type || 'Bearer';
    headers['Authorization'] = `${authType} ${provider.apiKey}`;
  }

  // Support for custom headers
  if (provider.config?.custom_headers) {
    Object.assign(headers, provider.config.custom_headers);
  }

  // Prepare request body based on provider configuration
  const bodyTemplate = provider.config?.body_template || {
    model: '{{model_name}}',
    prompt: '{{prompt}}',
  };

  // Replace placeholders in body template
  const bodyStr = JSON.stringify(bodyTemplate)
    .replace(/"{{model_name}}"/g, `"${model.name}"`)
    .replace(/"{{prompt}}"/g, `"${prompt.replace(/"/g, '\\"')}"`);

  const body = JSON.parse(bodyStr);

  const response = await fetch(provider.endpointUrl + '/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Custom API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();

  // Extract response content based on response_path configuration
  const responsePath = provider.config?.response_path || 'response';
  return extractValueByPath(data, responsePath);
}

/**
 * Helper to extract a value from an object using a dot-notation path
 */
function extractValueByPath(obj: any, path: string): string {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);
}
