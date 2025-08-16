import { AgentNodeData, FlowNode } from '../../models/flowTypes'
import { findNextNodes, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '../@flow'

export async function executeAgentNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as AgentNodeData
  const startTime = new Date().toISOString()

  try {
    // Placeholder logic for now; extend with real agent execution (LLM orchestration etc.)
  const output = data.form?.name || 'agent'

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, output, 'agent')
      dispatcher.setCurrentNode(node)
    } else {
      flowState.components[node.id]['output'] = output
      flowState.components[node.id]['type'] = 'agent'
      flowState.components[node.id]['executionTime'] = Date.now()
      flowState.currentNode = node
    }

    const nextNodes = findNextNodes(flow, node.id)
    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`)
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState,
      nodeInfo: { id: node.id, name: node.data?.label || node.id, type: 'agent', role: 'assistant' },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output,
      },
    }
  } catch (error: any) {
    const errMsg = error?.message || 'Unknown agent error'
    return {
      status: 'error',
      message: errMsg,
      nextNodes: [],
      flowState,
      nodeInfo: { id: node.id, name: node.data?.label || node.id, type: 'agent', role: 'developer' },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output: `Error: ${errMsg}`,
      },
    }
  }
}
