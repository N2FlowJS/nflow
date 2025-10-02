import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ExecMssqlForm extends BaseForm {
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
  trustServerCertificate?: boolean;
}
export type ExecMssqlNodeData = BaseNodeData<ExecMssqlForm> & { type: 'execmssql' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    ExecMssqlNodeData: ExecMssqlNodeData;
  }
}
