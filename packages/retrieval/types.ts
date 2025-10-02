import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface RetrievalForm extends BaseForm {
  knowledgeIds: string[];
  maxResults: number;
  threshold: number;
}
export type RetrievalNodeData = BaseNodeData<RetrievalForm> & { type: 'retrieval' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    RetrievalNodeData: RetrievalNodeData;
  }
}
