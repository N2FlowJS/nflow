import { Flow } from '@components/agent/types/flowTypes';
import type { NextApiResponse } from 'next';
import { FlowState } from '../types/flowExecutionTypes';
import { MessagePart } from '../types/MessagePart';

// Modified handler to handle both new and existing flows
export type continueFlowOptions = {
  flow: Flow;
  flowState: FlowState;
  input: MessagePart;
  returnResult?: boolean;
};
