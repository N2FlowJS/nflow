import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowInstance, Node, Edge } from '@xyflow/react';
import type { SavedFlow, FlowVersion, GlobalVariable } from '../../types/editor';
import { apiService } from '../../lib/apiService';
import { normalizeModelNode } from '../../../back-end/node-registry/utils';

interface UseFlowPersistenceOptions {
  id?: string;
  reactFlowInstance: ReactFlowInstance | null;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  triggerFitView: () => void;
}

export const useFlowPersistence = ({
  id,
  reactFlowInstance,
  nodes,
  edges,
  setNodes,
  setEdges,
  triggerFitView,
}: UseFlowPersistenceOptions) => {
  const navigate = useNavigate();
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [currentFlowName, setCurrentFlowName] = useState<string>("Untitled Flow");
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [flowVersions, setFlowVersions] = useState<FlowVersion[]>([]);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  const fetchFlows = useCallback(async () => {
    try {
      const response = await apiService.get('/api/flows');
      if (response.ok) {
        const flows = Array.isArray(response.data) ? response.data : [];
        setSavedFlows(flows);
        return flows;
      }
    } catch (err) {
      console.error("Failed to fetch flows", err);
    }
    return [];
  }, []);

  const onSave = useCallback(
    async (name: string, versionLabel?: string, isAutoSave: boolean = false) => {
      if (!reactFlowInstance) return "";
      
      if (!isAutoSave) setIsSaving(true);
      const flow = reactFlowInstance.toObject();
      const flowId = currentFlowId || `flow-${Date.now()}`;

      try {
        const response = await apiService.post(`/api/flows`, {
          id: flowId,
          name: name || currentFlowName,
          nodes: flow.nodes,
          edges: flow.edges,
          viewport: flow.viewport,
          globalVariables,
          versionLabel,
          isAutoSave
        });

        if (response.ok) {
          setCurrentFlowId(flowId);
          setCurrentFlowName(name || currentFlowName);
          fetchFlows();

          const updatedResponse = await apiService.get(`/api/flows/${flowId}/versions`);
          if (updatedResponse.ok) {
            setFlowVersions(updatedResponse.data || []);
          }

          if (!currentFlowId) {
            navigate(`/flow/${flowId}`);
          }
          
          setLastAutoSave(Date.now());
          return flowId;
        }
      } catch (err) {
        console.error("Failed to save flow", err);
        // Fallback to localStorage logic could go here, but focusing on API first
      } finally {
        setIsSaving(false);
      }
      return "";
    },
    [reactFlowInstance, currentFlowId, currentFlowName, globalVariables, fetchFlows, navigate]
  );

  const onLoadVersion = useCallback(
    async (version: FlowVersion) => {
      if (!currentFlowId) return;

      setIsRestoringVersion(true);
      try {
        const response = await apiService.post(`/api/flows/${currentFlowId}/versions/${version.id}/restore`, {});
        if (!response.ok || !response.data?.flow) {
          throw new Error(response.error || 'Failed to restore version');
        }

        const restoredFlow = response.data.flow;
        if (restoredFlow.data) {
          setNodes((restoredFlow.data.nodes || []).map(normalizeModelNode));
          setEdges(restoredFlow.data.edges || []);
          setGlobalVariables(restoredFlow.data.globalVariables || []);
          setFlowVersions(restoredFlow.versions || []);
          setCurrentFlowName(restoredFlow.name || currentFlowName);
          triggerFitView();
        }
      } catch (err) {
        console.error('Failed to restore version', err);
      } finally {
        setIsRestoringVersion(false);
      }
    },
    [currentFlowId, currentFlowName, setNodes, setEdges, triggerFitView]
  );

  useEffect(() => {
    const loadFlow = async () => {
      if (id && id !== "new") {
        try {
          const response = await apiService.get(`/api/flows/${id}`);
          if (response.ok && response.data) {
            const flow = response.data;
            if (flow && flow.data) {
              setNodes((flow.data.nodes || []).map(normalizeModelNode));
              setEdges(flow.data.edges || []);
              setGlobalVariables(flow.data.globalVariables || []);
              
              const versionsResp = await apiService.get(`/api/flows/${id}/versions`);
              if (versionsResp.ok) {
                setFlowVersions(versionsResp.data || []);
              }

              setCurrentFlowId(flow.id);
              setCurrentFlowName(flow.name);
              triggerFitView();
            }
          }
        } catch (err) {
          console.error("Error loading flow", err);
        }
      } else if (id === "new") {
        setNodes([]);
        setEdges([]);
        setCurrentFlowId(null);
        setCurrentFlowName("Untitled Flow");
        setGlobalVariables([]);
      }
    };
    loadFlow();
    fetchFlows();
  }, [id, setNodes, setEdges, fetchFlows, triggerFitView]);

  const onDeleteFlow = useCallback(
    async (flowId: string) => {
      try {
        const response = await apiService.delete(`/api/flows/${flowId}`);
        if (response.ok) {
          fetchFlows();
          if (currentFlowId === flowId) {
            navigate("/flow/new");
          }
        }
      } catch (err) {
        console.error("Failed to delete flow", err);
      }
    },
    [currentFlowId, navigate, fetchFlows],
  );

  // Server-side Auto-save (debounced)
  useEffect(() => {
    if (!reactFlowInstance) return;
    if (id === 'new' && nodes.length === 0) return;

    const timeout = setTimeout(() => {
      setIsAutoSaving(true);
      void onSave(currentFlowName, undefined, true)
        .then(() => {
          setIsAutoSaving(false);
          setLastAutoSave(Date.now());
        })
        .catch((err) => {
          console.error('Auto-save failed:', err);
          setIsAutoSaving(false);
        });
    }, 5000);

    return () => clearTimeout(timeout);
  }, [nodes, edges, globalVariables, reactFlowInstance, currentFlowId, id, onSave, currentFlowName]);

  return {
    currentFlowId,
    setCurrentFlowId,
    currentFlowName,
    setCurrentFlowName,
    savedFlows,
    flowVersions,
    globalVariables,
    setGlobalVariables,
    isSaving,
    isAutoSaving,
    setIsAutoSaving,
    lastAutoSave,
    setLastAutoSave,
    isRestoringVersion,
    onSave,
    onLoadVersion,
    onDeleteFlow,
    fetchFlows,
  };
};
