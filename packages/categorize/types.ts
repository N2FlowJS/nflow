import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

// Shared category interface extracted for reuse across components
export interface ICategory {
  name: string;
  description?: string;
  examples?: string[];
  targetNode?: string; // use undefined when absent to align with form typing
}

export interface CategorizeForm extends BaseForm {
  categories: ICategory[];
  defaultCategory: string;
  model: string;
}

export type CategorizeNodeData = BaseNodeData<CategorizeForm> & { type: 'categorize' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    CategorizeNodeData: CategorizeNodeData;
  }
}
