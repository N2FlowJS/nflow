import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ExecPostgresForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timeout?: number;
  maxRows?: number;
  ssl?: boolean;
}
export type ExecPostgresNodeData = BaseNodeData<ExecPostgresForm> & { type: 'exec-postgres' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    ExecPostgresNodeData: ExecPostgresNodeData;
  }
}
