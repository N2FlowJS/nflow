import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface PrismaReadForm extends BaseForm {
  name: string;
  description?: string;
  model: string; // Prisma model/table name
  filter?: string; // Optional filter (JSON or template)
  limit?: number;
}

export type PrismaReadNodeData = BaseNodeData<PrismaReadForm> & { type: 'prisma-read' };

// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    PrismaReadNodeData: PrismaReadNodeData;
  }
}
