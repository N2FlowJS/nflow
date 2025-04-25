import { FlowNode, GenerateNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { findNextNodes } from '@utils/server/findNextNode';
import { prisma } from '../../../../lib/prisma';
import { isNodeReady } from '../../isNodeReady';
import { MessagePart } from '../../../../models/MessagePart';
import OpenAI from 'openai';

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
    // Tạo callback cho stream (nếu có)
    const streamCallback = callback
      ? (partial: string) => {
        callback({
          status: 'waiting',
          nextNodes: [],
          flowState,
          nodeInfo: {
            id: node.id,
            name: node.data?.label || node.id,
            type: 'generate',
            role: 'assistant',
          },
          execution: {
            output: partial,
            nodeId: node.id,
            nodeName: node.data?.label || node.id,
            startTime: new Date().toISOString(),
          },
        });
      }
      : undefined;

    switch (model.provider.providerType) {
      case 'openai':
        aiResponse = await callOpenAIAPI(model.provider, model, message, undefined, streamCallback);
        break;
      case 'openai-compatible':
        aiResponse = await callCustomAPI(model.provider, model, message, undefined, streamCallback);
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
async function callOpenAIAPI(
  provider: any,
  model: any,
  message: MessagePart[],
  options?: any,
  callback?: (result: string) => void
): Promise<string> {
  const openai = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.endpointUrl,
  });

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: model.name,
    messages: message as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens,
    top_p: options?.topP,
    frequency_penalty: options?.frequencyPenalty,
    presence_penalty: options?.presencePenalty,
    stop: options?.stop,
    stream: !!callback,
  };

  if (params.stream) {
    // Stream mode
    const stream = await openai.chat.completions.create(params);
    let result = '';

    for await (const part of stream) {
      const content = part.choices?.[0]?.delta?.content || '';
      if (content) {
        result += content;
        callback && callback(result);
      }
    }

    return result;
  } else {
    // Non-stream mode
    const completion = await openai.chat.completions.create(params);
    return completion.choices[0].message.content || '';
  }
}

/**
 * Call a custom API endpoint
 */
async function callCustomAPI(
  provider: any,
  model: any,
  message: MessagePart[],
  options?: any,
  callback?: (result: string) => void
): Promise<string> {
  const openai = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.endpointUrl,
  });

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: model.name,
    messages: message as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens,
    top_p: options?.topP,
    frequency_penalty: options?.frequencyPenalty,
    presence_penalty: options?.presencePenalty,
    stop: options?.stop,
    stream: !!callback,
  };

  if (params.stream) {
    // Stream mode
    const stream = await openai.chat.completions.create(params);
    let result = '';

    for await (const part of stream) {
      const content = part.choices?.[0]?.delta?.content || '';
      if (content) {
        result += content;
        callback && callback(result);
      }
    }

    return result;
  } else {
    // Non-stream mode
    const completion = await openai.chat.completions.create(params);
    return completion.choices[0].message.content || '';
  }
}


