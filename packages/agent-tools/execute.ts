import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { FlowNode,  } from '../../models/flowTypes';
import { findNextNodes } from '@n2flowjs/flow/find-next-node';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { AgentToolsNodeData } from './types';

/**
 * Execute AgentTools node: simply expose selected tool IDs for downstream Agent nodes.
 */
export async function execute(
	node: FlowNode,
	{ flow, flowState }: FlowExecutionContext,
	dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
	const data = node.data as AgentToolsNodeData;
	const form = (data as any).form || {};
	const startTime = new Date().toISOString();

	try {
		const toolIds: string[] = Array.isArray(form.toolIds) ? form.toolIds : [];

		const payload = {
			tools: toolIds,
			count: toolIds.length,
		};
		const outputText = JSON.stringify(payload, null, 2);

		// Update flow state
		let finalState = flowState;
		if (dispatcher) {
			dispatcher.setNodeOutput(node.id, outputText, 'agenttools');
			dispatcher.setCurrentNode(node);
			finalState = dispatcher.getState();
		} else {
			flowState.components[node.id]['output'] = outputText;
			flowState.components[node.id]['type'] = 'agenttools';
			flowState.components[node.id]['executionTime'] = Date.now();
			flowState.currentNode = node;
			finalState = flowState;
		}

		const nextNodes = findNextNodes(flow, node.id);
		if (nextNodes.length === 0) {
			throw new Error(`At the Node ${data.label || node.id} no next node found in the flow`);
		}

		return {
			status: 'in_progress',
			nextNodes,
			flowState: finalState,
			nodeInfo: {
				id: node.id,
				name: data.label || node.id,
				type: 'agenttools',
				role: form.role || 'developer',
			},
			execution: {
				nodeId: node.id,
				nodeName: form.name || data.label || node.id,
				startTime,
				endTime: new Date().toISOString(),
				output: outputText,
			},
		};
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown agent tools error';
		return {
			nextNodes: [],
			status: 'error',
			message: `AgentTools failed: ${errorMessage}`,
			flowState,
			nodeInfo: {
				id: node.id,
				name: data.label || node.id,
				type: 'agenttools',
				role: form.role || 'developer',
			},
			execution: {
				output: `Error: ${errorMessage}`,
				nodeId: node.id,
				nodeName: form.name || data.label || node.id,
				startTime,
				endTime: new Date().toISOString(),
			},
		};
	}
}

export default execute;
