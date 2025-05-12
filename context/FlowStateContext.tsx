import React, { createContext, ReactNode, useContext, useState } from 'react';
import { FlowState } from '../models/flowExecutionTypes';

interface FlowStateContextType {
  flowState: FlowState | null;
  setFlowState: (state: FlowState | null) => void;
}

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

export const FlowStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flowState, setFlowState] = useState<FlowState | null>(null);

  return <FlowStateContext.Provider value={{ flowState, setFlowState }}>{children}</FlowStateContext.Provider>;
};

export const useFlowState = (): FlowStateContextType => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error('useFlowState must be used within a FlowStateProvider');
  }
  return context;
};
