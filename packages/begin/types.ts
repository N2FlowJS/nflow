import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface BeginForm extends BaseForm {
  variables: { title: string; dataIndex: number; key: string }[];
}
export type BeginNodeData = BaseNodeData<BeginForm> & { type: 'begin' };

declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    begin: BeginNodeData;
  }
}
