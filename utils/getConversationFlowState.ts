import { prisma } from '@lib/prisma';
import { FlowState } from '../types/flowExecutionTypes';

/**
 * Helper function to retrieve flow state from database
 */

export async function getConversationFlowState(conversationId: string): Promise<FlowState | undefined> {
  try {
    // Directly query database for flow state
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { flowState: true },
    });

    if (conversation) {
      return JSON.parse(conversation.flowState) as FlowState;
    }
  } catch (error) {
    console.error('Error retrieving conversation:', error);
  }

  return undefined;
}
