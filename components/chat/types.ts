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

export interface MessageType {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  isTyping?: boolean;
  interface?: MessageInterface;
  nodeId?: string;
  nodeType?: string;
  metadata?: Record<string, any>;
  executionStatus?: NodeExecutionStatus;
  hasError?: boolean;
  errorDetails?: ErrorDetails;
}
