import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface InterfaceForm extends BaseForm {
  displayFormat?: 'text' | 'markdown' | 'html';
}
export type InterfaceNodeData = BaseNodeData<InterfaceForm> & { type: 'interface' };

declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    interface: InterfaceNodeData;
  }
}
