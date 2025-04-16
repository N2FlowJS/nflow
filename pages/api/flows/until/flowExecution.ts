import { NextApiResponse } from 'next';
import { Flow } from '../../../../components/agent/types/flowTypes';
import { isBeginNodeData, isCategorizeNodeData, isGenerateNodeData, isInterfaceNodeData, isRetrievalNodeData } from '../../../../components/agent/util';
import { ExecutionResult, FlowExecutionContext, FlowState } from '../../../../types/flowExecutionTypes';
import { executeBeginNode, executeCategorizeNode, executeGenerateNode, executeInterfaceNode, executeRetrievalNode } from './nodeHandlers';

type ExecutionModeOptions = {
  stream?: boolean;
  streamController?: ReadableStreamController<Uint8Array>;
};

/**
 * Simple stream controller with error handling and batching
 */
class StreamManager {
  private encoder = new TextEncoder();
  private isClosed = false;
  private buffer: string[] = [];
  
  constructor(private controller?: ReadableStreamController<Uint8Array>) {}
  
  write(data: any): boolean {
    if (this.isClosed || !this.controller) return false;
    
    try {
      // Convert to string if needed
      const content = typeof data === 'string' ? data : JSON.stringify(data);
      this.buffer.push(content);
      
      // Auto-flush if buffer gets large
      if (this.buffer.length >= 3) this.flush();
      return true;
    } catch (e) {
      return false;
    }
  }
  
  flush(): boolean {
    if (this.isClosed || !this.controller || this.buffer.length === 0) return false;
    
    try {
      const data = this.buffer.join('');
      this.controller.enqueue(this.encoder.encode(data));
      this.buffer = [];
      return true;
    } catch (e) {
      this.isClosed = true;
      return false;
    }
  }
  
  close(): void {
    if (this.isClosed) return;
    
    try {
      this.flush();
      if (this.controller) this.controller.close();
      this.isClosed = true;
      this.controller = undefined;
    } catch (e) {
      this.isClosed = true;
    }
  }
}

/**
 * Simplified flow execution with streaming support
 */
export async function continueExecutionWithOptions(
  res: NextApiResponse, 
  flow: Flow, 
  flowState: FlowState, 
  currentResult: ExecutionResult, 
  options: ExecutionModeOptions = {}
): Promise<void> {
  // Create stream manager if needed
  const stream = options.stream && options.streamController 
    ? new StreamManager(options.streamController) 
    : null;

  try {
    // Send current progress if streaming
    if (stream && currentResult.output) {
      stream.write({
        type: 'progress',
        nodeId: flowState.currentNodeId,
        output: currentResult.output,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle waiting for input
    if (currentResult.status === 'waiting_for_input') {
      if (stream) {
        stream.write({
          type: 'waiting_for_input',
          nodeId: flowState.currentNodeId,
          flowState,
        });
        stream.close();
      }
      res.status(200).json(currentResult);
      return;
    }

    // Add output to history if available
    if (currentResult.output && currentResult.nextNodeId) {
      flowState.history.push({
        nodeId: flowState.currentNodeId,
        output: currentResult.output,
        timestamp: new Date().toISOString(),
      });
    }

    // Process next node if available
    if (currentResult.nextNodeId) {
      flowState.currentNodeId = currentResult.nextNodeId;
      const nextNode = flow.nodes.find(node => node.id === flowState.currentNodeId);

      if (!nextNode) {
        const error = {
          status: 'error',
          message: `Node not found: ${flowState.currentNodeId}`,
          flowState,
        };
        
        if (stream) {
          stream.write({ type: 'error', ...error });
          stream.close();
        }
        
        return res.status(400).json(error);
      }

      // Execute the node
      try {
        if (stream) {
          stream.write({
            type: 'node_start',
            nodeId: nextNode.id,
            nodeType: nextNode.type,
            timestamp: new Date().toISOString(),
          });
        }

        // Create execution context
        const context: FlowExecutionContext = { flow, flowState, userInput: undefined };
        
        // Execute node based on type
        const result = await executeNodeByType(nextNode, context);
        
        if (!result) {
          throw new Error(`Failed to execute node: ${nextNode.id}`);
        }
        
        // Continue execution
        return await continueExecutionWithOptions(res, flow, flowState, result, options);
      } catch (error) {
        const errorResult = {
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          flowState,
        };
        
        if (stream) {
          stream.write({ type: 'error', ...errorResult });
          stream.close();
        }
        
        return res.status(500).json(errorResult);
      }
    }

    // Mark as completed if no next node
    flowState.completed = true;
    const finalResult = {
      status: 'completed',
      flowState,
      output: currentResult.output,
    };

    if (stream) {
      stream.write({ type: 'completed', ...finalResult });
      stream.close();
    }

    return res.status(200).json(finalResult);
  } catch (error) {
    const errorResult = {
      status: 'error',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
    };
    
    if (stream) {
      stream.write({ type: 'error', ...errorResult });
      stream.close();
    }
    
    return res.status(500).json(errorResult);
  }
}

/**
 * Execute node based on its type
 */
async function executeNodeByType(node: any, context: FlowExecutionContext): Promise<ExecutionResult> {
  if (isBeginNodeData(node.data)) {
    return await executeBeginNode(node, context);
  } else if (isInterfaceNodeData(node.data)) {
    return await executeInterfaceNode(node, context);
  } else if (isGenerateNodeData(node.data)) {
    return await executeGenerateNode(node, context);
  } else if (isCategorizeNodeData(node.data)) {
    return await executeCategorizeNode(node, context);
  } else if (isRetrievalNodeData(node.data)) {
    return await executeRetrievalNode(node, context);
  }
  
  return {
    status: 'error',
    message: `Unsupported node type: ${node.type}`,
    flowState: context.flowState,
    nodeInfo: { id: node.id, name: node.data?.label || node.id, type: node.type }
  };
}

/**
 * Creates a streaming response for flow execution
 */
export function createStreamingResponse(flow: Flow, flowState: FlowState, currentResult: ExecutionResult): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const mockRes = {
        status: () => ({ json: () => mockRes }) 
      } as unknown as NextApiResponse;
      
      await continueExecutionWithOptions(mockRes, flow, flowState, currentResult, {
        stream: true,
        streamController: controller,
      });
    },
    cancel() { /* Stream was cancelled */ }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    },
  });
}

// Constants for flow execution
export const NODE_TYPES = {
  BEGIN: 'begin',
  INTERFACE: 'interface',
  GENERATE: 'generate',
  CATEGORIZE: 'categorize',
  RETRIEVAL: 'retrieval',
  USER: 'user',
};

export const EXECUTION_STATUS = {
  IN_PROGRESS: 'in_progress',
  WAITING_FOR_INPUT: 'waiting_for_input',
  COMPLETED: 'completed',
  ERROR: 'error',
};

/**
 * Find the next node in a flow by following edges
 */
export function findNextNode(flow: Flow, currentNodeId: string, edgeSelector?: string): string | null {
  // Find all edges that start from the current node
  const edges = flow.edges.filter((edge) => edge.source === currentNodeId);

  if (edges.length === 0) {
    return null;
  }

  // If we need to select a specific edge (e.g., for categorize nodes)
  if (edgeSelector) {
    const selectedEdge = edges.find((edge) => edge.sourceHandle === `out-${edgeSelector}`);
    return selectedEdge ? selectedEdge.target : null;
  }

  // Just use the first edge if no selector specified
  return edges[0].target;
}

/**
 * Determine if we should stop at a node type
 */
export function shouldStopAtNode(nodeType: string, stopAtInterfaceNode: boolean): boolean {
  return stopAtInterfaceNode && nodeType === NODE_TYPES.INTERFACE;
}

/**
 * Check if we've completed a full conversation cycle
 */
export function hasCompletedCycle(flowState: FlowState): boolean {
  if (!flowState.conversationState) return false;

  return flowState.conversationState.hasReachedFirstInterface && flowState.conversationState.interfaceNodeCount > 1;
}

/**
 * Add a history entry to the flow state
 */
export function addToHistory(
  flowState: FlowState,
  entry: {
    nodeId: string;
    nodeType: string;
    output?: string;
    input?: string;
    message?: string;
    interfacePosition?: 'start' | 'end';
  }
): void {
  flowState.history.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Format an execution result with proper status mappings
 */
export function formatExecutionResult(status: string, message: string, output?: string, flowState?: FlowState): ExecutionResult {
  return {
    status: status as any,
    message,
    output,
    flowState,
  };
}

/**
 * Clone flow state to avoid mutation issues
 */
export function cloneFlowState(flowState: FlowState): FlowState {
  return JSON.parse(JSON.stringify(flowState));
}

/**
 * Execute any type of node based on its type
 * Dispatches to the appropriate specific handler
 */
export async function executeNode(node: any, context: FlowExecutionContext): Promise<ExecutionResult | null> {
  try {
    if (isBeginNodeData(node.data)) {
      return await executeBeginNode(node, context);
    } else if (isInterfaceNodeData(node.data)) {
      return await executeInterfaceNode(node, context);
    } else if (isGenerateNodeData(node.data)) {
      return await executeGenerateNode(node, context);
    } else if (isCategorizeNodeData(node.data)) {
      return await executeCategorizeNode(node, context);
    } else if (isRetrievalNodeData(node.data)) {
      return await executeRetrievalNode(node, context);
    }
    
    // No handler found for this node type
    return {
      status: 'error',
      message: `Unsupported node type: ${node.type}`,
      flowState: context.flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: node.type
      }
    };
  } catch (error) {
    console.error(`Error executing node (${node.type}):`, error);
    return {
      status: 'error',
      message: `Error executing node: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState: context.flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: node.type
      }
    };
  }
}

/**
 * Continue execution of a flow through chain of nodes
 */
export async function continueExecution(
  res: any, 
  flow: any, 
  flowState: FlowState, 
  result: ExecutionResult
): Promise<void> {
  try {
    // Skip if no next node ID
    if (!result.nextNodeId) {
      // If streaming, send only the result with nodeInfo to track progress
      if (res.write && typeof res.write === 'function') {
        // Fix: Create a copy of result without the output property (if it exists)
        const { output, ...progress } = result as Partial<ExecutionResult & { output?: string }>;
        
        // Only send output for interface nodes or if there's an error
        if (output && (result.nodeInfo?.type === 'interface' || result.status === 'error')) {
          // Add output back if needed
          (progress as any).output = output;
        }
        
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      } else {
        res.status(200).json(result);
      }
      return;
    }

    // Get the next node
    const nextNode = flow.nodes.find((node: any) => node.id === result.nextNodeId);
    if (!nextNode) {
      const errorResult: ExecutionResult = {
        status: 'error',
        message: `Node not found: ${result.nextNodeId}`,
        flowState,
      };
      
      if (res.write && typeof res.write === 'function') {
        res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
      } else {
        res.status(404).json(errorResult);
      }
      return;
    }

    // Update flow state with next node
    const updatedFlowState = {
      ...flowState,
      currentNodeId: result.nextNodeId,
      currentNodeType: nextNode.type,
      currentNodeName: nextNode.data?.label || nextNode.id,
    };
    
    // Add result to history if there was output
    if (result.output) {
      updatedFlowState.history.push({
        nodeId: flowState.currentNodeId,
        nodeType: flowState.currentNodeType,
        output: result.output,
        timestamp: new Date().toISOString(),
        status: result.status === 'error' ? 'error' : 'success',
      });
    }

    // If streaming, send execution progress
    if (res.write && typeof res.write === 'function') {
      // Create a progress update
      const progressUpdate = {
        status: 'in_progress',
        nodeInfo: {
          id: nextNode.id,
          name: nextNode.data?.label || nextNode.id,
          type: nextNode.type,
        },
        executionStatus: {
          nodeId: nextNode.id,
          nodeName: nextNode.data?.label || nextNode.id,
          status: 'running',
          startTime: new Date().toISOString(),
        },
        flowState: updatedFlowState,
      };
      
      res.write(`data: ${JSON.stringify(progressUpdate)}\n\n`);
    }

    // Execute the node
    const nextResult = await executeNode(nextNode, {
      flow,
      flowState: updatedFlowState,
      userInput: undefined,
    });

    if (!nextResult) {
      const errorResult: ExecutionResult = {
        status: 'error',
        message: `Failed to execute node: ${nextNode.id}`,
        flowState: updatedFlowState,
      };
      
      if (res.write && typeof res.write === 'function') {
        res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
      } else {
        res.status(500).json(errorResult);
      }
      return;
    }

    // Send the result to client
    if (res.write && typeof res.write === 'function') {
      // If streaming and not interface node, only send node info and status, not output
      const shouldSendOutput = nextNode.type === 'interface' || nextResult.status === 'error';
      
      // Use a safer approach to handle potentially missing output property
      // Create a copy of nextResult without including output property
      const { output: outputValue, ...progress } = nextResult as ExecutionResult & { output?: string };
      
      // Only include output for interface nodes or errors
      if (shouldSendOutput && outputValue) {
        (progress as any).output = outputValue;
      }
      
      res.write(`data: ${JSON.stringify({
        ...progress,
        nodeInfo: {
          id: nextNode.id,
          name: nextNode.data?.label || nextNode.id,
          type: nextNode.type,
        },
      })}\n\n`);
    }

    // If the result is "waiting for input", stop execution and wait for user
    if (nextResult.status === 'waiting_for_input' || nextResult.status === 'completed') {
      // For streaming responses, we need to finish the stream
      if (res.write && typeof res.write === 'function') {
        // No need to do anything here - we already sent the result above
      } else {
        res.status(200).json(nextResult);
      }
      return;
    }

    // Otherwise, continue execution
    await continueExecution(res, flow, updatedFlowState, nextResult);
  } catch (error) {
    console.error('Error in continueExecution:', error);
    const errorResult: ExecutionResult = {
      status: 'error',
      message: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
    };
    
    if (res.write && typeof res.write === 'function') {
      res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
    } else {
      res.status(500).json(errorResult);
    }
  }
}
