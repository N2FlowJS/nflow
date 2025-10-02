import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface ValidateForm extends BaseForm {
  name: string;
  description?: string;
  inputData: string;
  validationType: 'email' | 'url' | 'phone' | 'json' | 'number' | 'date' | 'custom';
  customPattern?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowEmpty?: boolean;
  required?: boolean; // Whether the field must be non-empty
}

export type ValidateNodeData = BaseNodeData<ValidateForm> & { type: 'validate' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    ValidateNodeData: ValidateNodeData;
  }
}
