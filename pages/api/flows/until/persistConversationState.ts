import { prisma } from '@lib/prisma';
import type { FlowState } from '../../../../types/flowExecutionTypes';

/**
 * Persist conversation state to database
 */
export async function persistConversationState(flowState: FlowState, agentId: string, id?: string, userInput?: string): Promise<string> {
  // Serialize flow state to JSON string for storage
  const flowStateString = JSON.stringify(flowState);

  // Create a new conversation if no ID is provided
  if (!id) {
    // Generate a title from userInput or a generic one
    const title = userInput ? `Conversation about: ${userInput.slice(0, 50)}${userInput.length > 50 ? '...' : ''}` : `Conversation ${new Date().toLocaleString()}`;

    // Optimize: Use a single transaction for creating conversation and message
    const newConversation = await prisma.$transaction(async (tx) => {
      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          title,
          agentId,
          flowState: flowStateString,
        },
      });

      // Add first entry if there's user input
      if (userInput) {
        await tx.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            content: userInput,
            role: 'user',
          },
        });
      }

      return conversation;
    });

    return newConversation.id;
  } else {
    // Update existing conversation
    // Optimize: Use a Promise.all for parallel operations
    await Promise.all([
      // Update database
      prisma.conversation.update({
        where: { id },
        data: {
          flowState: flowStateString,
          updatedAt: new Date(),
          lastMessageAt: new Date(),
        },
      }),

      // Add user message if provided
      userInput
        ? prisma.conversationMessage.create({
            data: {
              conversationId: id,
              content: userInput,
              role: 'user',
            },
          })
        : Promise.resolve(),

      // Add agent message if output is available
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
