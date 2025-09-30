import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface HistoryMessageForm extends BaseForm {
  userId?: string;
  conversationId?: string;
  historyType?: 'all' | 'user' | 'conversation';
  limit?: number;
}

export type HistoryMessageNodeData = BaseNodeData<HistoryMessageForm> & { type: 'history-message' };

// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    HistoryMessageNodeData: HistoryMessageNodeData;
  }
}
