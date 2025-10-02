import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DecisionCondition {
  input: string;
  operator: string;
  value: string;
}
export interface ConditionGroup {
  conditions: DecisionCondition[];
  logicalOperator: 'AND' | 'OR';
}
export interface DecisionBranch {
  name: string;
  groups: ConditionGroup[];
  groupOperator: 'AND' | 'OR';
  targetNode?: string;
}
export interface DecisionForm extends BaseForm {
  branches: DecisionBranch[];
  defaultTarget: string;
}
export type DecisionNodeData = BaseNodeData<DecisionForm> & { type: 'decision' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    DecisionNodeData: DecisionNodeData;
  }
}
