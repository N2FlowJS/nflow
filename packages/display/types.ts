import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DisplayForm extends BaseForm {
  name: string;
  description?: string;
  outputFormat: 'text' | 'markdown' | 'html' | 'json';
  showAsModal?: boolean;
  content?: string;
}

export type DisplayNodeData = BaseNodeData<DisplayForm> & { type: 'display' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    DisplayNodeData: DisplayNodeData;
  }
}
