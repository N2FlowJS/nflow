import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface CsvAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  operation: 'analyze' | 'validate' | 'transform' | 'filter' | 'aggregate';
  delimiter?: string;
  hasHeader?: boolean;
  encoding?: string;
  columns?: string[];
  filterCondition?: string;
  groupBy?: string;
  aggregateFunction?: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

export type CsvAnalysisNodeData = BaseNodeData<CsvAnalysisForm> & {
  type: 'csvanalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    CsvAnalysisNodeData: CsvAnalysisNodeData;
  }
}
