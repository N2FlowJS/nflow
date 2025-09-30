import { prisma } from '../../lib/prisma';

import type { FlowNode } from 'models/nodeDataMap';
import type { ExecutionResult, FlowExecutionContext, FlowStateDispatcher } from '@n2flowjs/flow';
import { HistoryMessageForm } from './types';
import { MessagePart } from 'models/MessagePart';
export async function getChatHistory(form: HistoryMessageForm): Promise<MessagePart[]> {
  // Build Prisma query based on form
  const { userId, conversationId, historyType, limit } = form;
  let where: any = {};
  if (historyType === 'user' && userId) {
    where.userId = userId;
  }
  if (historyType === 'conversation' && conversationId) {
    where.conversationId = conversationId;
  }
  // Default: all messages
  const take = limit ? Number(limit) : 20;
  const messages = await prisma.conversationMessage.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take,
  });
  // Map to MessagePart
  return messages.map((msg: any) => ({
    role: msg.role === 'agent' ? 'assistant' : msg.role,
    content: msg.content,
  }));
}
export async function executeHistoryMessageNode(
  n: FlowNode,
  c: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  // Call getChatHistory with form data
  const form = n.data?.form || {};
  const outputArr = await getChatHistory(form);
  if (dispatcher) {
    dispatcher.setNodeOutput(n.id, outputArr, 'history-message');
    dispatcher.setCurrentNode(n);
  }
  return {
    nextNodes: [],
    status: 'completed',
    message: `Fetched ${outputArr.length} messages`,
    flowState: c.flowState,
    nodeInfo: {
      id: n.id,
      name: n.data?.label || n.id,
      type: 'history-message',
      role: 'developer',
    },
    execution: {
      output: JSON.stringify(outputArr),
      nodeId: n.id,
      nodeName: n.data?.label || n.id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    },
  };
}
