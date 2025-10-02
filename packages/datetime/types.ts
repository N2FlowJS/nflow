import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DateTimeForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'now' | 'format' | 'parse' | 'add' | 'subtract' | 'diff' | 'compare' | 'timezone';
  input?: string; // date string or timestamp
  inputDate?: string; // alias used in existing node component
  format?: string; // desired or current format
  amount?: number; // amount to add/subtract or diff
  unit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  target?: string; // second date for diff/compare
  timezone?: string; // timezone conversion target
}

export type DateTimeNodeData = BaseNodeData<DateTimeForm> & { type: 'datetime' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    DateTimeNodeData: DateTimeNodeData;
  }
}
