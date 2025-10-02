import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface TransformForm extends BaseForm {
  name: string;
  description?: string;
  transformType: 'json' | 'text' | 'array' | 'object';
  transformation: string;
  inputData: string;
}

export type TransformNodeData = BaseNodeData<TransformForm> & { type: 'transform' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    TransformNodeData: TransformNodeData;
  }
}
