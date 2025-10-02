import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DelayForm extends BaseForm {
  name: string;
  description?: string;
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export type DelayNodeData = BaseNodeData<DelayForm> & { type: 'delay' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    DelayNodeData: DelayNodeData;
  }
}
