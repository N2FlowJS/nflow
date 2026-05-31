import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  useReactFlow,
} from "@xyflow/react";
import type { CustomNodeType } from "@n2flow/types";
import { initialEdges, initialNodes } from "../../data";
import {
  AGENT_TEMPLATE_CUSTOM,
  getAgentInstructionByTemplate,
} from "../../../back-end/agent-templates";
import {
  setNodeFieldValueInSchema,
  createNodeDataByType,
} from "../../../back-end/node-registry";
import {
  inferSourcePortType,
  inferTargetPortType,
  PortDataType,
} from "../../../back-end/node-registry/utils";
import type { GraphState, RuntimeStatus } from '../../types/editor';

interface UseGraphStateOptions {
  onNotify?: (message: string, type: 'error' | 'info') => void;
}

export const useGraphState = ({ onNotify }: UseGraphStateOptions = {}): GraphState => {
  const { deleteElements } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>("idle");
  const [pendingNodeInsertPosition, setPendingNodeInsertPosition] = useState<{ x: number; y: number } | null>(null);
  
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

  // History / Undo-Redo
  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const stateRef = useRef({ nodes, edges });

  useEffect(() => {
    stateRef.current = { nodes, edges };
  }, [nodes, edges]);

  const takeSnapshot = useCallback(() => {
    setPast((p) => {
      const newPast = [...p, stateRef.current];
      if (newPast.length > 50) newPast.shift();
      return newPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      const newPast = p.slice(0, p.length - 1);

      setFuture((f) => [stateRef.current, ...f]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return newPast;
    });
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);

      setPast((p) => [...p, stateRef.current]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return newFuture;
    });
  }, [setNodes, setEdges]);

  // Node Config state
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const currentConfigNode = useMemo(
    () => nodes.find((n) => n.id === configNodeId) || null,
    [nodes, configNodeId],
  );

  const updateNodeDataById = useCallback((nodeId: string, newData: Partial<CustomNodeType["data"]>) => {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)));
  }, [setNodes]);

  const handleParamChange = useCallback((nodeId: string, name: string, value: string | number | boolean) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n;
      const data = n.data as CustomNodeType["data"];
      
      if (data.type === 'Agent' && name === 'agentTemplate') {
        const templateName = String(value || '');
        const configSchema = Array.isArray(data.configSchema) ? data.configSchema : [];
        let updatedSchema = setNodeFieldValueInSchema(configSchema, 'agentTemplate', templateName);
        const templateInstruction = getAgentInstructionByTemplate(templateName);
        if (templateName !== AGENT_TEMPLATE_CUSTOM && templateInstruction) {
          updatedSchema = setNodeFieldValueInSchema(updatedSchema, 'instruction', templateInstruction);
        }
        return { ...n, data: { ...n.data, configSchema: updatedSchema } };
      }
      
      const configSchema = Array.isArray(data.configSchema) ? data.configSchema : undefined;
      const updatedSchema = setNodeFieldValueInSchema(configSchema, name, value);
      return { ...n, data: { ...n.data, configSchema: updatedSchema } };
    }));
  }, [setNodes]);

  const onCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      setCopiedNodes(selectedNodes);
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const selectedEdges = edges.filter(
        (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target),
      );
      setCopiedEdges(selectedEdges);
    }
  }, [nodes, edges]);

  const onPaste = useCallback((targetPos?: { x: number; y: number }) => {
    if (copiedNodes.length > 0) {
      takeSnapshot();
      const idMap = new Map<string, string>();
      let offset = { x: 50, y: 50 };
      if (targetPos) {
        const minX = Math.min(...copiedNodes.map((n) => n.position.x));
        const minY = Math.min(...copiedNodes.map((n) => n.position.y));
        offset = { x: targetPos.x - minX, y: targetPos.y - minY };
      }

      const newNodes = copiedNodes.map((node) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: targetPos
            ? { x: node.position.x + offset.x, y: node.position.y + offset.y }
            : { x: node.position.x + 50, y: node.position.y + 50 },
          selected: true,
        };
      });

      const newEdges = copiedEdges.map((edge) => ({
        ...edge,
        id: `e-${idMap.get(edge.source)}-${idMap.get(edge.target)}-${Date.now()}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
        selected: false,
      }));

      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
    }
  }, [copiedNodes, copiedEdges, setNodes, setEdges, takeSnapshot]);

  const onDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      takeSnapshot();
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const selectedEdges = edges.filter(
        (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target),
      );

      const idMap = new Map<string, string>();
      const newNodes = selectedNodes.map((node) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 30, y: node.position.y + 30 },
          selected: true,
        };
      });

      const newEdges = selectedEdges.map((edge) => ({
        ...edge,
        id: `e-${idMap.get(edge.source)}-${idMap.get(edge.target)}-${Date.now()}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
        selected: false,
      }));

      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
    }
  }, [nodes, edges, setNodes, setEdges, takeSnapshot]);

  const onDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      takeSnapshot();
      deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    }
  }, [nodes, edges, deleteElements, takeSnapshot]);

  const onSelectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  const onGroupNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected && !n.parentId && n.type !== "cyberGroup");
    if (selectedNodes.length < 1) return;
    takeSnapshot();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedNodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      const w = node.measured?.width ?? 250;
      const h = node.measured?.height ?? 150;
      maxX = Math.max(maxX, node.position.x + w);
      maxY = Math.max(maxY, node.position.y + h);
    });

    const padding = 50;
    const groupId = `group-${Date.now()}`;
    const groupNode: Node = {
      id: groupId,
      type: "cyberGroup",
      position: { x: minX - padding, y: minY - padding },
      style: { width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 },
      data: { label: "New Cluster" },
      selected: true,
    };

    const updatedChildren = selectedNodes.map((node) => ({
      ...node,
      parentId: groupId,
      expandParent: true,
      extent: "parent" as const,
      position: { x: node.position.x - (minX - padding), y: node.position.y - (minY - padding) },
      selected: false,
    }));

    setNodes((nds) => {
      const remainingNodes = nds.filter((n) => !selectedNodes.find((sn) => sn.id === n.id));
      return [...remainingNodes, groupNode, ...updatedChildren];
    });
  }, [nodes, setNodes, takeSnapshot]);

  const onUngroupNodes = useCallback((targetGroupId?: string) => {
    const selectedGroups = targetGroupId
      ? nodes.filter((n) => n.id === targetGroupId)
      : nodes.filter((n) => n.selected && n.type === "cyberGroup");

    if (selectedGroups.length === 0) return;
    takeSnapshot();
    const groupIds = selectedGroups.map((g) => g.id);

    setNodes((nds) => nds.filter((n) => !groupIds.includes(n.id)).map((n) => {
      if (n.parentId && groupIds.includes(n.parentId)) {
        const parent = nds.find((g) => g.id === n.parentId);
        return {
          ...n,
          parentId: undefined,
          position: { x: n.position.x + (parent?.position.x || 0), y: n.position.y + (parent?.position.y || 0) },
        };
      }
      return n;
    }));
  }, [nodes, setNodes, takeSnapshot]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceNode = nodes.find((n) => n.id === params.source) as CustomNodeType | undefined;
      const targetNode = nodes.find((n) => n.id === params.target) as CustomNodeType | undefined;
      if (!sourceNode || !targetNode) return;

      const sourcePortType = inferSourcePortType(sourceNode, params.sourceHandle);
      const targetPortType = inferTargetPortType(targetNode, params.targetHandle);

      const isPortCompatible = sourcePortType === "any" || targetPortType === "any" || sourcePortType === targetPortType;

      if (!isPortCompatible) {
        onNotify?.(`Không tương thích type: output ${sourcePortType} không thể nối vào input ${targetPortType}.`, 'error');
        return;
      }

      if (params.targetHandle === "agent_llm") {
        if (edges.some((edge) => edge.target === params.target && edge.targetHandle === "agent_llm")) {
          onNotify?.("Cổng LLM_LINK chỉ nhận 1 Chat Model. Hãy xóa kết nối cũ trước.", 'error');
          return;
        }
      }

      if (params.targetHandle === "embedding_model") {
        if (edges.some((edge) => edge.target === params.target && edge.targetHandle === "embedding_model")) {
          onNotify?.("Cổng EMBEDDING chỉ nhận 1 Embedding Model. Hãy xóa kết nối cũ trước.", 'error');
          return;
        }
      }

      if (params.targetHandle === "tools" && params.sourceHandle !== "as_tool") {
        onNotify?.("Cổng TOOL_BUS chỉ nhận kết nối từ handle AS_TOOL.", 'error');
        return;
      }

      takeSnapshot();
      setEdges((eds) => {
        let stroke = "#4b5563";
        const portColor = (portType: PortDataType) => {
          if (portType === "text") return "#22c55e";
          if (portType === "chat_model") return "#a855f7";
          if (portType === "embedding_model") return "#3b82f6";
          if (portType === "tool") return "#f59e0b";
          if (portType === "boolean_route") return "#ec4899";
          return "#4b5563";
        };

        if (params.targetHandle === "tools") stroke = "#f59e0b";
        else if (params.targetHandle === "agent_llm") stroke = "#a855f7";
        else if (params.targetHandle === "embedding_model") stroke = "#3b82f6";
        else if (params.sourceHandle === "true") stroke = "#22c55e";
        else if (params.sourceHandle === "false") stroke = "#ef4444";
        else if (params.sourceHandle === "as_tool") stroke = "#f59e0b";
        else if (params.targetHandle === "system_prompt") stroke = "#64748b";
        else if (params.targetHandle === "input_value") stroke = "#22c55e";
        else if (params.sourceHandle === "response") stroke = "#22d3ee";
        else stroke = portColor(targetPortType !== "any" ? targetPortType : sourcePortType);

        return addEdge({
          ...params,
          type: "cyberEdge",
          animated: true,
          style: { stroke, strokeWidth: 1.5 },
        }, eds);
      });
    },
    [nodes, edges, setEdges, takeSnapshot, onNotify]
  );

  const onAddNode = useCallback(
    (type: string, label: string, position?: { x: number; y: number }) => {
      takeSnapshot();
      const newNode: CustomNodeType = {
        id: `${type}-${Date.now()}`,
        type: "cyberNode",
        position: position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data: createNodeDataByType(type, label),
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, takeSnapshot]
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    reactFlowInstance,
    setReactFlowInstance,
    runtimeStatus,
    setRuntimeStatus,
    configNodeId,
    setConfigNodeId,
    currentConfigNode,
    undo,
    redo,
    takeSnapshot,
    onConnect,
    onAddNode,
    updateNodeDataById,
    handleParamChange,
    onCopy,
    onPaste,
    onDuplicate,
    onDeleteSelected,
    onSelectAll,
    onGroupNodes,
    onUngroupNodes,
    pendingNodeInsertPosition,
    setPendingNodeInsertPosition,
  };
};
