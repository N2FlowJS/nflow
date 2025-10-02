import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface MathForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulus' | 'power' | 'average' | 'sqrt' | 'abs' | 'round' | 'min' | 'max';
  // Individual value fields used by executor (templated strings)
  value1?: string;
  value2?: string;
  // Optional array form for bulk operations (not yet used by executor)
  operands?: number[];
  // Decimal precision to round result
  precision?: number;
}

export type MathNodeData = BaseNodeData<MathForm> & { type: 'math' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    MathNodeData: MathNodeData;
  }
}
