import { prisma } from '@lib/prisma';
import { FlowState } from '@models/flowExecutionTypes';


export async function getConversationFlowState(conversationId: string): Promise<FlowState | undefined> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { flowState: true },
    });
    if (conversation) {
      return JSON.parse(conversation.flowState) as FlowState;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving flow state: ${error.message}`);
    }
    throw new Error('Error retrieving flow state: Unknown error');
  }

  return undefined;
}
