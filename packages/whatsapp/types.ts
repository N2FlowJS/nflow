import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WhatsAppForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_media' | 'send_template' | 'get_media' | 'mark_read';
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  message?: string;
  mediaId?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export type WhatsAppNodeData = BaseNodeData<WhatsAppForm> & { type: 'whatsapp' };
