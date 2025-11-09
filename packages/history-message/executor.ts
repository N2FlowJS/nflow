import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { HistoryMessageForm } from './types';

export class HistoryMessageExecutor extends BaseNodeExecutor<HistoryMessageForm> {
  constructor() {
    super({
      nodeType: 'history-message',
      defaultRole: 'developer',
      checkInputReadiness: false, // No input variables needed
    });
  }

  protected async executeLogic(form: HistoryMessageForm, context: ExecutionContext): Promise<string> {
    const { historyType, userId, conversationId, limit } = form;

    // Import Prisma dynamically
    const { prisma } = await import('../../lib/prisma');

    // Build query filter
    const where: any = {};
    if (historyType === 'user' && userId) {
      where.userId = userId;
    }
    if (historyType === 'conversation' && conversationId) {
      where.conversationId = conversationId;
    }

    // Query messages
    const take = limit ? Number(limit) : 20;
    const messages = await prisma.conversationMessage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take,
    });

    // Map to MessagePart format
    const history = messages.map((msg: any) => ({
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    // Return structured result
    return JSON.stringify({
      history,
      metadata: {
        messageCount: history.length,
        historyType,
        ...(userId && { userId }),
        ...(conversationId && { conversationId }),
      }
    });
  }
}

export const historyMessageExecutor = new HistoryMessageExecutor();
