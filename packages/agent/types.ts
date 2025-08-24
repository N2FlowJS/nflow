import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface AgentForm extends BaseForm {
  systemMessage: string;
  model?: string;
}
export type AgentNodeData = BaseNodeData<AgentForm> & { type: 'agent' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    AgentNodeData: AgentNodeData;
  }
}
