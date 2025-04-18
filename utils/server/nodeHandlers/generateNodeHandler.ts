import { FlowNode, GenerateNodeData } from '../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../types/flowExecutionTypes';
import { processTemplate } from '../templateProcessor';
import { findNextNode } from '@utils/server/findNextNode';
import { prisma } from '../../../lib/prisma';

/**
 * Handler for executing Generate nodes
 */
export async function executeGenerateNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as GenerateNodeData;
  // Ensure form exists with a default empty object
  const form = data.form || {};

  try {
    // Enhance variables with context before processing prompt
    const enhancedVariables = {
      ...flowState.variables,
      // Make retrieved context and user input directly available in the prompt template
      context: flowState.variables.retrievalContext || '',
      question: flowState.variables.lastUserInput || flowState.variables.userInput || '',
    };

    // Process the prompt template with enhanced variables
    const prompt = processTemplate(form.prompt || '', enhancedVariables);

    // Get model ID
    const modelId = form.model;

    if (!modelId) throw new Error('No AI model specified in the form');

    // Fetch the model details directly from the database
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true },
    });

    if (!model) throw new Error('Model not found in the database');
    if (!model.provider) throw new Error('Provider not found for this model');

    let aiResponse = '';
    try {
      switch (model.provider.providerType) {
        case 'openai':
          aiResponse = await callOpenAIAPI(model.provider, model, prompt);
          break;

        case 'openai-compatible':
          aiResponse = await callCustomAPI(model.provider, model, prompt);
          break;
        default:
          return {
            status: 'error',
            message: `Unsupported provider type: ${model.provider.providerType}`,
            flowState,
            nodeInfo: {
              id: node.id,
              name: node.data?.label || node.id,
              type: 'generate',
              role: 'developer',
            },
            execution: {
              output: `Unsupported provider type: ${model.provider.providerType}`,
              nodeId: node.id,
              nodeName: node.data?.label || node.id,
              startTime: new Date().toISOString(),
            },
          };
      }
    } catch (error) {
      throw new Error(`Error calling API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!flowState.components[node.id]) flowState.components[node.id] = {};
    flowState.components[node.id]['output'] = aiResponse;
    flowState.components[node.id]['type'] = 'generate';

    // Find the next node
    const nextNodeId = findNextNode(flow, node.id);

    if (!nextNodeId) throw new Error(`At the Node ${node.data.label} next node found in the flow`);

    return {
      status: 'in_progress',
      nextNodeId,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'generate',
        role: 'assistant',
      },
      execution: {
        output: aiResponse,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      ...(options?.stop && { stop: options.stop }),
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
  // Prepare request body based on provider configuration

  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },

    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Custom API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
