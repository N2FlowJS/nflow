import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ExcelAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  operation: 'read_sheets' | 'analyze_data' | 'pivot_table' | 'chart_data' | 'validate_formulas';
  sheetName?: string;
  cellRange?: string;
  includeFormulas?: boolean;
  skipEmptyRows?: boolean;
  dataTypes?: { [column: string]: 'string' | 'number' | 'date' | 'boolean' };
}

export type ExcelAnalysisNodeData = BaseNodeData<ExcelAnalysisForm> & {
  type: 'excelanalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    ExcelAnalysisNodeData: ExcelAnalysisNodeData;
  }
}
