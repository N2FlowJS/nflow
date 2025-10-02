import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';

export const HistoryMessageNode: NodeDefinition = {
  id: 'history-message',
  name: 'History Message',
  category: NodeCategory.DATABASE,
  description: 'Retrieves chat history from database based on user, conversation, or all messages',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'history',
      name: 'history',
      type: PortType.ARRAY,
      description: 'Array of message history',
    },
  ],

  getDynamicInputs: () => {
    // No dynamic inputs - history is retrieved from database
    return [];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config } = context;
    const { historyType, userId, conversationId, limit } = config;

    try {
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

      return {
        outputs: {
          history,
        },
        status: 'success',
        metadata: {
          messageCount: history.length,
          historyType,
          ...(userId && { userId }),
          ...(conversationId && { conversationId }),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          history: [],
        },
        status: 'error',
        error: `History retrieval failed: ${errorMessage}`,
        metadata: {
          historyType,
        },
      };
    }
  },
};
