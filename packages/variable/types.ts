import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface VariableForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'set' | 'get' | 'delete' | 'append';
  variableName: string;
  variableValue?: string;
  defaultValue?: string;
}

export type VariableNodeData = BaseNodeData<VariableForm> & { type: 'variable' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    VariableNodeData: VariableNodeData;
  }
}
