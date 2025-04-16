import { OpenAIExecutionResult } from '@pages/api/flows/type';

/**
 * Execute a flow - handles both starting a new flow and continuing an existing one
 * Uses OpenAI-compatible API conventions
 */
export async function executeFlow(
  agentId: string,
  options: {
    messages?: Array<{ role: string; content: string }>;
    userInput?: string; // Legacy parameter, messages is preferred
    variables?: Record<string, any>;
    stream?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    id?: string; // Updated from conversationId to id
    userId?: string;
    teamId?: string;
  } = {}
): Promise<OpenAIExecutionResult | ReadableStream<Uint8Array>> {
  const { userInput, messages = userInput ? [{ role: 'user', content: userInput }] : [], variables = {}, stream = false, model, temperature, maxTokens, id, userId, teamId } = options;

  try {
    // Build a clean request payload that matches the API expectations
    const requestBody: Record<string, any> = {
      flowId: agentId,
      // Pass message array directly to match OpenAI format
      messages,
      // Only include fields with actual values
      ...(variables && Object.keys(variables).length > 0 && { variables }),
      ...(stream && { stream }),
      ...(model && { model }),
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(id && { id }),
      ...(userId && { userId }),
      ...(teamId && { teamId }),
    };

    // Execute the flow API request
    const response = await fetch('/api/flows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to get detailed error information if available
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

    return {
      status: 'error',
      message: `Failed to execute flow: ${errorMessage}`,
      error: {
        message: errorMessage,
        type: 'api_error',
        code: 'execution_error',
      },
    } as OpenAIExecutionResult;
  }
}
