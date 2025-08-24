import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface CodeForm extends BaseForm {
  name: string;
  description?: string;
  code: string;
  timeout: number;
  allowConsole: boolean;
}

export type CodeNodeData = BaseNodeData<CodeForm> & { type: 'code' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    CodeNodeData: CodeNodeData;
  }
}
