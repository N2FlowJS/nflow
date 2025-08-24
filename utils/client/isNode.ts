import { NodeData } from '../../models/flowTypes';


export function isNodeData(data: any): data is NodeData {
  return !!data && typeof data === 'object' && typeof data.type === 'string';
}
