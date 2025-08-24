import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface AgentToolsForm extends BaseForm {
  toolIds: string[];
}

export type AgentToolsNodeData = BaseNodeData<AgentToolsForm> & { type: 'agenttools' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    AgentToolsNodeData: AgentToolsNodeData;
  }
}
