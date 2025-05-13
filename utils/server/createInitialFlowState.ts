import { BeginNode, Flow, FlowNode } from '../../models/flowTypes';
import { FlowState } from '../../models/flowExecutionTypes';

// Create an initial flow state

type InitialFlowStateProps = {
  beginNode: BeginNode;
  variables?: Record<string, any>;
  flowConfig: Flow;
};

export function createInitialFlowState({ beginNode, variables, flowConfig }: InitialFlowStateProps): FlowState {
  const now = Date.now();
  const components: FlowState['components'] = {};
  flowConfig.nodes.forEach((node) => {
    components[`${node.id}`] = {
      type: node.type,
      output: '',
      inputFlow: [],
      inputRefs: node.data.form.inputRefs,
      executionTime: now,
    };
  });
  flowConfig.edges.forEach((edge) => {
    if (components[edge.target]) {
      if (!components[edge.target].inputFlow.find((input: any) => input.id === edge.source))
        components[edge.target].inputFlow.push({
          id: edge.source,
          name: flowConfig.nodes.find((node) => node.id === edge.source)?.data.form.name || edge.source,
        });
    }
  });

  return {
    currentNode: beginNode as FlowNode,
    variables: variables || {},
    components: components,
    history: [],
    executionTime: now - 1000,
  };
}
