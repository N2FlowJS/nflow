import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ConditionForm extends BaseForm {
  name: string;
  description?: string;
  expressions: Array<{
    left: string; // variable or value
    operator:
      | '=='
      | '!='
      | '>'
      | '>='
      | '<'
      | '<='
      | 'contains'
      | 'not_contains'
      | 'starts_with'
      | 'ends_with'
      | 'regex'
      | 'in'
      | 'not_in';
    right: string | number | boolean | Array<string | number | boolean>;
  }>;
  logic: 'all' | 'any';
}

export type ConditionNodeData = BaseNodeData<ConditionForm> & { type: 'condition' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    ConditionNodeData: ConditionNodeData;
  }
}
