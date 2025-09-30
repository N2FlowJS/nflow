// Node module for history-message plugin
// Exports a function to retrieve chat history from the database

import type { MessagePart } from '../../../models/MessagePart';
import type { HistoryMessageForm } from '../types';
import { prisma } from '../../../lib/prisma';

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

export default { getChatHistory };
