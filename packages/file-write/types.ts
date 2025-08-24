import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface FileWriteForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  content: string;
  encoding?: 'utf8' | 'base64' | 'binary';
  overwrite?: boolean;
}

export type FileWriteNodeData = BaseNodeData<FileWriteForm> & { type: 'file-write' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    FileWriteNodeData: FileWriteNodeData;
  }
}
