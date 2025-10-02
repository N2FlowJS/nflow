import React, { createContext, ReactNode, useContext, useMemo, useCallback, useSyncExternalStore } from 'react';
import { FlowState } from '../models/flowExecution';

// --- Store for state management ---
let flowStateStore: FlowState | null = null;
const listeners = new Set<() => void>();

const flowStateStoreManager = {
  setState(newState: FlowState | null) {
    flowStateStore = newState;
    listeners.forEach(listener => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return flowStateStore;
  }
};

// --- Context Definition ---
interface FlowStateContextType {
  setFlowState: (state: FlowState | null) => void;
  useSelector: <T>(selector: (state: FlowState | null) => T) => T;
}

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

// --- Provider Component ---
export const FlowStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useMemo(() => {
    return {
      setFlowState: (state: FlowState | null) => flowStateStoreManager.setState(state),
      useSelector: <T,>(selector: (state: FlowState | null) => T): T => {
        return useSyncExternalStore(
          flowStateStoreManager.subscribe,
          () => selector(flowStateStoreManager.getSnapshot()),
          () => selector(flowStateStoreManager.getSnapshot())
        );
      }
    };
  }, []);

  return <FlowStateContext.Provider value={value}>{children}</FlowStateContext.Provider>;
};


// --- Main Hook to access the context ---
export const useFlowState = (): FlowStateContextType => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error('useFlowState must be used within an OptimizedFlowStateProvider');
  }
  return context;
};


// --- Optimized Selector Hooks ---

export const useNodeExecutionStatus = (nodeId: string) => {
    const { useSelector } = useFlowState();
    const selector = useCallback(
        (state: FlowState | null) => {
            if (!state?.components || !state.executionTime) return false;
            const component = state.components[nodeId];
            if (!component) return false;
            return component.executionTime > state.executionTime;
        },
        [nodeId]
    );
    return useSelector(selector);
};

export const useEdgeExecutionStatus = (sourceId: string, targetId: string) => {
    const { useSelector } = useFlowState();
    const selector = useCallback(
        (state: FlowState | null) => {
            if (!state?.components || !state.executionTime) return false;
            const sourceComponent = state.components[sourceId];
            const targetComponent = state.components[targetId];
            if (!sourceComponent || !targetComponent) return false;
            return (
                sourceComponent.executionTime > state.executionTime &&
                targetComponent.executionTime > state.executionTime
            );
        },
        [sourceId, targetId]
    );
    return useSelector(selector);
};
