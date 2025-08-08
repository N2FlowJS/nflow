import { useEffect } from 'react';
import { conversationService } from '../../../../services/conversationService';

export const useConversationStateLoader = (
  activeConversationId: string | undefined,
  setFlowState: (state: any) => void
) => {
  useEffect(() => {
    const loadConversationState = async () => {
      if (activeConversationId) {
        const conversation = await conversationService.getConversation(activeConversationId);
        if (conversation && conversation.flowState) {
          setFlowState(conversation.flowState);
        } else {
          setFlowState(null);
        }
      } else {
        setFlowState(null);
      }
    };
    loadConversationState();
  }, [activeConversationId, setFlowState]);
};
