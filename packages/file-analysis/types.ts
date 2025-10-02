import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface FileAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  analysisType: 'metadata' | 'content' | 'structure' | 'security' | 'quality';
  fileTypes?: string[];
  includeHidden?: boolean;
  recursive?: boolean;
  outputFormat?: 'json' | 'csv' | 'xml' | 'text';
}

export type FileAnalysisNodeData = BaseNodeData<FileAnalysisForm> & {
  type: 'fileanalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    FileAnalysisNodeData: FileAnalysisNodeData;
  }
}
