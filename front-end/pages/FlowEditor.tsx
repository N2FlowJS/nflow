import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  EdgeTypes,
  MiniMap,
  Node,
  NodeChange,
  NodeTypes,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import { toPng } from "html-to-image";
import {
  DollarSign,
  History,
  Plus,
  Trash2,
  X
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import CyberEdge from "../components/CyberEdge";
import CyberGroupNode from "../components/CyberGroupNode";
import CyberNode from "../components/CyberNode";
import CyberNoteNode from "../components/CyberNoteNode";
import CanvasSearch from "../components/editor/CanvasSearch";
import CommandPalette from "../components/editor/CommandPalette";
import ContextMenu from "../components/editor/ContextMenu";
import FlowHeader from "../components/editor/FlowHeader";
import FlowManager from "../components/editor/FlowManager";
import LogViewer from "../components/editor/LogViewer";
import ShortcutHelp from "../components/editor/ShortcutHelp";
import ValidationPanel from "../components/editor/ValidationPanel";
import GlobalPreview from "../components/GlobalPreview";
import { NodeConfigModal } from "../components/node-parts/NodeConfigModal";
import Playground from "../components/Playground";
import { Sidebar } from "../components/Sidebar";
import { initialEdges, initialNodes } from "../data";
import {
  AGENT_TEMPLATE_CUSTOM,
  getAgentInstructionByTemplate,
} from "../../back-end/agent-templates";
import {
  validateFlowGraph,
  type FlowValidationIssue,
  type ValidationLocale,
} from "../../back-end/flow-validation";
import { useGraphLayout, type LayoutMode } from "../hooks/useGraphLayout";
import {
  createNodeDataByType,
  setNodeFieldValueInSchema
} from "../../back-end/node-registry";
import nodeRegistry from "../../back-end/node-registry";
import {
  inferSourcePortType,
  inferTargetPortType,
  normalizeModelNode,
  PortDataType
} from "../../back-end/node-registry/utils";
import type { CustomNodeType } from "@n2flow/types";
import {
  CommandAction,
  FlowVersion,
  GlobalVariable,
  LogEntry,
  PlaygroundMessage,
  PlaygroundWorkerOutput,
  RuntimeStatus,
  SavedFlow,
} from "../types/editor";
import { API_BASE, fetchWithAuth } from "../lib/api";

const nodeTypes: NodeTypes = {
  cyberNode: CyberNode as any,
  cyberGroup: CyberGroupNode as any,
  cyberNote: CyberNoteNode as any,
};

const edgeTypes: EdgeTypes = {
  cyberEdge: CyberEdge,
};

const INITIAL_PLAYGROUND_MESSAGES: PlaygroundMessage[] = [
  {
    role: "assistant",
    text: "Protocol initialized. Ready to test the workflow. How can I assist?",
  },
];

const prettifyNodeLabel = (typeName: string) => {
  const withoutComp = typeName.replace(/Component$/, "").replace(/_/g, " ");
  const spaced = withoutComp.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.replace(/\b([a-z])/g, (s) => s.toUpperCase());
};

const VariablesPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  variables: GlobalVariable[];
  onVariablesChange: (variables: GlobalVariable[]) => void;
}> = React.memo(({ isOpen, onClose, variables, onVariablesChange }) => {
  if (!isOpen) return null;

  const handleAdd = () => {
    onVariablesChange([
      ...variables,
      { id: `var-${Date.now()}`, name: "newVariable", value: "" },
    ]);
  };

  const handleUpdate = (id: string, field: "name" | "value", value: string) => {
    onVariablesChange(
      variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const handleDelete = (id: string) => {
    onVariablesChange(variables.filter((v) => v.id !== id));
  };

  return (
    <div className="absolute top-20 right-4 bg-cyber-panel border border-cyber-border rounded-lg shadow-lg z-10 w-96 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-cyber-primary" />
          <h3 className="text-lg font-bold">Global Variables</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {variables.map((variable) => (
          <div key={variable.id} className="flex items-center gap-2">
            <input
              type="text"
              value={variable.name}
              onChange={(e) =>
                handleUpdate(variable.id, "name", e.target.value)
              }
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-1/3 focus:border-cyber-primary outline-none"
              placeholder="Name, eg NVIDIA_API_KEY"
            />
            <input
              type="text"
              value={variable.value}
              onChange={(e) =>
                handleUpdate(variable.id, "value", e.target.value)
              }
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-2/3 focus:border-cyber-primary outline-none"
              placeholder="Secret value used at runtime"
            />
            <button
              onClick={() => handleDelete(variable.id)}
              className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {variables.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic text-sm border border-dashed border-white/10 rounded-lg">
            No variables defined yet.
          </div>
        )}
      </div>
      <button
        onClick={handleAdd}
        className="mt-4 w-full bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 py-2 rounded hover:bg-cyber-primary/20 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
      >
        <Plus size={16} />
        Add Variable
      </button>
    </div>
  );
});

const VersionHistoryPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  versions: FlowVersion[];
  onLoadVersion: (version: FlowVersion) => void;
  isRestoring?: boolean;
}> = React.memo(({ isOpen, onClose, versions, onLoadVersion, isRestoring = false }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-4 bg-cyber-panel border border-cyber-border rounded-lg shadow-lg z-10 w-96 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <History size={18} className="text-cyber-primary" />
          <h3 className="text-lg font-bold">Version History</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {versions.map((version) => (
          <div
            key={version.id}
            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-cyber-primary/50 cursor-pointer transition-all group"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to load version "${version.label || version.id}"? This will overwrite your current unsaved changes.`,
                )
              ) {
                if (isRestoring) return;
                onLoadVersion(version);
              }
            }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm text-gray-200 group-hover:text-cyber-primary">
                {version.label || "Untitled Version"}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {new Date(version.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-[10px] text-gray-500">
              {new Date(version.timestamp).toLocaleDateString()} •{" "}
              {version.data.nodes?.length || 0} nodes
            </div>
            {isRestoring && (
              <div className="mt-2 text-[10px] text-cyber-primary uppercase tracking-wider">
                Restoring...
              </div>
            )}
          </div>
        ))}
        {versions.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic text-sm border border-dashed border-white/10 rounded-lg">
            No versions recorded yet.
          </div>
        )}
      </div>
      <div className="mt-4 text-[10px] text-gray-500 italic text-center">
        Versions are automatically created every time you save.
      </div>
    </div>
  );
});

const Flow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteElements } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [playgroundMessages, setPlaygroundMessages] = useState<
    PlaygroundMessage[]
  >(INITIAL_PLAYGROUND_MESSAGES);
  const [isPlaygroundTyping, setIsPlaygroundTyping] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>("idle");
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [flowIssues, setFlowIssues] = useState<FlowValidationIssue[]>([]);
  const [showMinimap, setShowMinimap] = useState(true);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [currentFlowName, setCurrentFlowName] =
    useState<string>("Untitled Flow");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isFlowManagerOpen, setIsFlowManagerOpen] = useState(false);
  const [isVariablesPanelOpen, setIsVariablesPanelOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isCanvasSearchOpen, setIsCanvasSearchOpen] = useState(false);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [flowVersions, setFlowVersions] = useState<FlowVersion[]>([]);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node?: Node;
  } | null>(null);
  const [validationLocale, setValidationLocale] = useState<ValidationLocale>(
    () =>
      typeof navigator !== "undefined" &&
      navigator.language.toLowerCase().startsWith("vi")
        ? "vi"
        : "en",
  );
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [pendingNodeInsertPosition, setPendingNodeInsertPosition] = useState<
    { x: number; y: number } | null
  >(null);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Global Node Config (single panel)
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const configFieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});
  const [highlightedConfigField, setHighlightedConfigField] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ nodeId?: string; focusField?: string }>;
      const nodeId = ce.detail?.nodeId;
      if (!nodeId) return;
      setConfigNodeId(nodeId);
      setIsNodeConfigOpen(true);
      setHighlightedConfigField(ce.detail?.focusField ?? null);
    };
    window.addEventListener('openNodeConfig', handler as EventListener);
    return () => window.removeEventListener('openNodeConfig', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!isNodeConfigOpen || !highlightedConfigField) return;
    const target = configFieldRefs.current[highlightedConfigField];
    if (!target) return;
    const focusTimer = window.setTimeout(() => {
      try { (target as HTMLElement).focus(); } catch {}
      if ('select' in target && typeof (target as HTMLInputElement | HTMLTextAreaElement).select === 'function') {
        ((target as HTMLInputElement | HTMLTextAreaElement).select());
      }
      try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {}
    }, 50);
    const clearTimer = window.setTimeout(() => setHighlightedConfigField(null), 2000);
    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(clearTimer);
    };
  }, [isNodeConfigOpen, highlightedConfigField]);

  const currentConfigNode = useMemo(
    () => nodes.find((n) => n.id === configNodeId) || null,
    [nodes, configNodeId],
  );

  const updateNodeDataById = (newData: Partial<CustomNodeType["data"]>) => {
    if (!configNodeId) return;
    setNodes((nds) => nds.map((n) => (n.id === configNodeId ? { ...n, data: { ...n.data, ...newData } } : n)));
  };

  const handleConfigParamChange = (
    name: string,
    value: string | number | boolean,
  ) => {
    if (!configNodeId) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id !== configNodeId) return n;
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
  };

  // Exclusive setters: ensure only one of Keyboard Shortcuts or System Logs is visible at a time
  const setShowShortcutHelpExclusive: React.Dispatch<
    React.SetStateAction<boolean>
  > = (v) => {
    setShowShortcutHelp((prev) => {
      const next =
        typeof v === "function" ? (v as (p: boolean) => boolean)(prev) : v;
      if (next) setIsLogsOpen(false);
      return next;
    });
  };

  const setIsLogsOpenExclusive: React.Dispatch<
    React.SetStateAction<boolean>
  > = (v) => {
    setIsLogsOpen((prev) => {
      const next =
        typeof v === "function" ? (v as (p: boolean) => boolean)(prev) : v;
      if (next) setShowShortcutHelp(false);
      return next;
    });
  };

  const [isOnline, setIsOnline] = useState(true);

  // Heartbeat to check server connectivity
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchWithAuth('/api/flows', { method: 'GET' });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };
    const timer = setInterval(checkStatus, 30000);
    checkStatus();
    return () => clearInterval(timer);
  }, [API_BASE]);

  const fetchFlows = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/flows');
      if (response.ok) {
        const flows = Array.isArray(response.flows) ? response.flows : [];
        setSavedFlows(flows);
        return flows;
      }
    } catch (err) {
      console.error("Failed to fetch flows", err);
    }
    return [];
  }, []);

  useEffect(() => {
    const loadFlow = async () => {
      if (id && id !== "new") {
        try {
          const response = await fetchWithAuth(`/api/flows/${id}`);
          if (response.ok) {
            const flow = response;
            if (flow && flow.data) {
              setNodes((flow.data.nodes || []).map(normalizeModelNode));
              setEdges(flow.data.edges || []);
              setGlobalVariables(flow.data.globalVariables || []);
              setFlowVersions(flow.versions || []);
              setCurrentFlowId(flow.id);
              setCurrentFlowName(flow.name);
              shouldFitAfterLoadRef.current = true;
            }
          } else {
            // Fallback to localStorage for migration
            const saved = localStorage.getItem("cyber-flows");
            if (saved) {
              const flows: SavedFlow[] = JSON.parse(saved);
              const flow = flows.find((f) => f.id === id);
              if (flow && flow.data) {
                setNodes((flow.data.nodes || []).map(normalizeModelNode));
                setEdges(flow.data.edges || []);
                setCurrentFlowId(flow.id);
                setCurrentFlowName(flow.name);
                shouldFitAfterLoadRef.current = true;
              }
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
        shouldFitAfterLoadRef.current = false;
      }
    };
    loadFlow();
    fetchFlows();
  }, [id, setNodes, setEdges, fetchFlows]);

  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const stateRef = useRef({ nodes, edges });
  const shouldFitAfterLoadRef = useRef(false);
  const scrollStateRef = useRef({ dx: 0, dy: 0, isScrolling: false });
  const executionAbortRef = useRef<AbortController | null>(null);
  const isSilentExecutionRunningRef = useRef(false);
  const wasPlaygroundOpenRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement>(null!);
  const commandInputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    stateRef.current = { nodes, edges };
  }, [nodes, edges]);

  useEffect(() => {
    if (!reactFlowInstance || !shouldFitAfterLoadRef.current) return;

    let canceled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const runFit = () => {
      if (canceled) return;

      const flowNodes = reactFlowInstance.getNodes();
      const hasMeasuredNodes = flowNodes.some((node) => {
        const width =
          typeof node.measured?.width === "number"
            ? node.measured.width
            : typeof node.width === "number"
              ? node.width
              : 0;
        const height =
          typeof node.measured?.height === "number"
            ? node.measured.height
            : typeof node.height === "number"
              ? node.height
              : 0;
        return width > 0 && height > 0;
      });

      if (!hasMeasuredNodes && attempts < 14) {
        attempts += 1;
        timer = setTimeout(runFit, 50);
        return;
      }

      requestAnimationFrame(() => {
        if (canceled) return;
        reactFlowInstance.fitView({
          duration: 800,
          padding: 0.2,
          includeHiddenNodes: true,
        });
        shouldFitAfterLoadRef.current = false;
      });
    };

    timer = setTimeout(runFit, 0);

    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reactFlowInstance, nodes, edges]);

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

  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const handleTakeSnapshot = () => takeSnapshot();
    window.addEventListener("takeSnapshot", handleTakeSnapshot);
    return () => window.removeEventListener("takeSnapshot", handleTakeSnapshot);
  }, [takeSnapshot]);

  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange[]) => {
      // Prevent node modifications during flow execution to avoid state desynchronization
      if (runtimeStatus === "running") {
        console.warn("[Security] Node modifications blocked during flow execution");
        return;
      }

      const isSignificant = changes.some(
        (c) => c.type === "remove" || c.type === "add",
      );
      if (isSignificant) {
        takeSnapshot();
      }
      onNodesChange(changes);
    },
    [onNodesChange, takeSnapshot, runtimeStatus],
  );

  const onEdgesChangeWrapper = useCallback(
    (changes: EdgeChange[]) => {
      // Prevent edge modifications during flow execution to avoid state desynchronization
      if (runtimeStatus === "running") {
        console.warn("[Security] Edge modifications blocked during flow execution");
        return;
      }

      const isSignificant = changes.some(
        (c) => c.type === "remove" || c.type === "add",
      );
      if (isSignificant) {
        takeSnapshot();
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, takeSnapshot, runtimeStatus],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        return;
      }

      const sourceNode = nodes.find((n) => n.id === params.source) as
        | CustomNodeType
        | undefined;
      const targetNode = nodes.find((n) => n.id === params.target) as
        | CustomNodeType
        | undefined;
      if (!sourceNode || !targetNode) {
        return;
      }

      const pushValidationError = (err: string) => {
        setPlaygroundError(err);
        setPlaygroundMessages((prev) => [
          ...prev,
          { role: "system", text: `[Validation] ${err}` },
        ]);
      };

      const sourcePortType = inferSourcePortType(
        sourceNode,
        params.sourceHandle,
      );
      const targetPortType = inferTargetPortType(
        targetNode,
        params.targetHandle,
      );

      const isPortCompatible =
        sourcePortType === "any" ||
        targetPortType === "any" ||
        sourcePortType === targetPortType;

      if (!isPortCompatible) {
        const err = `Không tương thích type: output ${sourcePortType} không thể nối vào input ${targetPortType}.`;
        pushValidationError(err);
        return;
      }

      if (params.targetHandle === "agent_llm") {
        const hasExistingAgentModel = edges.some(
          (edge) =>
            edge.target === params.target && edge.targetHandle === "agent_llm",
        );
        if (hasExistingAgentModel) {
          const err =
            "Cổng LLM_LINK chỉ nhận 1 Chat Model. Hãy xóa kết nối cũ trước.";
          pushValidationError(err);
          return;
        }
      }

      if (params.targetHandle === "embedding_model") {
        const hasExistingEmbeddingModel = edges.some(
          (edge) =>
            edge.target === params.target &&
            edge.targetHandle === "embedding_model",
        );
        if (hasExistingEmbeddingModel) {
          const err =
            "Cổng EMBEDDING chỉ nhận 1 Embedding Model. Hãy xóa kết nối cũ trước.";
          pushValidationError(err);
          return;
        }
      }

      if (
        params.targetHandle === "tools" &&
        params.sourceHandle !== "as_tool"
      ) {
        const err = "Cổng TOOL_BUS chỉ nhận kết nối từ handle AS_TOOL.";
        pushValidationError(err);
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

        if (params.targetHandle === "tools") {
          stroke = "#f59e0b"; // amber-500
        } else if (params.targetHandle === "agent_llm") {
          stroke = "#a855f7"; // purple-500
        } else if (params.targetHandle === "embedding_model") {
          stroke = "#3b82f6"; // blue-500
        } else if (params.sourceHandle === "true") {
          stroke = "#22c55e"; // green-500
        } else if (params.sourceHandle === "false") {
          stroke = "#ef4444"; // red-500
        } else if (params.sourceHandle === "as_tool") {
          stroke = "#f59e0b"; // amber-500
        } else if (params.targetHandle === "system_prompt") {
          stroke = "#64748b"; // slate-500
        } else if (params.targetHandle === "input_value") {
          stroke = "#22c55e"; // green-500
        } else if (params.sourceHandle === "response") {
          stroke = "#22d3ee"; // cyan-400
        } else {
          const effectiveType =
            targetPortType !== "any" ? targetPortType : sourcePortType;
          stroke = portColor(effectiveType);
        }

        return addEdge(
          {
            ...params,
            type: "cyberEdge",
            animated: true,
            style: { stroke, strokeWidth: 1.5 },
            labelStyle: { fill: stroke },
          },
          eds,
        );
      });
    },
    [nodes, edges, setEdges, takeSnapshot],
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        node,
      });
    },
    [setContextMenu],
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setContextMenu],
  );

  // Wrapper for ReactFlow which passes native MouseEvent or React.MouseEvent
  const onPaneContextMenuHandler = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      const clientX = event instanceof MouseEvent ? event.clientX : (event as React.MouseEvent).clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : (event as React.MouseEvent).clientY;
      event.preventDefault();
      setContextMenu({
        x: clientX,
        y: clientY,
      });
    },
    [setContextMenu],
  );

  const onAddNode = useCallback(
    (type: string, label: string, position?: { x: number; y: number }) => {
      takeSnapshot();

      const newNode: CustomNodeType = {
        id: `${type}-${Date.now()}`,
        type: "cyberNode",
        position: position || {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: createNodeDataByType(type, label),
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, takeSnapshot],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (reactFlowInstance) {
        const scrollThreshold = 100;

        const { innerWidth, innerHeight } = window;
        const { clientX, clientY } = event;

        let dx = 0;
        let dy = 0;

        // Sidebar is 256px wide
        if (clientX < scrollThreshold + 256) {
          dx = Math.max(5, (scrollThreshold + 256 - clientX) * 0.25);
        } else if (clientX > innerWidth - scrollThreshold) {
          dx = -Math.max(5, (clientX - (innerWidth - scrollThreshold)) * 0.25);
        }

        // Top header is ~60px
        if (clientY < scrollThreshold + 60) {
          dy = Math.max(5, (scrollThreshold + 60 - clientY) * 0.25);
        } else if (clientY > innerHeight - scrollThreshold) {
          dy = -Math.max(5, (clientY - (innerHeight - scrollThreshold)) * 0.25);
        }

        scrollStateRef.current.dx = dx;
        scrollStateRef.current.dy = dy;

        if ((dx !== 0 || dy !== 0) && !scrollStateRef.current.isScrolling) {
          scrollStateRef.current.isScrolling = true;
          const scrollLoop = () => {
            const { dx, dy, isScrolling } = scrollStateRef.current;
            if (!isScrolling || (dx === 0 && dy === 0)) {
              scrollStateRef.current.isScrolling = false;
              return;
            }
            const { x, y, zoom } = reactFlowInstance.getViewport();
            reactFlowInstance.setViewport({ x: x + dx, y: y + dy, zoom });
            requestAnimationFrame(scrollLoop);
          };
          requestAnimationFrame(scrollLoop);
        }
      }
    },
    [reactFlowInstance],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      scrollStateRef.current = { dx: 0, dy: 0, isScrolling: false };

      if (!reactFlowInstance) return;

      const dataStr = event.dataTransfer.getData("application/reactflow");
      if (!dataStr) return;

      const { type, label } = JSON.parse(dataStr);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(type, label, position);
    },
    [reactFlowInstance, onAddNode],
  );

  const onGroupNodes = useCallback(() => {
    const selectedNodes = nodes.filter(
      (n) => n.selected && !n.parentId && n.type !== "cyberGroup",
    );

    if (selectedNodes.length < 1) return;

    takeSnapshot();

    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      // Estimate width/height if measured is not available (using typical cyberNode size)
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
      style: {
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      },
      data: { label: "New Cluster" },
      selected: true,
    };

    const updatedChildren = selectedNodes.map((node) => ({
      ...node,
      parentId: groupId,
      expandParent: true, // Allow dragging child to expand group
      extent: "parent" as const, // Keep child inside group
      position: {
        x: node.position.x - (minX - padding),
        y: node.position.y - (minY - padding),
      },
      selected: false,
    }));

    // Remove original selected nodes instances and add the group + updated children
    setNodes((nds) => {
      const remainingNodes = nds.filter(
        (n) => !selectedNodes.find((sn) => sn.id === n.id),
      );
      return [...remainingNodes, groupNode, ...updatedChildren];
    });
  }, [nodes, setNodes, takeSnapshot]);

  const onUngroupNodes = useCallback(
    (targetGroupId?: string) => {
      const selectedGroups = targetGroupId
        ? nodes.filter((n) => n.id === targetGroupId)
        : nodes.filter((n) => n.selected && n.type === "cyberGroup");

      if (selectedGroups.length === 0) return;

      takeSnapshot();

      const groupIds = selectedGroups.map((g) => g.id);

      setNodes((nds) => {
        const result = nds
          .filter((n) => !groupIds.includes(n.id))
          .map((n) => {
            if (n.parentId && groupIds.includes(n.parentId)) {
              const parent = nds.find((g) => g.id === n.parentId);
              return {
                ...n,
                parentId: undefined,
                position: {
                  x: n.position.x + (parent?.position.x || 0),
                  y: n.position.y + (parent?.position.y || 0),
                },
              };
            }
            return n;
          });
        return result;
      });
    },
    [nodes, setNodes, takeSnapshot],
  );

  const focusNode = useCallback(
    (nodeIdOrNode: string | Node) => {
      if (!reactFlowInstance) return;
      const node = typeof nodeIdOrNode === "string"
        ? nodes.find((n) => n.id === nodeIdOrNode)
        : nodeIdOrNode;
      if (!node) return;

      const x = node.position.x + (node.measured?.width || 200) / 2;
      const y = node.position.y + (node.measured?.height || 100) / 2;
      reactFlowInstance.setCenter(x, y, { zoom: 1.2, duration: 800 });
    },
    [nodes, reactFlowInstance],
  );

  const executeFlow = useCallback(
    async (inputMessage?: string, isSilent: boolean = false) => {
      if (isSilent && isSilentExecutionRunningRef.current) {
        return null;
      }

      const runtimeBaseUrl =
        (import.meta as { env?: Record<string, string | undefined> }).env
          ?.VITE_RUNTIME_URL || "http://localhost:8787";

      if (!isSilent) {
        executionAbortRef.current?.abort();
      }

      const controller = new AbortController();
      executionAbortRef.current = controller;
      const isCurrentController = () =>
        executionAbortRef.current === controller;
      if (isSilent) {
        isSilentExecutionRunningRef.current = true;
      } else {
        setRuntimeStatus("running");
      }

      const addLog = (text: string) => {
        setPlaygroundMessages((prev) => [...prev, { role: "system", text }]);
      };
      const log = (msg: string) => {
        if (!isSilent) addLog(msg);
      };

      let hadRuntimeError = false;

      const applyEvent = (event: any) => {
        const { type, message, nodeId, data, chunk } = event;
        if (type === "log" || type === "error" || type === "nodeUpdate") {
          setExecutionLogs((prev) => [
            {
              id: Math.random().toString(36).substr(2, 9),
              time: new Date().toLocaleTimeString(),
              type,
              message:
                message ||
                (type === "nodeUpdate"
                  ? `Node ${nodeId} status: ${data?.status}`
                  : ""),
              nodeId,
            },
            ...prev.slice(0, 99),
          ]);
        }
        if (type === "llm_chunk" && chunk && !isSilent) {
          setPlaygroundMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + chunk,
              };
              return updated;
            }
            return [...prev, { role: "assistant", text: chunk }];
          });
          return;
        }
        switch (type) {
          case "log":
            log(message);
            break;
          case "nodeUpdate":
            if (!isSilent) {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
                ),
              );
            }
            break;
          case "error":
            hadRuntimeError = true;
            if (!isSilent) {
              setPlaygroundError(message);
              if (nodeId) {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === nodeId
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            status: "error",
                            errorMessage: String(message || "Execution error"),
                          },
                        }
                      : n,
                  ),
                );
              }
              log(`[Error] ${message}`);
            }
            break;
        }
      };

      log(`[System] Dispatching flow to server runtime...`);
      if (!isSilent) {
        setPlaygroundError(null);
        setExecutionLogs([]);
        setIsLogsOpenExclusive(true);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              status: "idle",
              errorMessage: undefined,
            },
          })),
        );
      }

      try {
        const serverResponse = await fetch(
          `${runtimeBaseUrl}/api/flow/execute/stream`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              nodes,
              edges,
              inputMessage,
              isSilent,
              globalVariables,
            }),
          },
        );

        if (!serverResponse.ok || !serverResponse.body) {
          const payload = await serverResponse.json().catch(() => ({}));
          throw new Error(
            payload?.error ||
              `Server execution failed: ${serverResponse.status}`,
          );
        }

        const reader = serverResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalOutput: PlaygroundWorkerOutput | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          lines.forEach((line) => {
            const raw = line.trim();
            if (!raw) return;
            let event: any;
            try {
              event = JSON.parse(raw);
            } catch {
              return;
            }

            if (event.type === "done") {
              finalOutput = (event.output ??
                null) as PlaygroundWorkerOutput | null;
              return;
            }

            if (event.type === "ping") {
              return;
            }

            if (event.type === "result") {
              finalOutput = (event.output ??
                null) as PlaygroundWorkerOutput | null;
            }

            applyEvent(event);
          });
        }

        if (buffer.trim()) {
          try {
            const trailingEvent = JSON.parse(buffer.trim());
            if (
              trailingEvent.type === "done" ||
              trailingEvent.type === "result"
            ) {
              finalOutput = (trailingEvent.output ??
                null) as PlaygroundWorkerOutput | null;
            } else {
              applyEvent(trailingEvent);
            }
          } catch {}
        }

        if (!isSilent) {
          if (!hadRuntimeError) {
            log(`[System] Flow execution finished successfully.`);
            if (isCurrentController()) {
              setRuntimeStatus("success");
            }
          } else if (isCurrentController()) {
            setRuntimeStatus("error");
          }
        }

        return finalOutput;
      } catch (serverErr) {
        const message =
          serverErr instanceof Error
            ? serverErr.message
            : "Server runtime unavailable.";

        const isAbortError =
          (serverErr instanceof DOMException &&
            serverErr.name === "AbortError") ||
          (serverErr instanceof Error && serverErr.name === "AbortError");

        if (!isSilent) {
          if (isAbortError) {
            if (isCurrentController()) {
              setRuntimeStatus("cancelled");
            }
          } else {
            hadRuntimeError = true;
            setPlaygroundError(message);
            log(`[Error] ${message}`);
            if (isCurrentController()) {
              setRuntimeStatus("error");
            }
          }
        }
        return null;
      } finally {
        if (isCurrentController()) {
          executionAbortRef.current = null;
        }
        if (isSilent) {
          isSilentExecutionRunningRef.current = false;
        }
      }
    },
    [nodes, edges, setNodes],
  );

  const appendAssistantOutput = useCallback(
    (response: PlaygroundWorkerOutput) => {
      if (typeof response === "string") {
        setPlaygroundMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && lastMsg.text) {
            return prev;
          }
          return [...prev, { role: "assistant", text: response }];
        });
        return;
      }

      const text = (response.text || "").trim();

      setPlaygroundMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.text) {
          return prev;
        }
        const next = [...prev];
        if (text) {
          next.push({ role: "assistant", text });
        }
        return next;
      });
    },
    [],
  );

  const validateFlow = useCallback((): FlowValidationIssue[] => {
    return validateFlowGraph(nodes, edges, { locale: validationLocale });
  }, [nodes, edges, validationLocale]);

  const onValidateFlow = useCallback(() => {
    const issues = validateFlow();
    setFlowIssues(issues);

    const errors = issues.filter((issue) => issue.level === "error");
    const errorsByNode = new Map<string, FlowValidationIssue[]>();
    issues
      .filter((issue) => issue.level === "error" && issue.nodeId)
      .forEach((issue) => {
        const key = issue.nodeId as string;
        const current = errorsByNode.get(key) || [];
        current.push(issue);
        errorsByNode.set(key, current);
      });

    setNodes((nds) =>
      nds.map((node) => {
        const nodeErrors = errorsByNode.get(node.id) || [];
        const currentError =
          typeof (node.data as { errorMessage?: unknown }).errorMessage ===
          "string"
            ? ((node.data as { errorMessage?: string }).errorMessage as string)
            : "";
        const isValidationError = currentError.startsWith("[Validation]");

        if (nodeErrors.length > 0) {
          return {
            ...node,
            data: {
              ...node.data,
              status: "error",
              errorMessage: `[Validation] ${nodeErrors[0].message}`,
            },
          };
        }

        if (isValidationError) {
          return {
            ...node,
            data: {
              ...node.data,
              status: "idle",
              errorMessage: undefined,
            },
          };
        }

        return node;
      }),
    );

    if (errors.length > 0) {
      setPlaygroundError(
        `Flow validation failed with ${errors.length} error(s).`,
      );
    } else {
      setPlaygroundError(null);
    }

    return errors.length === 0;
  }, [validateFlow, setNodes]);

  // Debounced Auto-validation
  useEffect(() => {
    if (nodes.length === 0) return;
    const timer = setTimeout(() => {
      onValidateFlow();
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, onValidateFlow]);

  const focusIssueNode = useCallback(
    (nodeId?: string, fieldName?: string) => {
      if (!nodeId) return;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const openConfigToken = Date.now() + Math.random();
      const focusFieldToken = Date.now() + Math.random();

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
          data:
            n.id === nodeId
              ? {
                  ...n.data,
                  __openConfigToken: openConfigToken,
                  __focusFieldName: fieldName,
                  __focusFieldToken: focusFieldToken,
                }
              : n.data,
        })),
      );

      reactFlowInstance?.setCenter(
        node.position.x + 120,
        node.position.y + 60,
        {
          zoom: 1.1,
          duration: 500,
        },
      );
    },
    [nodes, setNodes, reactFlowInstance],
  );

  const onSendMessage = useCallback(
    async (msg: string) => {
      setPlaygroundMessages((prev) => [...prev, { role: "user", text: msg }]);
      setPlaygroundMessages((prev) => [...prev, { role: "assistant", text: "" }]);
      setIsPlaygroundTyping(true);

      const response = await executeFlow(msg);

      setIsPlaygroundTyping(false);
      const responseText = typeof response === 'string' ? response : response?.text;
      if (!responseText?.trim()) {
        setPlaygroundMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && !lastMsg.text) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    },
    [executeFlow],
  );

  const onRunAll = useCallback(async () => {
    setIsPlaygroundOpen(true);
    setPlaygroundMessages((prev) => [
      ...prev,
      { role: "user", text: "[System: Deploy Flow Triggered]" },
    ]);

    const isValid = onValidateFlow();
    if (!isValid) {
      setPlaygroundError(
        "Deploy aborted. Fix validation errors shown on flow and run again.",
      );
      return;
    }

    setIsPlaygroundTyping(true);

    const response = await executeFlow();

    setIsPlaygroundTyping(false);
    if (response) {
      appendAssistantOutput(response);
    }
  }, [executeFlow, appendAssistantOutput, onValidateFlow]);

  const onClearPlaygroundMessages = useCallback(() => {
    setPlaygroundMessages(INITIAL_PLAYGROUND_MESSAGES);
    setPlaygroundError(null);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveMode) {
      interval = setInterval(() => {
        executeFlow("auto-tick", true);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLiveMode, executeFlow]);

  const onSave = useCallback(
    async (name: string, versionLabel?: string, isAutoSave: boolean = false) => {
      if (reactFlowInstance) {
        if (!isAutoSave) setIsSaving(true);
        const flow = reactFlowInstance.toObject();
        const flowId = currentFlowId || `flow-${Date.now()}`;
        const newFlow = {
          id: flowId,
          name: name || currentFlowName,
          data: {
            ...flow,
            globalVariables,
          },
          updatedAt: Date.now(),
          versionLabel,
          isAutoSave,
        };

        try {
          const response = await fetchWithAuth(`/api/flows`, {
            method: "POST",
            body: JSON.stringify(newFlow),
          });
          if (response.ok) {
            setCurrentFlowId(newFlow.id);
            setCurrentFlowName(newFlow.name);
            fetchFlows();

            // Reload flow to get updated versions
            const updatedResponse = await fetchWithAuth(`/api/flows/${newFlow.id}`);
              if (updatedResponse.ok) {
                const updatedResult = updatedResponse;
              setFlowVersions(updatedResult.versions || []);
            }

            if (!currentFlowId) {
              navigate(`/flow/${newFlow.id}`);
            }
            
            // Success: Reset auto-save baseline to prevent redundant saves
            setLastAutoSave(Date.now());
            return newFlow.id;
          }
        } catch (err) {
          console.error("Failed to save flow", err);
          // Fallback to localStorage
          const saved = localStorage.getItem("cyber-flows");
          let flows: SavedFlow[] = saved ? JSON.parse(saved) : [];
          const existingIndex = flows.findIndex((f) => f.id === newFlow.id);
          if (existingIndex >= 0) {
            flows[existingIndex] = newFlow;
          } else {
            flows.push(newFlow);
          }
          localStorage.setItem("cyber-flows", JSON.stringify(flows));
          setCurrentFlowId(newFlow.id);
          setCurrentFlowName(newFlow.name);
          if (!currentFlowId) {
            navigate(`/flow/${newFlow.id}`);
          }
          return newFlow.id;
        } finally {
          setIsSaving(false);
        }
      }
      return "";
    },
    [
      reactFlowInstance,
      currentFlowId,
      currentFlowName,
      globalVariables,
      API_BASE,
      fetchFlows,
      navigate,
    ],
  );

  // Server-side Auto-save (debounced)
  useEffect(() => {
    if (!reactFlowInstance || !currentFlowId || currentFlowId === "new") return;

    const timeout = setTimeout(() => {
      setIsAutoSaving(true);
      void onSave(currentFlowName, undefined, true)
        .then(() => {
          setIsAutoSaving(false);
          setLastAutoSave(Date.now());
        })
        .catch((err) => {
          console.error("Auto-save failed:", err);
          setIsAutoSaving(false);
        });
    }, 5000);

    return () => clearTimeout(timeout);
  }, [nodes, edges, globalVariables, reactFlowInstance, currentFlowId, onSave, currentFlowName]);

  const onLoadVersion = useCallback(
    async (version: FlowVersion) => {
      if (!currentFlowId) {
        return;
      }

      setIsRestoringVersion(true);
      try {
        const response = await fetchWithAuth(`/api/flows/${currentFlowId}/versions/${version.id}/restore`, {
          method: 'POST',
        });

        if (!response.ok || !response.flow) {
          throw new Error(response.error || 'Failed to restore version');
        }

        const restoredFlow = response.flow;
        if (restoredFlow.data) {
          setNodes((restoredFlow.data.nodes || []).map(normalizeModelNode));
          setEdges(restoredFlow.data.edges || []);
          setGlobalVariables(restoredFlow.data.globalVariables || []);
          setFlowVersions(restoredFlow.versions || []);
          setCurrentFlowName(restoredFlow.name || currentFlowName);
        }

        setIsVersionHistoryOpen(false);
      } catch (err) {
        console.error('Failed to restore version', err);
      } finally {
        setIsRestoringVersion(false);
      }
    },
    [currentFlowId, currentFlowName, setNodes, setEdges, setGlobalVariables],
  );

  const onDeleteFlow = useCallback(
    async (flowId: string) => {
      try {
        const response = await fetchWithAuth(`/api/flows/${flowId}`, {
          method: "DELETE",
        });
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

  useEffect(() => {
    if (!wasPlaygroundOpenRef.current && isPlaygroundOpen) {
      onSave(currentFlowName);
    }
    wasPlaygroundOpenRef.current = isPlaygroundOpen;
  }, [isPlaygroundOpen, onSave, currentFlowName]);

  const onCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      setCopiedNodes(selectedNodes);
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const selectedEdges = edges.filter(
        (edge) =>
          selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target),
      );
      setCopiedEdges(selectedEdges);
    }
  }, [nodes, edges]);

  const onPaste = useCallback(
    (targetPos?: { x: number; y: number }) => {
      if (copiedNodes.length > 0) {
        takeSnapshot();

        const idMap = new Map<string, string>();

        // Calculate offset if targetPos is provided
        let offset = { x: 50, y: 50 };
        if (targetPos) {
          // Find the bounding box center of copied nodes to offset correctly
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

        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: false })).concat(newNodes),
        );
        setEdges((eds) => eds.concat(newEdges));
      }
    },
    [copiedNodes, copiedEdges, setNodes, setEdges, takeSnapshot],
  );

  const onDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      takeSnapshot();
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const selectedEdges = edges.filter(
        (edge) =>
          selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target),
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

      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: false })).concat(newNodes),
      );
      setEdges((eds) => eds.concat(newEdges));
    }
  }, [nodes, edges, setNodes, setEdges, takeSnapshot]);

  const onExport = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(flow, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `cyber-flow-${Date.now()}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }, [reactFlowInstance]);

  const onImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flow = JSON.parse(e.target?.result as string);
            if (flow) {
              takeSnapshot();
              setNodes((flow.nodes || []).map(normalizeModelNode));
              setEdges(flow.edges || []);
            }
          } catch (err) {
            console.error("Failed to parse JSON file", err);
            alert("Invalid flow file.");
          }
        };
        reader.readAsText(file);
      }
      // Reset input
      event.target.value = "";
    },
    [setNodes, setEdges, takeSnapshot],
  );

  const onClear = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to clear the entire canvas? This action cannot be undone.",
      )
    ) {
      takeSnapshot();
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges, takeSnapshot]);

  const onSelectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  const { runLayout, isLayouting } = useGraphLayout({
    nodes,
    edges,
    setNodes,
    setEdges,
    reactFlowInstance,
  });

  const onLayout = useCallback(
    (mode: LayoutMode = "LR") => {
      takeSnapshot();
      void runLayout(mode).catch((error) => {
        console.error("Layout failed", error);
      });
    },
    [runLayout, takeSnapshot],
  );

  // Wrapper for FlowHeader which expects (type: string) => void
  const onLayoutHandler = useCallback(
    (type: string) => {
      onLayout(type as LayoutMode);
    },
    [onLayout],
  );

  const onDownloadImage = useCallback(() => {
    const reactFlowElement = document.querySelector(
      ".react-flow",
    ) as HTMLElement;
    if (reactFlowElement) {
      toPng(reactFlowElement, {
        backgroundColor: "#0a0a0a",
        filter: (node) => {
          // Exclude minimap and controls from the image
          if (
            node?.classList?.contains("react-flow__minimap") ||
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__panel")
          ) {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const a = document.createElement("a");
          a.setAttribute("download", `cyber-flow-${Date.now()}.png`);
          a.setAttribute("href", dataUrl);
          a.click();
        })
        .catch((err) => {
          console.error("Failed to download image", err);
          alert("Failed to download image.");
        });
    }
  }, []);

  const commandActions = useMemo<CommandAction[]>(
    () => {
      const nodeActions: CommandAction[] = Object.keys(nodeRegistry)
        .sort((left, right) => prettifyNodeLabel(left).localeCompare(prettifyNodeLabel(right)))
        .map((type) => {
          const label = prettifyNodeLabel(type);
          return {
            id: `add-node-${type}`,
            label: `Add ${label}`,
            group: "Nodes",
            shortcut: "-",
            keywords: `add node create ${type} ${label.toLowerCase()}`,
            run: () => {
              onAddNode(type, label, pendingNodeInsertPosition ?? undefined);
              setPendingNodeInsertPosition(null);
            },
          };
        });

      return [
      {
        id: "save",
        label: "Save Flow",
        group: "Flow",
        shortcut: "Ctrl/Cmd+S",
        keywords: "save flow persist",
        run: () => onSave(currentFlowName),
      },
      {
        id: "deploy",
        label: "Deploy Flow",
        group: "Flow",
        shortcut: "Ctrl/Cmd+Enter",
        keywords: "deploy run execute",
        run: () => void onRunAll(),
      },
      {
        id: "validate",
        label: "Validate Flow",
        group: "Flow",
        shortcut: "Ctrl/Cmd+Shift+K",
        keywords: "validate lint check",
        run: () => onValidateFlow(),
      },
      {
        id: "playground",
        label: "Open Playground",
        group: "Flow",
        shortcut: "-",
        keywords: "playground terminal chat",
        run: () => setIsPlaygroundOpen(true),
      },
      {
        id: "canvas-search",
        label: "Find in Canvas",
        group: "Flow",
        shortcut: "Ctrl/Cmd+F",
        keywords: "find search canvas node",
        run: () => setIsCanvasSearchOpen(true),
      },
      {
        id: "smart-layout",
        label: "Smart Layout",
        group: "Layout",
        shortcut: "Ctrl/Cmd+Shift+L",
        keywords: "layout smart auto",
        run: () => onLayout("SMART"),
      },

      {
        id: "layout-layered",
        label: "Layered Layout",
        group: "Layout",
        shortcut: "-",
        keywords: "layout layered dagre elk",
        run: () => onLayout("LAYERED"),
      },
      {
        id: "layout-force",
        label: "Force-directed Layout",
        group: "Layout",
        shortcut: "-",
        keywords: "layout force elk spring",
        run: () => onLayout("FORCE"),
      },
      {
        id: "layout-radial",
        label: "Radial Layout",
        group: "Layout",
        shortcut: "-",
        keywords: "layout radial elk",
        run: () => onLayout("RADIAL"),
      },
      {
        id: "layout-orthogonal",
        label: "Orthogonal / Box Layout",
        group: "Layout",
        shortcut: "-",
        keywords: "layout orthogonal box elk",
        run: () => onLayout("ORTHOGONAL"),
      },
      {
        id: "layout-tree",
        label: "Tree Layout",
        group: "Layout",
        shortcut: "-",
        keywords: "layout tree hierarchical elk",
        run: () => onLayout("TREE"),
      },
      {
        id: "layout-dagre-lr",
        label: "Dagre: Left → Right",
        group: "Layout",
        shortcut: "-",
        keywords: "layout dagre lr",
        run: () => onLayout("DAGRE_LR"),
      },
      {
        id: "layout-dagre-tb",
        label: "Dagre: Top → Bottom",
        group: "Layout",
        shortcut: "-",
        keywords: "layout dagre tb",
        run: () => onLayout("DAGRE_TB"),
      },
      {
        id: "layout-dagre-rl",
        label: "Dagre: Right → Left",
        group: "Layout",
        shortcut: "-",
        keywords: "layout dagre rl",
        run: () => onLayout("DAGRE_RL"),
      },
      {
        id: "layout-dagre-bt",
        label: "Dagre: Bottom → Top",
        group: "Layout",
        shortcut: "-",
        keywords: "layout dagre bt",
        run: () => onLayout("DAGRE_BT"),
      },
      {
        id: "layout-lr",
        label: "Layout Left to Right",
        group: "Layout",
        shortcut: "-",
        keywords: "layout left right lr",
        run: () => onLayout("LR"),
      },
      {
        id: "layout-tb",
        label: "Layout Top to Bottom",
        group: "Layout",
        shortcut: "-",
        keywords: "layout top bottom tb",
        run: () => onLayout("TB"),
      },
      {
        id: "undo",
        label: "Undo",
        group: "Edit",
        shortcut: "Ctrl/Cmd+Z",
        keywords: "undo",
        run: () => undo(),
      },
      {
        id: "redo",
        label: "Redo",
        group: "Edit",
        shortcut: "Ctrl/Cmd+Y",
        keywords: "redo",
        run: () => redo(),
      },
      {
        id: "copy",
        label: "Copy Selection",
        group: "Edit",
        shortcut: "Ctrl/Cmd+C",
        keywords: "copy duplicate",
        run: () => onCopy(),
      },
      {
        id: "paste",
        label: "Paste",
        group: "Edit",
        shortcut: "Ctrl/Cmd+V",
        keywords: "paste duplicate",
        run: () => onPaste(),
      },
      {
        id: "duplicate",
        label: "Duplicate Selection",
        group: "Edit",
        shortcut: "Ctrl/Cmd+D",
        keywords: "duplicate copy clone",
        run: () => onDuplicate(),
      },
      {
        id: "toggle-minimap",
        label: "Toggle Minimap",
        group: "View",
        shortcut: "Ctrl/Cmd+Shift+M",
        keywords: "minimap view",
        run: () => setShowMinimap((prev) => !prev),
      },
      {
        id: "fit-view",
        label: "Fit View",
        group: "View",
        shortcut: "Ctrl/Cmd+Shift+F",
        keywords: "fit view zoom",
        run: () => reactFlowInstance?.fitView({ duration: 800 }),
      },
      {
        id: "toggle-live",
        label: "Toggle Live Mode",
        group: "Flow",
        shortcut: "-",
        keywords: "live mode",
        run: () => setIsLiveMode((prev) => !prev),
      },
      {
        id: "group",
        label: "Group Selected Nodes",
        group: "Canvas",
        shortcut: "Ctrl/Cmd+Shift+G",
        keywords: "group cluster",
        run: () => onGroupNodes(),
      },
      {
        id: "ungroup",
        label: "Ungroup Selected",
        group: "Canvas",
        shortcut: "Ctrl/Cmd+Shift+U",
        keywords: "ungroup release",
        run: () => onUngroupNodes(),
      },
      {
        id: "export-json",
        label: "Export JSON",
        group: "I/O",
        shortcut: "Ctrl/Cmd+Shift+E",
        keywords: "export json",
        run: () => onExport(),
      },
      {
        id: "import-json",
        label: "Import JSON",
        group: "I/O",
        shortcut: "Ctrl/Cmd+Shift+I",
        keywords: "import json",
        run: () => importInputRef.current?.click(),
      },
      {
        id: "download-image",
        label: "Download Image",
        group: "I/O",
        shortcut: "-",
        keywords: "download image png",
        run: () => onDownloadImage(),
      },
      {
        id: "clear-canvas",
        label: "Clear Canvas",
        group: "Canvas",
        shortcut: "-",
        keywords: "clear remove all",
        run: () => onClear(),
      },
      {
        id: "select-all",
        label: "Select All Nodes",
        group: "Canvas",
        shortcut: "Ctrl/Cmd+A",
        keywords: "select all nodes edges",
        run: () => onSelectAll(),
      },
      {
        id: "toggle-shortcuts",
        label: "Toggle Shortcut Help",
        group: "Help",
        shortcut: "Ctrl/Cmd+Shift+/",
        keywords: "shortcuts help",
        run: () => setShowShortcutHelpExclusive((prev) => !prev),
      },
      ...nodeActions,
    ];
    },
    [
      currentFlowName,
      onSave,
      onRunAll,
      onValidateFlow,
      onLayout,
      undo,
      redo,
      onCopy,
      onPaste,
      reactFlowInstance,
      onGroupNodes,
      onUngroupNodes,
      onExport,
      onDownloadImage,
      onClear,
      onAddNode,
      pendingNodeInsertPosition,
    ],
  );

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return commandActions;
    return commandActions.filter((command) => {
      const haystack =
        `${command.label} ${command.group} ${command.keywords}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [commandActions, commandQuery]);

  useEffect(() => {
    setCommandIndex((idx) => {
      if (filteredCommands.length === 0) return 0;
      return Math.min(idx, filteredCommands.length - 1);
    });
  }, [filteredCommands]);

  useEffect(() => {
    if (!showCommandPalette) return;
    setCommandIndex(0);
    setTimeout(() => {
      commandInputRef.current?.focus();
      if (!commandQuery) {
        commandInputRef.current?.select();
      }
    }, 0);
  }, [showCommandPalette, commandQuery]);

  useEffect(() => {
    if (!showCommandPalette) {
      setPendingNodeInsertPosition(null);
    }
  }, [showCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

      if (!key) {
        return;
      }

      if (showCommandPalette) {
        if (key === "escape") {
          e.preventDefault();
          setShowCommandPalette(false);
          return;
        }
        if (key === "arrowdown") {
          e.preventDefault();
          setCommandIndex((prev) =>
            filteredCommands.length === 0
              ? 0
              : (prev + 1) % filteredCommands.length,
          );
          return;
        }
        if (key === "arrowup") {
          e.preventDefault();
          setCommandIndex((prev) =>
            filteredCommands.length === 0
              ? 0
              : (prev - 1 + filteredCommands.length) % filteredCommands.length,
          );
          return;
        }
        if (key === "enter") {
          e.preventDefault();
          const command = filteredCommands[commandIndex];
          if (command) {
            command.run();
            setShowCommandPalette(false);
          }
          return;
        }
      }

      if (isMod && !e.shiftKey && key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if (isMod && !e.shiftKey && key === "f") {
        e.preventDefault();
        setIsCanvasSearchOpen((prev) => !prev);
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (key === "escape") {
        setIsToolsMenuOpen(false);
        setShowShortcutHelpExclusive(false);
        setShowCommandPalette(false);
        return;
      }

      if (isMod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (isMod && key === "y") {
        e.preventDefault();
        redo();
      } else if (isMod && key === "c") {
        onCopy();
      } else if (isMod && key === "v") {
        onPaste();
      } else if (isMod && key === "a") {
        e.preventDefault();
        onSelectAll();
      } else if (isMod && key === "d") {
        e.preventDefault();
        onDuplicate();
      } else if (key === "delete" || key === "backspace") {
        const selectedNodes = nodes.filter((n) => n.selected);
        const selectedEdges = edges.filter((e) => e.selected);
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          takeSnapshot();
          deleteElements({ nodes: selectedNodes, edges: selectedEdges });
        }
      } else if (isMod && key === "s") {
        e.preventDefault();
        onSave(currentFlowName);
      } else if (isMod && e.shiftKey && key === "k") {
        e.preventDefault();
        onValidateFlow();
      } else if (isMod && key === "enter") {
        e.preventDefault();
        onRunAll();
      } else if (isMod && e.shiftKey && key === "l") {
        e.preventDefault();
        onLayout("SMART");
      } else if (isMod && e.shiftKey && key === "g") {
        e.preventDefault();
        onGroupNodes();
      } else if (isMod && e.shiftKey && key === "u") {
        e.preventDefault();
        onUngroupNodes();
      } else if (isMod && e.shiftKey && key === "m") {
        e.preventDefault();
        setShowMinimap((prev) => !prev);
      } else if (isMod && e.shiftKey && key === "f") {
        e.preventDefault();
        reactFlowInstance?.fitView({ duration: 800 });
      } else if (isMod && e.shiftKey && key === "e") {
        e.preventDefault();
        onExport();
      } else if (isMod && e.shiftKey && key === "i") {
        e.preventDefault();
        importInputRef.current?.click();
      } else if (isMod && e.shiftKey && key === "/") {
        e.preventDefault();
        setShowShortcutHelpExclusive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showCommandPalette,
    filteredCommands,
    commandIndex,
    undo,
    redo,
    onCopy,
    onPaste,
    onSave,
    currentFlowName,
    onValidateFlow,
    onRunAll,
    onLayout,
    onGroupNodes,
    onUngroupNodes,
    reactFlowInstance,
    onExport,
  ]);

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const isAnimated =
        sourceNode?.data?.status === "running" || edge.animated;
      return {
        ...edge,
        animated: isAnimated,
      };
    });
  }, [edges, nodes]);

  return (
    <div className="w-full h-screen min-h-0 bg-cyber-dark text-white overflow-hidden flex flex-col">
      <FlowHeader
        currentFlowName={currentFlowName}
        setCurrentFlowName={setCurrentFlowName}
        isSaving={isSaving}
        onSave={onSave}
        onRunAll={onRunAll}
        onValidateFlow={onValidateFlow}
        setIsPlaygroundOpen={setIsPlaygroundOpen}
        setIsFlowManagerOpen={setIsFlowManagerOpen}
        setIsToolsMenuOpen={setIsToolsMenuOpen}
        isToolsMenuOpen={isToolsMenuOpen}
        setIsVariablesPanelOpen={setIsVariablesPanelOpen}
        isVariablesPanelOpen={isVariablesPanelOpen}
        setIsVersionHistoryOpen={setIsVersionHistoryOpen}
        isVersionHistoryOpen={isVersionHistoryOpen}
        validationLocale={validationLocale}
        setValidationLocale={setValidationLocale}
        showShortcutHelp={showShortcutHelp}
        setShowShortcutHelp={setShowShortcutHelpExclusive}
        showCommandPalette={showCommandPalette}
        setShowCommandPalette={setShowCommandPalette}
        importInputRef={importInputRef}
        onImport={onImport}
        onExport={onExport}
        onCopy={onCopy}
        onPaste={onPaste}
        onDuplicate={onDuplicate}
        undo={undo}
        redo={redo}
        onLayout={onLayoutHandler}
        onGroupNodes={onGroupNodes}
        onUngroupNodes={onUngroupNodes}
        onDownloadImage={onDownloadImage}
        onClear={onClear}
        setShowMinimap={setShowMinimap}
        setIsLiveMode={setIsLiveMode}
        isLiveMode={isLiveMode}
        reactFlowInstance={reactFlowInstance}
        navigate={navigate}
        lastAutoSave={lastAutoSave}
        isAutoSaving={isAutoSaving}
        isOnline={isOnline}
      />

      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        <Sidebar onAddNode={onAddNode} />

        {/* React Flow Canvas */}
        <div
          className="flex-1 min-h-0 min-w-0 relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={renderedEdges}
            onNodesChange={onNodesChangeWrapper}
            onEdgesChange={onEdgesChangeWrapper}
            onNodeDragStart={takeSnapshot}
            onSelectionDragStart={takeSnapshot}
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenuHandler}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            autoPanOnNodeDrag={true}
            autoPanOnConnect={true}
            className="bg-cyber-dark"
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              type: "cyberEdge",
              animated: true,
              style: { stroke: "#4b5563", strokeWidth: 1.5 },
            }}
          >
            <Background
              variant={BackgroundVariant.Lines}
              gap={32}
              size={1}
              color="#1a1a1a"
              className="bg-cyber-dark"
            />

            <Controls
              position="top-left"
              className="!bg-cyber-panel !border-cyber-border !rounded-lg overflow-hidden !m-6 shadow-2xl"
            />

            {showMinimap && (
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === "cyberGroup")
                    return "rgba(255, 255, 255, 0.1)";
                  const node = n as CustomNodeType;
                  const type = node.data.type || "";
                  if (type === "Agent") return "#7000ff";
                  if (type === "LanguageModelComponent") return "#a855f7";
                  if (type.includes("Tool")) return "#f59e0b";
                  return "#00f0ff";
                }}
                maskColor="rgba(0, 0, 0, 0.8)"
                className="!bg-cyber-panel/50 !border-cyber-border !rounded-xl !bottom-8 !right-8 shadow-2xl"
              />
            )}

            <ValidationPanel
              flowIssues={flowIssues}
              focusIssueNode={focusIssueNode}
            />

            <ShortcutHelp
              showShortcutHelp={showShortcutHelp}
              setShowShortcutHelp={setShowShortcutHelpExclusive}
            />
          </ReactFlow>


          <CanvasSearch
            isOpen={isCanvasSearchOpen}
            onClose={() => setIsCanvasSearchOpen(false)}
            nodes={nodes}
            setNodes={setNodes}
          />
          <GlobalPreview />
          <NodeConfigModal
            isOpen={isNodeConfigOpen}
            onClose={() => { setIsNodeConfigOpen(false); setConfigNodeId(null); setHighlightedConfigField(null); }}
            data={(currentConfigNode?.data as CustomNodeType['data'] | undefined) || { label: '', type: '', configSchema: [] }}
            updateNodeData={updateNodeDataById}
            handleParamChange={handleConfigParamChange}
            highlightedField={highlightedConfigField}
            configFieldRefs={configFieldRefs}
            globalVariables={globalVariables}
          />
        </div>

        <LogViewer
          isLogsOpen={isLogsOpen}
          setIsLogsOpen={setIsLogsOpenExclusive}
          executionLogs={executionLogs}
        />
      </div>

      <Playground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        messages={playgroundMessages}
        isTyping={isPlaygroundTyping}
        runtimeStatus={runtimeStatus}
        error={playgroundError}
        onErrorDismiss={() => setPlaygroundError(null)}
        onSendMessage={onSendMessage}
        onClearMessages={onClearPlaygroundMessages}
      />

      <CommandPalette
        showCommandPalette={showCommandPalette}
        setShowCommandPalette={setShowCommandPalette}
        commandQuery={commandQuery}
        setCommandQuery={setCommandQuery}
        commandIndex={commandIndex}
        setCommandIndex={setCommandIndex}
        filteredCommands={filteredCommands}
        commandInputRef={commandInputRef}
      />
      <FlowManager
        isFlowManagerOpen={isFlowManagerOpen}
        setIsFlowManagerOpen={setIsFlowManagerOpen}
        savedFlows={savedFlows}
        onDeleteFlow={onDeleteFlow}
        navigate={navigate}
      />
      <VersionHistoryPanel
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versions={flowVersions}
        onLoadVersion={onLoadVersion}
        isRestoring={isRestoringVersion}
      />
      <VariablesPanel
        isOpen={isVariablesPanelOpen}
        onClose={() => setIsVariablesPanelOpen(false)}
        variables={globalVariables}
        onVariablesChange={setGlobalVariables}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          actions={{
            onFocus: () => {
              const node = contextMenu.node;
              if (node) focusNode(node);
            },
            onRun: () => {
              const node = contextMenu.node;
              if (node) {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? { ...n, data: { ...n.data, status: "running" } }
                      : n,
                  ),
                );
                // Simulate execution
                setTimeout(() => {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === node.id
                        ? { ...n, data: { ...n.data, status: "success" } }
                        : n,
                    ),
                  );
                  setTimeout(() => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === node.id
                          ? { ...n, data: { ...n.data, status: "idle" } }
                          : n,
                      ),
                    );
                  }, 3000);
                }, 1000);
              }
            },
            onOpenConfig: () => {
              const node = contextMenu.node;
              if (node) {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            __openConfigToken: Date.now(),
                          },
                        }
                      : n,
                  ),
                );
              }
            },
            onOpenData: () => {
              const node = contextMenu.node;
              if (node) {
                // Similar to config but for data
                // In CyberNode we use local state for isDataOpen, but we can trigger it via data prop
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            __openDataToken: Date.now(),
                          },
                        }
                      : n,
                  ),
                );
              }
            },
            onCopy: () => onCopy(),
            onPaste: (pos) => {
              if (reactFlowInstance) {
                const project = reactFlowInstance.screenToFlowPosition(pos);
                onPaste(project);
              } else {
                onPaste();
              }
            },
            onDuplicate: () => onDuplicate(),
            onDelete: () => {
              const node = contextMenu.node;
              if (node) {
                takeSnapshot();
                deleteElements({ nodes: [node] });
              }
            },
            onUngroup: () => {
              const node = contextMenu.node;
              if (node && node.type === "cyberGroup") {
                onUngroupNodes(node.id);
              }
            },
            onLayout: (type?: string) => {
              if (type) {
                onLayout(type as LayoutMode);
              } else {
                onLayout("LR");
              }
            },
            onAddNode: (pos) => {
              if (reactFlowInstance) {
                const project = reactFlowInstance.screenToFlowPosition(pos);
                setPendingNodeInsertPosition(project);
                setCommandQuery("add node ");
                setCommandIndex(0);
                setShowCommandPalette(true);
              }
            },
            onAddNote: (pos) => {
              if (reactFlowInstance) {
                const project = reactFlowInstance.screenToFlowPosition(pos);
                const newNode: Node = {
                  id: `note-${Date.now()}`,
                  type: "cyberNote",
                  position: project,
                  data: { label: "", type: "cyberNote", status: "idle" },
                };
                takeSnapshot();
                setNodes((nds) => nds.concat(newNode));
              }
            },
            onSelectAll: onSelectAll,
          }}
        />
      )}
    </div>
  );
};

const FlowEditor = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default FlowEditor;
