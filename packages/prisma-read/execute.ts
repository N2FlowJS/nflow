import { FlowNode } from '../../models/flowTypes';
import { PrismaReadNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';
import { prisma } from '../../lib/prisma';

/**
 * Handler for executing Prisma Read nodes
 */
export async function executePrismaReadNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as PrismaReadNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the model/filter template
  const inputs: string[] = getInputFromTemplate(form.filter || '');
  const ready = isNodeReady(inputs, flowState);
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for filter',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'prisma-read',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }

  // Prepare query
  const model = form.model;
  let filter = {};
  if (form.filter) {
    try {
      filter = JSON.parse(processTemplate(form.filter, flowState));
    } catch {
      return {
        nextNodes: [],
        status: 'error',
        message: 'Invalid filter JSON',
        flowState,
        nodeInfo: {
          id: node.id,
          name: node.data?.label || node.id,
          type: 'prisma-read',
          role: 'developer',
        },
        execution: {
          output: 'Invalid filter JSON',
          nodeId: node.id,
          nodeName: node.data?.label || node.id,
          startTime,
          endTime: new Date().toISOString(),
        },
      };
    }
  }
  const limit = form.limit ? Number(form.limit) : 10;

  // Dynamic model access
  // Use (prisma as any) for dynamic model access
  if (!model || typeof (prisma as any)[model]?.findMany !== 'function') {
    return {
      nextNodes: [],
      status: 'error' as const,
      message: `Model '${model}' not found in Prisma client`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'prisma-read',
        role: 'developer',
      },
      execution: {
        output: `Model '${model}' not found in Prisma client`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }

  try {
    const result = await (prisma as any)[model].findMany({
      where: filter,
      take: limit,
    });
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, result, 'prisma-read');
      dispatcher.setCurrentNode(node);
    }
    const nextNodes = findNextNodes(flow, node.id);
    return {
      nextNodes,
      status: 'completed',
      message: `Fetched ${result.length} records from ${model}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'prisma-read',
        role: 'developer',
      },
      execution: {
        output: result,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      nextNodes: [],
      status: 'error' as const,
      message: `Prisma query failed: ${err}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'prisma-read',
        role: 'developer',
      },
      execution: {
        output: String(err),
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}
