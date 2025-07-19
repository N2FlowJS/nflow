import { FlowNode, GenerateNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { prisma } from '../../../../lib/prisma';
import { isNodeReady } from '../../isNodeReady';
import { MessagePart } from '../../../../models/MessagePart';
import { llmOpenAI } from '../../../../llm/openai';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Generate nodes
 */
export async function executeGenerateNode(
  node: FlowNode,
  { flow, flowState, history }: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as GenerateNodeData;
  const form = data.form || {};

  const inputs: string[] = getInputFromTemplate(form.prompt);

  const historyMessages: MessagePart[] =
    form.numberHistory > 0
      ? (history || []).slice(-form.numberHistory).map((msg: MessagePart) => ({
          role: msg.role == 'user' ? 'user' : 'assistant',
          content: msg.content || '',
        }))
      : [];

  const ready = isNodeReady(inputs, flowState);
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

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    const prompt = processTemplate(form.prompt || '', vars);
    const message: MessagePart[] = [
      {
        role: 'system' as const,
        content: prompt,
      },
      ...historyMessages,
    ]
      .filter((msg: MessagePart) => msg.content && msg.content.trim() !== '')
      .map((msg: MessagePart) => ({
        role: msg.role,
        content: msg.content,
      }));

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
    console.log('Executing LLM model:', {
      model: model.name,
      provider: model.provider.providerType,
      prompt: message,
      nodeId: node.id,
    });
    switch (model.provider.providerType) {
      case 'openai':
        aiResponse = await llmOpenAI.completions(
          model.provider.endpointUrl,
          model.provider.apiKey,
          model.name,
          message,
          undefined,
          streamCallback
        );
        break;
      case 'openai-compatible':
        aiResponse = await llmOpenAI.completions(
          model.provider.endpointUrl,
          model.provider.apiKey,
          model.name,
          message,
          undefined,
          streamCallback
        );
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

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, aiResponse, 'generate');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) throw new Error(`At the Node ${node.data.label} next node found in the flow`);

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
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
  } catch (error: unknown) {
    throw new Error(`Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export type LLMProvider = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ownerType: string;
  providerType: string;
  endpointUrl: string;
  apiKey: string;
  userOwnerId: string | null;
  teamOwnerId: string | null;
};
