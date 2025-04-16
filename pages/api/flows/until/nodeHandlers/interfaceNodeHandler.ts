import { FlowNode, InterfaceNodeData } from '../../../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../../types/flowExecutionTypes';
import { findNextNode } from '../flowExecutionService';

/**
 * Handler for executing Interface nodes
 * Interface nodes display content and wait for user input
 */
export async function executeInterfaceNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<ExecutionResult> {
  const { flow, flowState, userInput } = context;
  
  // Check if this is the first time hitting this interface node in a new conversation
  const isFirstExecution = !flowState.conversationState?.hasReachedFirstInterface;
  
  // For new conversation, display the greeting from begin node
  if (isFirstExecution) {
    // Find the content to display - prioritize initialGreeting from begin node
    const displayContentSources = [
      flowState.variables.initialGreeting,
      flowState.variables.generatedOutput,
      // Get the latest history item's output if available
      flowState.history.length > 0 
        ? flowState.history[flowState.history.length - 1].output 
        : null,
      // Default message if nothing is found
      "Welcome! How can I assist you today?"
    ];
    
    // Get the first non-null value from our sources
    const displayContent = displayContentSources.find(
      content => content !== null && content !== undefined
    );
    
    // Create conversation state tracking if it doesn't exist
    if (!flowState.conversationState) {
      flowState.conversationState = {
        hasReachedFirstInterface: true,
        interfaceNodeCount: 1,
        firstInterfaceId: node.id,
        lastInterfaceId: node.id
      };
    } else {
      flowState.conversationState.hasReachedFirstInterface = true;
      flowState.conversationState.interfaceNodeCount += 1;
      flowState.conversationState.firstInterfaceId = node.id;
      flowState.conversationState.lastInterfaceId = node.id;
    }
    
    // Wait for user input at first interface
    return {
      status: 'waiting_for_input',
      output: displayContent,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'interface'
      }
    };
  }
  
  // For continuing conversation with user input
  if (userInput) {
    // Store the user input in variables
    flowState.variables.userInput = userInput;
    flowState.variables.lastUserInput = userInput;
    
    // Update interface tracking
    if (flowState.conversationState) {
      flowState.conversationState.lastInterfaceId = node.id;
      flowState.conversationState.interfaceNodeCount += 1;
    }
    
    // Find the next node in the flow
    const nextNodeId = findNextNode(flow, node.id);
    
    if (!nextNodeId) {
      return {
        status: 'completed',
        output: userInput, // Echo the input as output
        flowState: {
          ...flowState,
          completed: true
        },
      };
    }
    
    // Continue to next node
    return {
      status: 'in_progress',
      output: userInput, // Echo the input as output
      nextNodeId,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'interface'
      }
    };
  }
  
  // For final interface node displaying the result
  const displayContentSources = [
    flowState.variables.generatedOutput,
    flowState.variables.lastResponse,
    // Get the latest history item's output if available
    flowState.history.length > 0 
      ? flowState.history[flowState.history.length - 1].output 
      : null,
    // Default message if nothing is found
    "No previous output to display"
  ];
  
  // Get the first non-null value
  const displayContent = displayContentSources.find(
    content => content !== null && content !== undefined
  );
  
  // Update conversation state
  if (flowState.conversationState) {
    flowState.conversationState.lastInterfaceId = node.id;
  }
  
  // Wait for user input at this interface
  return {
    status: 'waiting_for_input',
    output: displayContent,
    flowState,
    nodeInfo: {
      id: node.id,
      name: node.data?.label || node.id,
      type: 'interface'
    }
  };
}
