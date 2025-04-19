import { OpenAIExecutionResult } from '../types/flow';

/**
 * Execute a flow - handles both starting a new flow and continuing an existing one
 * Uses OpenAI-compatible API conventions for the /api/flow endpoint
 */
export async function flowExecutionService(
  agentId: string,
  options: {
    messages?: Array<{ role: string; content: string }>;
    userInput?: string; // Legacy parameter, messages is preferred
    variables?: Record<string, any>;
    stream?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    id?: string; // Conversation ID
  } = {}
): Promise<OpenAIExecutionResult | ReadableStream<Uint8Array>> {
  const { userInput, messages = userInput ? [{ role: 'user', content: userInput }] : [], variables = {}, stream = false, model, temperature, maxTokens, id } = options;

  try {
    // Build request payload that matches the API expectations
    const requestBody: Record<string, any> = {
      flowId: agentId,
      messages,
      // Only include fields with actual values
      ...(variables && Object.keys(variables).length > 0 && { variables }),
      ...(stream && { stream }),
      ...(model && { model }),
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(id && { id }), // Pass conversation ID if available
    };

    // Execute the flow API request
    const response = await fetch('/api/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to get detailed error information
      let errorDetail = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error?.message || (typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData));
      } catch {
        errorDetail = (await response.text()) || `HTTP Error ${response.status}`;
      }

      throw new Error(`API error: ${errorDetail}`);
    }

    // Handle streaming response
    if (stream && response.body) {
      return response.body;
    }

    // Parse standard response
    return (await response.json()) as OpenAIExecutionResult;
  } catch (error) {
    // Format error in OpenAI-compatible format
    console.error('Error executing flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse: OpenAIExecutionResult = {
      id: id || 'unknown',
      created: Math.floor(Date.now() / 1000),
      model: model || 'default',
      object: 'chat.completion',
      choices: [
        {
          index: 0,
          delta: {
            role: 'assistant',
            content: errorMessage,
          },
          finish_reason: 'error',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
      flowState: {
        currentNodeName: 'error',
        currentNodeId: 'error',
        components: {},
        history: [],
        variables: {},
      },
      nodeInfo: {
        id: 'error',
        name: 'error',
        type: 'interface',
        role: 'developer',
      },
    };
    return errorResponse;
  }
}
