import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface CounterForm extends BaseForm {
  name: string;
  description?: string;
  counterName: string;
  operation: 'increment' | 'decrement' | 'reset' | 'set';
  stepValue: number;
  initialValue: number;
  maxValue?: number;
  minValue?: number;
}

export type CounterNodeData = BaseNodeData<CounterForm> & { type: 'counter' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    CounterNodeData: CounterNodeData;
  }
}
