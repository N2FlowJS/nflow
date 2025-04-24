import { BeginNode, Flow, FlowNode } from '../../types/flowTypes';
import { FlowState } from '../../types/flowExecutionTypes';

// Create an initial flow state

type InitialFlowStateProps = {
  beginNode: BeginNode;
  variables?: Record<string, any>;
  flowConfig: Flow;
};

export function createInitialFlowState({ beginNode, variables, flowConfig }: InitialFlowStateProps): FlowState {
  const components: FlowState['components'] = {};
  flowConfig.nodes.forEach((node) => {
    components[`${node.id}`] = {
      type: node.type,
      output: '',
      ready: node.type === 'interface' ? true : false,
      inputFlow: [],
      inputRefs: node.data.form.inputRefs,
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
  };
}
