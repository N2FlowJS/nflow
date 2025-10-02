import { prisma } from '../lib/prisma';
import { FlowState } from '../models/flowExecution';

export async function getConversationFlowState(conversationId: string): Promise<FlowState | undefined> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { flowState: true },
    });
    if (conversation && conversation.flowState) {
      return conversation.flowState as any;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving flow state: ${error.message}`);
    }
    throw new Error('Error retrieving flow state: Unknown error');
  }

  return undefined;
}
