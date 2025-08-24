import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface SendMailForm extends BaseForm {
  name: string;
  description?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  useSystemConfig?: boolean;
}
export type SendMailNodeData = BaseNodeData<SendMailForm> & { type: 'sendmail' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    SendMailNodeData: SendMailNodeData;
  }
}
