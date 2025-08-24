import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface CacheForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'set' | 'get' | 'delete' | 'clear';
  cacheKey: string;
  cacheValue?: string;
  ttl: number;
  defaultValue?: string;
}

export type CacheNodeData = BaseNodeData<CacheForm> & { type: 'cache' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    CacheNodeData: CacheNodeData;
  }
}
