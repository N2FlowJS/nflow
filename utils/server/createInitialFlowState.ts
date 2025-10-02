
// Create an initial flow state

import { Flow, FlowNode, FlowState, NodeTypeString } from "@n2flowjs/flow";

type InitialFlowStateProps = {
  beginNode: FlowNode;
  variables?: Record<string, any>;
  flowConfig: Flow;
};

export function createInitialFlowState({ beginNode, variables, flowConfig }: InitialFlowStateProps): FlowState {
  const now = Date.now();
  const components: FlowState['components'] = {};
  flowConfig.nodes.forEach((node) => {
    components[`${node.id}`] = {
      type: node.type as NodeTypeString, // Type assertion to ensure correct type
      output: '',
      inputFlow: [],
      inputRefs: node.data.form?.inputRefs || [], // Add optional chaining and fallback
      executionTime: now,
    };
  });
  flowConfig.edges.forEach((edge) => {
    if (components[edge.target]) {
      if (!components[edge.target].inputFlow.find((input: any) => input.id === edge.source))
        components[edge.target].inputFlow.push({
          id: edge.source,
          name: flowConfig.nodes.find((node) => node.id === edge.source)?.data.form?.name || edge.source,
        });
    }
  });

  return {
    currentNode: beginNode as FlowNode,
    variables: variables || {},
    components: components,
    history: [],
    executionTime: now - 10,
  };
}
