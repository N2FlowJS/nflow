import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface RewriteForm extends BaseForm {
  name: string;
  description?: string;
  model: string;
  prompt: string;
  numberHistory: number;
  preserveMeaning?: boolean;
  outputStyle?: 'formal' | 'casual' | 'professional' | 'concise' | 'detailed';
}

export type RewriteNodeData = BaseNodeData<RewriteForm> & { type: 'rewrite' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    RewriteNodeData: RewriteNodeData;
  }
}
