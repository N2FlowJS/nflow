import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface FileReadForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  encoding?: 'utf8' | 'base64' | 'binary';
  maxSize?: number;
}

export type FileReadNodeData = BaseNodeData<FileReadForm> & { type: 'file-read' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    FileReadNodeData: FileReadNodeData;
  }
}
