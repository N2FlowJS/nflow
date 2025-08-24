import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface GenerateForm extends BaseForm {
  prompt: string;
  numberHistory: number;
  model: string;
}

export type GenerateNodeData = BaseNodeData<GenerateForm> & { type: 'generate' };

declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    generate: GenerateNodeData;
  }
}
