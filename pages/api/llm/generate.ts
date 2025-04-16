import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

/**
 * API handler for generating text using an LLM model.
 *
 * This handler supports the following HTTP methods:
 * - `POST`: Generates text using a specific LLM model.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### POST Method:
 * Generates text using a specified LLM model.
 *
 * #### Request Body:
 * - `modelId` (string, required): The ID of the LLM model to use.
 * - `prompt` (string, required): The prompt to send to the model.
 * - `options` (object, optional): Additional generation options.
 *
 * #### Response:
 * - `200 OK`: Returns the generated text.
 * - `400 Bad Request`: If required fields are missing or invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the model or provider is not found.
 * - `500 Internal Server Error`: If an error occurs during generation.
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

  const { modelId, prompt, options } = req.body;

  if (!modelId || !prompt) {
    return res.status(400).json({ error: "Model ID and prompt are required" });
  }

  try {
    // Fetch the model details
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: {
        provider: true
      }
    });
    
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    
    if (!model.provider) {
      return res.status(404).json({ error: "Provider not found for this model" });
    }
    
    if (!model.isActive) {
      return res.status(400).json({ error: "This model is not active" });
    }
    
    // Process the request based on provider type
    let responseText = '';
    
    switch (model.provider.providerType) {
      case 'openai':
        responseText = await callOpenAIAPI(model.provider, model, prompt, options);
        break;
      case 'azure':
        responseText = await callAzureOpenAIAPI(model.provider, model, prompt, options);
        break;
      case 'custom':
        responseText = await callCustomAPI(model.provider, model, prompt, options);
        break;
      default:
        return res.status(400).json({ error: `Unsupported provider type: ${model.provider.providerType}` });
    }
    
    return res.status(200).json({
      text: responseText,
      model: model.name,
      provider: model.provider.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating text with LLM:", error);
    return res.status(500).json({ 
      error: "Failed to generate text",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  const response = await fetch(provider.endpointUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      ...(options?.stop && { stop: options.stop })
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call the Azure OpenAI API
 */
async function callAzureOpenAIAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  const deploymentName = model.config?.deployment_name || model.name;
  const apiVersion = provider.config?.api_version || '2023-05-15';
  
  const response = await fetch(`${provider.endpointUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': provider.apiKey
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      ...(options?.stop && { stop: options.stop })
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Azure OpenAI API error (${response.status}): ${errorData}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call a custom API endpoint
 */
async function callCustomAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  // Get custom configuration
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
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
    model: "{{model_name}}", 
    prompt: "{{prompt}}" 
  };
  
  // Replace placeholders in body template
  let bodyStr = JSON.stringify(bodyTemplate)
    .replace(/"{{model_name}}"/g, `"${model.name}"`)
    .replace(/"{{prompt}}"/g, `"${prompt.replace(/"/g, '\\"')}"`);
  
  // Add options if configured
  if (options) {
    Object.keys(options).forEach(key => {
      bodyStr = bodyStr.replace(new RegExp(`"{{${key}}}"`, 'g'), 
        options[key] !== undefined ? String(options[key]) : 'null');
    });
  }
  
  const body = JSON.parse(bodyStr);
  
  const response = await fetch(provider.endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
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
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
}
