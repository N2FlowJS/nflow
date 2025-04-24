import { FlowNode, GenerateNodeData } from '../../../../types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../types/flowExecutionTypes';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { findNextNodes } from '@utils/server/findNextNode';
import { prisma } from '../../../../lib/prisma';
import { isNodeReady } from '../../isNodeReady';
import { MessagePart } from '../../../../types/MessagePart';

/**
 * Handler for executing Generate nodes
 */
export async function executeGenerateNode(node: FlowNode, { flow, flowState, input }: FlowExecutionContext, callback?: (result: ExecutionResult) => void): Promise<ExecutionResult> {
  const data = node.data as GenerateNodeData;
  const form = data.form || {};
  const ready = isNodeReady(node.id, flowState);
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input to generate',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'generate',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input to generate',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: new Date().toISOString(),
      },
    };
  }


  const inputs: string[] = getInputFromTemplate(form.prompt);

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {

    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || "";
    }

  });

  try {

    const prompt = processTemplate(form.prompt || '', vars);
    const message: MessagePart[] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: flowState.variables.userInput.content || 'nothing',
      }
    ]

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
          aiResponse = await callOpenAIAPI(model.provider, model, message);
          break;
        case 'openai-compatible':
          aiResponse = await callCustomAPI(model.provider, model, message);
          break;
        default:
          return {
            nextNodes: [],
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

    flowState.components[node.id]['output'] = aiResponse;
    flowState.components[node.id]['type'] = 'generate';
    flowState.components[node.id]['ready'] = true;
    flowState.currentNode = node;

    // Find the next node
    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) throw new Error(`At the Node ${node.data.label} next node found in the flow`);

    return {
      status: 'in_progress',
      nextNodes,
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
async function callOpenAIAPI(provider: any, model: any, message: MessagePart[], options?: any): Promise<string> {
  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages: message,
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
async function callCustomAPI(provider: any, model: any, message: MessagePart[]): Promise<string> {
  // Prepare request body based on provider configuration

  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },

    body: JSON.stringify({
      model: model.name,
      messages: message,

    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Custom API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
