import { FlowNode } from '@n2flowjs/flow';
import { TextProcessNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing Text Process nodes
 */
export async function executeTextProcessNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TextProcessNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from input text and operation parameters
  const inputs: string[] = [
    ...getInputFromTemplate(form.inputText || ''),
    ...getInputFromTemplate(form.searchValue || ''),
    ...getInputFromTemplate(form.replaceValue || ''),
    ...getInputFromTemplate(form.separator || ''),
    ...getInputFromTemplate(form.regexPattern || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input text to process',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'textprocess',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input text',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required fields
    if (!form.inputText || form.inputText.trim() === '') {
      throw new Error('No input text specified for processing');
    }

    // Process templates
    const processedInputText = processTemplate(form.inputText, vars);
    const processedSearchValue = form.searchValue ? processTemplate(form.searchValue, vars) : '';
    const processedReplaceValue = form.replaceValue ? processTemplate(form.replaceValue, vars) : '';
    const processedSeparator = form.separator ? processTemplate(form.separator, vars) : '';
    const processedRegexPattern = form.regexPattern ? processTemplate(form.regexPattern, vars) : '';

    console.log(`Executing Text Process node: ${node.id} with operation: ${form.operation}`);

    let result: string;

    switch (form.operation) {
      case 'uppercase':
        result = processedInputText.toUpperCase();
        break;

      case 'lowercase':
        result = processedInputText.toLowerCase();
        break;

      case 'trim':
        result = processedInputText.trim();
        break;

      case 'replace':
        if (!processedSearchValue) {
          throw new Error('Search value is required for replace operation');
        }
        result = processedInputText.replace(new RegExp(escapeRegex(processedSearchValue), 'g'), processedReplaceValue);
        break;

      case 'split':
        if (!processedSeparator) {
          throw new Error('Separator is required for split operation');
        }
        const splitResult = processedInputText.split(processedSeparator);
        result = JSON.stringify(splitResult, null, 2);
        break;

      case 'join':
        try {
          const arrayData = JSON.parse(processedInputText);
          if (!Array.isArray(arrayData)) {
            throw new Error('Input must be a JSON array for join operation');
          }
          const joinSeparator = processedSeparator || ',';
          result = arrayData.join(joinSeparator);
        } catch (error) {
          throw new Error(`Failed to parse input as JSON array: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
        break;

      case 'regex':
        if (!processedRegexPattern) {
          throw new Error('Regex pattern is required for regex operation');
        }
        try {
          const flags = form.regexFlags || 'g';
          const regex = new RegExp(processedRegexPattern, flags);
          const matches = processedInputText.match(regex);
          result = matches ? JSON.stringify(matches, null, 2) : '[]';
        } catch (error) {
          throw new Error(`Invalid regex pattern: ${error instanceof Error ? error.message : 'Regex error'}`);
        }
        break;

      case 'length':
        result = String(processedInputText.length);
        break;

      default:
        throw new Error(`Unsupported text operation: ${form.operation}`);
    }

    console.log(`Text Process node completed: ${node.id} = ${result.substring(0, 100)}...`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, result, 'textprocess');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = result;
      flowState.components[node.id]['type'] = 'textprocess';
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
        type: 'textprocess',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: result,
      },
    };
  } catch (error: unknown) {
    console.error('Text Process execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown text process error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Text processing failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'textprocess',
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

// Helper function to escape special regex characters
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
