import { FlowNode } from "../../models/flowTypes";
import { CodeNodeData } from "./types";
import { ExecutionResult, findNextNodes, FlowExecutionContext, FlowStateDispatcher } from "@n2flowjs/flow";

export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as CodeNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  try {
    const code = form.code || 'return { result: "No code provided" };';
    const timeout = form.timeout || 5000;
    const allowConsole = form.allowConsole || false;

    // Prepare input data for the code
    const inputs = {
      flowState: flowState,
      variables: flowState.variables,
      components: flowState.components,
    };

    // Create a sandboxed execution environment
    const result = await executeCodeSafely(code, inputs, timeout, allowConsole);

    const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'code');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'code';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'code',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Code execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown code execution error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Code execution failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'code',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

async function executeCodeSafely(
  code: string, 
  inputs: any, 
  timeout: number, 
  allowConsole: boolean
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Code execution timeout after ${timeout}ms`));
    }, timeout);

    try {
      // Create a safe execution context
      const safeConsole = allowConsole ? console : {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
      };

      // Create the function with controlled scope
      const fn = new Function(
        'inputs',
        'console',
        'Math',
        'JSON',
        'Date',
        'Array',
        'Object',
        'String',
        'Number',
        code
      );

      // Execute the function
      const result = fn(
        inputs,
        safeConsole,
        Math,
        JSON,
        Date,
        Array,
        Object,
        String,
        Number
      );

      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}
