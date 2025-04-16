import { useCallback, useState, useRef } from 'react';
import { FlowState } from '../types/flowExecutionTypes';

export interface LogEntry {
    timestamp: string;
    action: string;
    details: string;
    source: string;
}

export interface DebugStatus {
    hasFlowState: boolean;
    currentNodeId: string;
    waitingForInput: boolean;
    messagesCount: number;
    variablesCount: number;
    isCompleted: boolean;
    id: string;
}

export const useDebug = () => {
    // Debug state
    const [debugMode, setDebugMode] = useState(false);
    const [debugDrawerOpen, setDebugDrawerOpen] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
    
    // Use ref to avoid dependency cycles
    const debugModeRef = useRef(debugMode);
    debugModeRef.current = debugMode;

    // Log debug information - using ref to avoid dependency on debugMode
    const logDebugInfo = useCallback((action: string, details: string, source: string) => {
        const timestamp = new Date().toISOString();
        if (debugModeRef.current) {
            console.log(`[${timestamp}] [${source}] ${action}: ${details}`);
        }

        setExecutionLogs(prev => [
            {
                timestamp,
                action,
                details,
                source
            },
            ...prev.slice(0, 99)
        ]);
    }, []); // Empty dependency array since we use ref

    // Function to clear debug logs
    const clearDebugLogs = useCallback(() => {
        setExecutionLogs([]);
        logDebugInfo('Logs cleared', 'User cleared execution logs', 'debugPanel');
    }, [logDebugInfo]);

    // Create debug status from flow state and other parameters
    const createDebugStatus = useCallback((
        flowState: FlowState | null,
        waitingForInput: boolean,
        messagesCount: number,
        id?: string
    ): DebugStatus => {
        return {
            hasFlowState: !!flowState,
            currentNodeId: flowState?.currentNodeId || 'None',
            waitingForInput,
            messagesCount,
            variablesCount: flowState ? Object.keys(flowState.variables || {}).length : 0,
            isCompleted: flowState?.completed || false,
            id: id || 'None'
        };
    }, []);

    return {
        // State
        debugMode,
        setDebugMode,
        debugDrawerOpen,
        setDebugDrawerOpen,
        executionLogs,
        
        // Functions
        logDebugInfo,
        clearDebugLogs,
        createDebugStatus
    };
};
