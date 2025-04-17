import type { EXECUTION_STATUS } from '@utils/server/EXECUTION_STATUS';
import { ExecutionStatusType } from '../../types/flowExecutionTypes';

export interface NodeExecutionStatus {
  nodeId: string;
  nodeName?: string;
  status: ExecutionStatusType;
  startTime?: string;
  endTime?: string;
}

export interface ErrorDetails {
  nodeId: string;
  nodeName?: string;
  message: string;
  stack?: string;
}

export interface MessageInterface {
  type: string;
  template: string;
  fields?: any[];
  options?: any;
}

export interface ExecutionStatus {
  status: EXECUTION_STATUS;
  nodeId?: string;
  nodeName?: string;
}

export type ISender = 'user' | 'assistant' | 'system' | 'developer';
export interface MessageType {
  id: string;
  sender: ISender;
  text: string;
  timestamp: number;
  isTyping?: boolean;
  hasError?: boolean;
  nodeType?: string;
  nodeId?: string;
  executionStatus?: ExecutionStatus;
}
