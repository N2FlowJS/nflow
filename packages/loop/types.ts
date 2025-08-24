import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface LoopForm extends BaseForm {
  name: string;
  description?: string;
  loopType: 'array' | 'object' | 'range';
  inputData: string;
  startIndex?: number;
  endIndex?: number;
  stepSize?: number;
  maxIterations: number;
  currentItemVariable: string;
  currentIndexVariable: string;
}

export type LoopNodeData = BaseNodeData<LoopForm> & { type: 'loop' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    LoopNodeData: LoopNodeData;
  }
}
