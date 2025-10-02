import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface SubAgentForm extends BaseForm {
  agentId: string;
  agentName?: string;
  variables?: { [key: string]: string };
  timeout?: number;
  inheritContext?: boolean;
}
export type SubAgentNodeData = BaseNodeData<SubAgentForm> & { type: 'subagent' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    SubAgentNodeData: SubAgentNodeData;
  }
}
