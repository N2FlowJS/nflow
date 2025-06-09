import { prisma } from '../lib/prisma';
import type { FlowState } from '../models/flowExecutionTypes';
import type { MessagePart } from '../models/MessagePart';

/**
 * Persist conversation state to database
 */
type PersistConversationStateOptions = {
  message?: MessagePart;
  flowState: FlowState;
  agentId: string;
  id?: string;
};
export async function saveConversationToDatabase({
  agentId,
  flowState,
  id,
  message,
}: PersistConversationStateOptions): Promise<string> {
  if (!id) {
    const title = message?.content
      ? `Conversation about: ${message?.content.slice(0, 50)}${message?.content.length > 50 ? '...' : ''}`
      : `Conversation ${new Date().toLocaleString()}`;

    const newConversation = await prisma.$transaction(async (tx: any) => {
      const conversation = await tx.conversation.create({
        data: {
          title,
          agentId,
          flowState: flowState,
        },
      });

      if (message?.content) {
        await tx.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            content: message.content,
            role: message.role || 'user',
          },
        });
      }

      return conversation;
    });

    return newConversation.id;
  } else {
    await Promise.all([
      // Update database
      prisma.conversation.update({
        where: { id },
        data: {
          flowState: flowState as any,
          updatedAt: new Date(),
          lastMessageAt: new Date(),
        },
      }),

      message?.content
        ? prisma.conversationMessage.create({
            data: {
              conversationId: id,
              content: message.content,
              role: message.role || 'user',
            },
          })
        : Promise.resolve(),

      flowState.history?.length > 0 && flowState.history[flowState.history.length - 1].output
        ? prisma.conversationMessage.create({
            data: {
              conversationId: id,
              content: flowState.history[flowState.history.length - 1].output!,
              role: 'agent',
              nodeId: flowState.history[flowState.history.length - 1].nodeId,
              nodeType: flowState.history[flowState.history.length - 1].nodeType,
            },
          })
        : Promise.resolve(),
    ]);

    return id;
  }
}
type AddMessageOptions = {
  message: MessagePart;
  conversationId: string;
};
export async function AddMessageToDatabase({ conversationId, message }: AddMessageOptions): Promise<void> {
  await prisma.conversationMessage.create({
    data: {
      conversationId: conversationId,
      content: message.content,
      role: message.role || 'user',
    },
  });
}

export async function getConversationMessages(conversationId: string): Promise<MessagePart[]> {
  const messages = await prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { timestamp: 'asc' },
    select: {
      content: true,
      role: true,
      nodeId: true,
      nodeType: true,
      timestamp: true,
    },
  });

  return messages.map(msg => ({
    content: msg.content,
    role: msg.role as 'user' | 'assistant' | 'system',
  }));
}
