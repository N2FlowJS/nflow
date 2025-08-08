import { useCallback } from 'react';
import { NodeTypeString, FlowNode } from '../../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../../utils/client/NODE_REGISTRY';

export const useNodeDropper = (
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>,
  nodes: FlowNode[]
) => {
  return useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('nflow.application.reactflow') as NodeTypeString;
      if (!nodeType) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const defaultData = NODE_REGISTRY[nodeType].data as any;

      const form = defaultData.form || {};
      const baseName = form.name || nodeType;
      let newName = baseName;
      let counter = 1;

      while (nodes.some((node) => node.data.form?.name === newName)) {
        newName = `${baseName}_${counter}`;
        counter++;
      }

      const newNode: FlowNode = {
        id: `node_${Date.now()}`,
        type: nodeType,
        data: {
          ...defaultData,
          form: {
            ...form,
            name: newName,
          },
        },
        position,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, nodes]
  );
};
