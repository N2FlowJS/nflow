import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Node, useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  DollarSign,
  FolderOpen,
  History,
  Keyboard,
  MessageSquare,
  Eye,
  Terminal,
  Settings2,
  Info,
} from "lucide-react";

import { useEditorUI, DockTabId } from "./editor/useEditorUI";
import { useGraphState } from "./editor/useGraphState";
import { useFlowPersistence } from "./editor/useFlowPersistence";
import { useFlowExecution, INITIAL_PLAYGROUND_MESSAGES } from "./editor/useFlowExecution";

export { INITIAL_PLAYGROUND_MESSAGES };
export type { DockTabId };
import { useEditorHotkeys } from "./editor/useEditorHotkeys";
import { useGraphLayout, LayoutMode } from "./useGraphLayout";

import { normalizeModelNode } from "../../back-end/node-registry/utils";
import { apiService } from "../lib/apiService";

export const useFlowEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteElements } = useReactFlow();

  // 1. UI State
  const ui = useEditorUI();

  // 2. Graph State (needed by execution)
  const graph = useGraphState({
    onNotify: (msg, type) => {
      if (type === 'error') {
        execution.setPlaygroundError(msg);
      }
      execution.setPlaygroundMessages((prev) => [
        ...prev,
        { role: type === 'error' ? 'system' : 'assistant', text: `[System] ${msg}` }
      ]);
    }
  });

  // 3. Persistence (needed by execution)
  const persistence = useFlowPersistence({
    id,
    reactFlowInstance: graph.reactFlowInstance,
    nodes: graph.nodes,
    edges: graph.edges,
    setNodes: graph.setNodes,
    setEdges: graph.setEdges,
    triggerFitView: () => {
      setTimeout(() => graph.reactFlowInstance?.fitView({ duration: 800 }), 100);
    }
  });

  // 4. Flow Execution
  const execution = useFlowExecution({
    getNodes: () => graph.nodes,
    getEdges: () => graph.edges,
    getGlobalVariables: () => persistence.globalVariables,
    runtimeStatus: graph.runtimeStatus as any,
    setRuntimeStatus: graph.setRuntimeStatus as any,
    setNodes: graph.setNodes,
    setIsPlaygroundOpen: ui.setIsPlaygroundOpen,
    setActiveDockTab: ui.setActiveDockTab,
    setIsLogsOpenExclusive: ui.setIsLogsOpenExclusive,
  });

  const [highlightedConfigField, setHighlightedConfigField] = useState<string | null>(null);

  const focusNode = useCallback((node: any) => {
    graph.reactFlowInstance?.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 800 });
    graph.setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
  }, [graph]);

  const focusIssueNode = useCallback((issue: any) => {
    const node = graph.nodes.find((n) => n.id === issue.nodeId);
    if (node) {
      focusNode(node);
      if (issue.fieldName) {
        ui.setActiveDockTab("config");
        graph.setConfigNodeId(node.id);
        setHighlightedConfigField(issue.fieldName);
      }
    }
  }, [graph, focusNode, ui]);

  // 5. Layout
  const { runLayout, isLayouting } = useGraphLayout({
    nodes: graph.nodes,
    edges: graph.edges,
    setNodes: graph.setNodes,
    setEdges: graph.setEdges,
    reactFlowInstance: graph.reactFlowInstance,
  });

  const onLayout = useCallback((mode: LayoutMode = "LR") => {
    graph.takeSnapshot();
    void runLayout(mode).catch(console.error);
  }, [runLayout, graph]);

  // 6. I/O Actions
  const onExport = useCallback(() => {
    if (graph.reactFlowInstance) {
      const flow = graph.reactFlowInstance.toObject();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `nflow-${Date.now()}.json`);
      link.click();
    }
  }, [graph.reactFlowInstance]);

  const importInputRef = useRef<HTMLInputElement>(null!);
  const onImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow) {
            graph.takeSnapshot();
            graph.setNodes((flow.nodes || []).map(normalizeModelNode));
            graph.setEdges(flow.edges || []);
          }
        } catch { alert("Invalid flow file."); }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  }, [graph]);

  const onDownloadImage = useCallback(() => {
    const el = document.querySelector(".react-flow") as HTMLElement;
    if (el) {
      toPng(el, { backgroundColor: "#0a0a0a" }).then((url) => {
        const a = document.createElement("a");
        a.setAttribute("download", `nflow-${Date.now()}.png`);
        a.setAttribute("href", url);
        a.click();
      });
    }
  }, []);

  // 7. Hotkeys & Commands
  const hotkeys = useEditorHotkeys({
    ui, graph, persistence, execution,
    onLayout, onExport, importInputRef
  });

  // 8. Connection sync
  const renderedEdges = useMemo(() => {
    return graph.edges.map((edge) => ({
      ...edge,
      animated: graph.nodes.find((n) => n.id === edge.source)?.data?.status === "running" || edge.animated,
    }));
  }, [graph.edges, graph.nodes]);

  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const check = async () => { try { const r = await apiService.get('/api/health'); setIsOnline(r.ok); } catch { setIsOnline(false); } };
    const t = setInterval(check, 30000); check();
    return () => clearInterval(t);
  }, []);

  const dockTabs = useMemo(() => [
    { id: "playground", label: "Playground", icon: MessageSquare },
    { id: "preview", label: "Result", icon: Eye },
    { id: "execution", label: "Exec", icon: Info },
    { id: "config", label: "Config", icon: Settings2, badge: graph.currentConfigNode ? "Node" : undefined },
    { id: "logs", label: "Logs", icon: Terminal, badge: execution.executionLogs.length > 0 ? String(execution.executionLogs.length) : undefined },
    { id: "validation", label: "Check", icon: AlertTriangle, badge: execution.flowIssues.length > 0 ? String(execution.flowIssues.length) : undefined },
    { id: "flows", label: "Flows", icon: FolderOpen },
    { id: "variables", label: "Vars", icon: DollarSign },
    { id: "history", label: "History", icon: History },
    { id: "shortcuts", label: "Keys", icon: Keyboard },
  ], [graph.currentConfigNode, execution.executionLogs.length, execution.flowIssues.length]);

  const latestRef = useRef({ onSave: persistence.onSave, currentFlowName: persistence.currentFlowName });
  latestRef.current = { onSave: persistence.onSave, currentFlowName: persistence.currentFlowName };

  useEffect(() => {
    if (ui.isPlaygroundOpen) {
      latestRef.current.onSave(latestRef.current.currentFlowName);
    }
  }, [ui.isPlaygroundOpen]);

  // Handle auto-open of result preview
  useEffect(() => {
    const previewHandler = () => ui.setActiveDockTab("preview");
    const configHandler = (e: any) => {
      ui.setActiveDockTab("config");
      graph.setConfigNodeId(e.detail.nodeId);
    };
    window.addEventListener('openResultPreview', previewHandler);
    window.addEventListener('openNodeConfig', configHandler);
    return () => {
      window.removeEventListener('openResultPreview', previewHandler);
      window.removeEventListener('openNodeConfig', configHandler);
    };
  }, [ui, graph]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!graph.reactFlowInstance) return;
    const dataStr = event.dataTransfer.getData("application/reactflow");
    if (!dataStr) return;
    const { type, label } = JSON.parse(dataStr);
    const position = graph.reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    graph.onAddNode(type, label, position);
  }, [graph]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent | MouseEvent, node: any) => {
    event.preventDefault();
    ui.setContextMenu({ x: (event as any).clientX, y: (event as any).clientY, node });
  }, [ui]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    ui.setContextMenu({ x: (event as any).clientX, y: (event as any).clientY });
  }, [ui]);

  const onClear = useCallback(() => {
    if (window.confirm("Are you sure?")) {
      graph.takeSnapshot();
      graph.setNodes([]);
      graph.setEdges([]);
      persistence.setCurrentFlowId(null);
      persistence.setCurrentFlowName("Untitled Flow");
    }
  }, [graph, persistence]);

  const commandInputRef = useRef<HTMLInputElement>(null!);

  return {
    id, navigate, isOnline, dockTabs, renderedEdges,
    ...ui, ...graph, ...persistence, ...execution, ...hotkeys,
    onLayout, onExport, onImport, onDownloadImage, importInputRef,
    onDragOver, onDrop, onNodeContextMenu, onPaneContextMenu, onClear,
    onLayoutHandler: (type: string) => onLayout(type as any),
    onNodesChangeWrapper: graph.onNodesChange,
    onEdgesChangeWrapper: graph.onEdgesChange,
    handleConfigParamChange: (name: string, val: any) => {
      if (graph.configNodeId) graph.handleParamChange(graph.configNodeId, name, val);
    },
    updateNodeDataById: (data: any) => {
      if (graph.configNodeId) graph.updateNodeDataById(graph.configNodeId, data);
    },
    onSelectionChange: ({ nodes: selectedNodes }: { nodes: any[] }) => {
      const activeSelected = selectedNodes.find((n) => n.selected);
      graph.setConfigNodeId(activeSelected ? activeSelected.id : null);
    },
    focusNode,
    focusIssueNode,
    highlightedConfigField,
    setHighlightedConfigField,
    commandInputRef,
    deleteElements,
  };
};

export default useFlowEditor;
