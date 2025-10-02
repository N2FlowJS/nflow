import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface LogAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  logPath: string;
  logFormat: 'apache' | 'nginx' | 'json' | 'csv' | 'custom';
  customPattern?: string;
  analysisType: 'summary' | 'errors' | 'performance' | 'security' | 'trends';
  timeRange?: string;
  filterLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export type LogAnalysisNodeData = BaseNodeData<LogAnalysisForm> & {
  type: 'loganalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    LogAnalysisNodeData: LogAnalysisNodeData;
  }
}
