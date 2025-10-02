import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface LogForm extends BaseForm {
  name: string;
  description?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  includeData?: string;
  includeTimestamp: boolean;
  includeNodeInfo: boolean;
}

export type LogNodeData = BaseNodeData<LogForm> & { type: 'log' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    LogNodeData: LogNodeData;
  }
}
