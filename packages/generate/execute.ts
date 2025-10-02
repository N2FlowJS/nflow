import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, ResultWaiting, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';
import { GenerateNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { prisma } from '../../lib/prisma';
import { MessagePart } from '../../models/MessagePart';
import llm, { SupportedProvider } from 'llm/llm';

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
  const startTime = new Date().toISOString();
  const inputs: string[] = getInputFromTemplate(form.prompt);

  const historyMessages: MessagePart[] =
    form.numberHistory > 0
      ? (history || []).slice(-form.numberHistory).map((msg: MessagePart) => ({
          role: msg.role == 'user' ? 'user' : 'assistant',
          content: msg.content || '',
        }))
      : [];

  if (!isNodeReady(inputs, flowState)) {
    return ResultWaiting(node, flowState, startTime);
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
          console.log('Streaming response:', partial);
          callback({
            status: 'token',
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

    aiResponse = await llm.completions(
      model.provider.providerType as SupportedProvider,
      model.provider.endpointUrl,
      model.provider.apiKey,
      model.name,
      message,
      undefined,
      streamCallback
    );

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
