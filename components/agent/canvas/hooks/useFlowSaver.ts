import { message } from 'antd';
import { useCallback } from 'react';
import { FlowNode } from '../../../../models/flowTypes';
import { saveFlowConfig } from '../../../../services/agentService';

export const useFlowSaver = (agentId: string | undefined, nodes: FlowNode[], edges: any[]) => {
  return useCallback(async () => {
    if (!agentId) {
      message.error('Agent ID is missing');
      return;
    }
    try {
      const flow = { nodes, edges };
      await saveFlowConfig(agentId, flow);
      message.success('Flow saved successfully');
    } catch (error: unknown) {
      console.error('Error saving flow:', error);
      message.error('Failed to save flow');
    }
  }, [agentId, nodes, edges]);
};
