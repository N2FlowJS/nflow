import { apiRequest } from './apiUtils';
import { FlowState } from '../types/flowExecutionTypes';

/**
 * Service for managing conversation persistence via API
 */
export const conversationService = {
  /**
   * Create a new conversation
   */
  async createConversation(
    agentId: string, 
    flowState: FlowState, 
    ownerInfo: { type: 'user' | 'team'; id: string },
    title?: string
  ): Promise<string> {
    const response = await apiRequest<{ id: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        flowState,
        ownerType: ownerInfo.type,
        ownerId: ownerInfo.id,
        title
      }),
    });
    
    return response.id;
  },
  
  /**
   * Update an existing conversation with new flow state
   */
  async updateConversation(
    conversationId: string, 
    flowState: FlowState,
    userInput?: string
  ): Promise<void> {
    await apiRequest(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        flowState,
        userInput
      }),
    });
  },
  
  /**
   * Get a conversation by ID with its messages
   */
  async getConversation(conversationId: string): Promise<{
    conversation: any;
    messages: any[];
    flowState?: FlowState;
  }> {
    return apiRequest(`/api/conversations/${conversationId}`);
  },
  
  /**
   * List recent conversations for a user or team
   */
  async listConversations(options: {
    ownerType: 'user' | 'team';
    ownerId: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { ownerType, ownerId, limit = 10, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      ...(ownerType === 'user' ? { userId: ownerId } : { teamId: ownerId }),
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const response = await apiRequest<{ conversations: any[] }>(`/api/conversations?${queryParams}`);
    return response.conversations;
  },
  
  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiRequest(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Get flow state for a conversation
   */
  async getFlowState(conversationId: string): Promise<FlowState> {
    const response = await apiRequest<{ flowState: FlowState }>(`/api/conversations/${conversationId}/state`);
    return response.flowState;
  }
};
