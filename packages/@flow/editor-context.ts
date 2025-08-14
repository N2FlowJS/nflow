import { createContext, useContext } from 'react';
import { Position } from '@xyflow/react';
import { NodeTypeString } from '../../models/flowTypes';

export interface FlowEditorContextType {
  openConfigDrawer: () => void;
  deleteNode: (nodeId: string) => void;
  openNextStepModal: (info: {
    nodeId: string;
    handleId: string;
    handleType: 'source' | 'target';
    position: Position;
    nodeType: NodeTypeString;
    clientX: number;
    clientY: number;
    sourceW: number;
    sourceH: number;
  }) => void;
}

export const FlowEditorContext = createContext<FlowEditorContextType | null>(null);

export const useFlowEditorContext = () => {
  const context = useContext(FlowEditorContext);
  if (!context) {
    throw new Error('useFlowEditorContext must be used within a FlowEditorProvider');
  }
  return context;
};
