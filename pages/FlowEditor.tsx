import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  NodeTypes,
  EdgeTypes,
  Node,
  ReactFlowProvider,
  useReactFlow,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import CyberNode from "../components/CyberNode";
import CyberGroupNode from "../components/CyberGroupNode";
import CyberEdge from "../components/CyberEdge";
import Sidebar from "../components/Sidebar";
import Playground from "../components/Playground";
import { initialNodes, initialEdges } from "../data";
import { CustomNodeType } from "../types";
import {
  Maximize2,
  GitBranch,
  Play,
  Terminal,
  Layers,
  Save,
  Download,
  Trash2,
  Ungroup,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Upload,
  FileDown,
  LayoutGrid,
  Image as ImageIcon,
  Map as MapIcon,
  Maximize,
  ArrowRight,
  ArrowDown,
  Wand2,
  FolderOpen,
  Activity,
  Home,
  AlertTriangle,
  Settings2,
  Keyboard,
} from "lucide-react";
import dagre from "dagre";
import { toPng } from "html-to-image";
import { useNavigate, useParams } from "react-router-dom";
import {
  createNodeDataByType,
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeSourceHandles,
  normalizeNodeWithRegistry,
} from "../node-registry";
import {
  type ValidationLocale,
  type FlowValidationIssue,
  validateFlowGraph,
} from "../flow-validation";

const nodeTypes: NodeTypes = {
  cyberNode: CyberNode,
  cyberGroup: CyberGroupNode,
};

const edgeTypes: EdgeTypes = {
  cyberEdge: CyberEdge,
};

type PortDataType =
  | "text"
  | "chat_model"
  | "embedding_model"
  | "tool"
  | "boolean_route"
  | "any";

type PlaygroundWorkerOutput =
  | string
  | {
      text?: string;
    };

type PlaygroundMessage = {
  role: string;
  text: string;
};

type RuntimeStatus = "idle" | "running" | "success" | "error" | "cancelled";

type CommandAction = {
  id: string;
  label: string;
  group: string;
  shortcut: string;
  keywords: string;
  run: () => void;
};

type SavedFlow = {
  id: string;
  name: string;
  data: ReturnType<ReactFlowInstance["toObject"]>;
  updatedAt: number;
};

const INITIAL_PLAYGROUND_MESSAGES: PlaygroundMessage[] = [
  {
    role: "assistant",
    text: "Protocol initialized. Ready to test the workflow. How can I assist?",
  },
];

const normalizeModelNode = (node: Node): Node =>
  normalizeNodeWithRegistry(node);

const readPortType = (
  node: CustomNodeType,
  key: string,
  fallback: PortDataType,
): PortDataType => {
  const raw = getNodeFieldValue(node.data, key);
  if (typeof raw !== "string") return fallback;
  const allowed: PortDataType[] = [
    "text",
    "chat_model",
    "embedding_model",
    "tool",
    "boolean_route",
    "any",
  ];
  return allowed.includes(raw as PortDataType)
    ? (raw as PortDataType)
    : fallback;
};

const inferSourcePortType = (
  node: CustomNodeType,
  handleId?: string | null,
): PortDataType => {
  const nodeType = node.data.type;

  const registrySourceHandles = getNodeSourceHandles(nodeType);
  if (registrySourceHandles.length > 0) {
    const matchedHandle = handleId
      ? registrySourceHandles.find((handle) => handle.id === handleId)
      : registrySourceHandles.find((handle) => !handle.id);
    if (matchedHandle) {
      if (matchedHandle.badgeParamKey) {
        return readPortType(
          node,
          matchedHandle.badgeParamKey,
          matchedHandle.badgeFallback || matchedHandle.portType,
        );
      }
      return matchedHandle.portType;
    }
  }

  if (handleId === "as_tool")
    return readPortType(node, "as_tool_output_type", "tool");
  if (handleId === "response")
    return readPortType(node, "response_output_type", "text");
  if (handleId === "true")
    return readPortType(node, "true_output_type", "boolean_route");
  if (handleId === "false")
    return readPortType(node, "false_output_type", "boolean_route");

  if (nodeType === "ChatModelComponent")
    return readPortType(node, "output_type", "chat_model");
  if (
    nodeType === "OllamaChatModelComponent" ||
    nodeType === "VLLMChatModelComponent"
  )
    return readPortType(node, "output_type", "chat_model");
  if (nodeType === "EmbeddingModelComponent")
    return readPortType(node, "output_type", "embedding_model");
  if (
    nodeType === "OllamaEmbeddingModelComponent" ||
    nodeType === "VLLMEmbeddingModelComponent"
  )
    return readPortType(node, "output_type", "embedding_model");
  if (nodeType === "LanguageModelComponent") {
    return readPortType(
      node,
      "output_type",
      getNodeFieldValue(node.data, "modelType") === "Embedding"
        ? "embedding_model"
        : "chat_model",
    );
  }

  if (
    [
      "ChatInput",
      "TextInput",
      "Prompt Template",
      "GitLabMRReviewTemplate",
      "GitLabMRCommentTemplate",
      "CurrentTime",
      "ChatOutput",
    ].includes(nodeType)
  ) {
    return readPortType(node, "output_type", "text");
  }

  return readPortType(node, "output_type", "any");
};

const inferTargetPortType = (
  node: CustomNodeType,
  handleId?: string | null,
): PortDataType => {
  const registryInputHandles = getNodeInputHandles(node.data.type);
  if (registryInputHandles.length > 0) {
    const matchedHandle = handleId
      ? registryInputHandles.find((handle) => handle.id === handleId)
      : registryInputHandles.find((handle) => !handle.id);
    if (matchedHandle) {
      return matchedHandle.portType;
    }
  }

  if (handleId === "tools") return "tool";
  if (handleId === "agent_llm") return "chat_model";
  if (handleId === "embedding_model") return "embedding_model";
  if (handleId === "system_prompt" || handleId === "input_value") return "text";

  if (node.data.type === "ChatOutput") return "text";
  if (node.data.type === "Prompt Template") return "text";
  if (node.data.type === "GitLabMRReviewTemplate") return "text";
  if (node.data.type === "GitLabMRCommentTemplate") return "text";
  if (node.data.type === "elasticsearch_search") return "text";

  return "any";
};

const Flow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
  const [validationLocale, setValidationLocale] = useState<ValidationLocale>(
    () =>
      typeof navigator !== "undefined" &&
      navigator.language.toLowerCase().startsWith("vi")
        ? "vi"
        : "en",
  );
  const [activeConnectionHint, setActiveConnectionHint] = useState<{
    sourceNodeId: string;
    sourcePortType: PortDataType;
  } | null>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<{ id: string; time: string; type: string; message: string; nodeId?: string }[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const API_BASE = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_RUNTIME_URL || 'http://localhost:8787';
const API_FLOWS = `${API_BASE}/api/flows`;

  const fetchFlows = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/flows`);
      if (res.ok) {
        const data = await res.json();
        setSavedFlows(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch flows", err);
    }
    return [];
  }, []);

  const renderedNodes = useMemo(() => {
    if (!activeConnectionHint) return nodes;
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        __activeSourceNodeId: activeConnectionHint.sourceNodeId,
        __activeSourcePortType: activeConnectionHint.sourcePortType,
      },
    }));
  }, [nodes, activeConnectionHint]);

  useEffect(() => {
    const loadFlow = async () => {
      if (id && id !== "new") {
        try {
          const res = await fetch(`${API_BASE}/flows/${id}`);
          if (res.ok) {
            const flow = await res.json();
            setNodes((flow.data.nodes || []).map(normalizeModelNode));
            setEdges(flow.data.edges || []);
            setCurrentFlowId(flow.id);
            setCurrentFlowName(flow.name);
            shouldFitAfterLoadRef.current = true;
          } else {
            // Fallback to localStorage for migration
            const saved = localStorage.getItem("cyber-flows");
            if (saved) {
              const flows: SavedFlow[] = JSON.parse(saved);
              const flow = flows.find((f) => f.id === id);
              if (flow) {
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
  const executionAbortRef = useRef<AbortController | null>(null);
  const isSilentExecutionRunningRef = useRef(false);
  const wasPlaygroundOpenRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

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
      const isSignificant = changes.some(
        (c) => c.type === "remove" || c.type === "add",
      );
      if (isSignificant) {
        takeSnapshot();
      }
      onNodesChange(changes);
    },
    [onNodesChange, takeSnapshot],
  );

  const onEdgesChangeWrapper = useCallback(
    (changes: EdgeChange[]) => {
      const isSignificant = changes.some(
        (c) => c.type === "remove" || c.type === "add",
      );
      if (isSignificant) {
        takeSnapshot();
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, takeSnapshot],
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
        let label = "";
        let stroke = "#4b5563";

        const portColor = (portType: PortDataType) => {
          if (portType === "text") return "#22c55e";
          if (portType === "chat_model") return "#a855f7";
          if (portType === "embedding_model") return "#3b82f6";
          if (portType === "tool") return "#f59e0b";
          if (portType === "boolean_route") return "#ec4899";
          return "#4b5563";
        };

        const portLabel = (portType: PortDataType) => {
          if (portType === "chat_model") return "CHAT_LLM";
          if (portType === "embedding_model") return "EMBEDDING";
          if (portType === "boolean_route") return "BOOL";
          return portType.toUpperCase();
        };

        if (params.targetHandle === "tools") {
          label = "TOOL";
          stroke = "#f59e0b"; // amber-500
        } else if (params.targetHandle === "agent_llm") {
          label = "CHAT_LLM";
          stroke = "#a855f7"; // purple-500
        } else if (params.targetHandle === "embedding_model") {
          label = "EMBEDDING";
          stroke = "#3b82f6"; // blue-500
        } else if (params.sourceHandle === "true") {
          label = "TRUE";
          stroke = "#22c55e"; // green-500
        } else if (params.sourceHandle === "false") {
          label = "FALSE";
          stroke = "#ef4444"; // red-500
        } else if (params.sourceHandle === "as_tool") {
          label = "AS TOOL";
          stroke = "#f59e0b"; // amber-500
        } else if (params.targetHandle === "system_prompt") {
          label = "SYSTEM";
          stroke = "#64748b"; // slate-500
        } else if (params.targetHandle === "input_value") {
          label = "INPUT";
          stroke = "#22c55e"; // green-500
        } else if (params.sourceHandle === "response") {
          label = "OUTPUT";
          stroke = "#22d3ee"; // cyan-400
        } else {
          const effectiveType =
            targetPortType !== "any" ? targetPortType : sourcePortType;
          label = portLabel(effectiveType);
          stroke = portColor(effectiveType);
        }

        return addEdge(
          {
            ...params,
            type: "cyberEdge",
            animated: true,
            label,
            style: { stroke, strokeWidth: 1.5 },
            labelStyle: { fill: stroke },
          },
          eds,
        );
      });
    },
    [nodes, edges, setEdges, takeSnapshot],
  );

  const onConnectStart = useCallback(
    (_: unknown, params: any) => {
      if (!params?.nodeId || params?.handleType !== "source") {
        setActiveConnectionHint(null);
        return;
      }

      const sourceNode = nodes.find((n) => n.id === params.nodeId) as
        | CustomNodeType
        | undefined;
      if (!sourceNode) {
        setActiveConnectionHint(null);
        return;
      }

      setActiveConnectionHint({
        sourceNodeId: sourceNode.id,
        sourcePortType: inferSourcePortType(sourceNode, params.handleId),
      });
    },
    [nodes],
  );

  const onConnectEnd = useCallback(() => {
    setActiveConnectionHint(null);
  }, []);

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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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



  const onUngroupNodes = useCallback(() => {
    const selectedGroups = nodes.filter(
      (n) => n.selected && n.type === "cyberGroup",
    );
    if (selectedGroups.length === 0) return;

    takeSnapshot();

    const groupIds = selectedGroups.map((g) => g.id);

    setNodes((nds) => {
      return nds
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
    });
  }, [nodes, setNodes, takeSnapshot]);

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
      const isCurrentController = () => executionAbortRef.current === controller;
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
        const { type, message, nodeId, data } = event;
        if (type === 'log' || type === 'error' || type === 'nodeUpdate') {
          setExecutionLogs(prev => [
            { id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleTimeString(), type, message: message || (type === 'nodeUpdate' ? `Node ${nodeId} status: ${data?.status}` : ''), nodeId },
            ...prev.slice(0, 99)
          ]);
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
        setIsLogsOpen(true);
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
          (serverErr instanceof DOMException && serverErr.name === "AbortError") ||
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
        setPlaygroundMessages((prev) => [
          ...prev,
          { role: "assistant", text: response },
        ]);
        return;
      }

      const text = (response.text || "").trim();

      setPlaygroundMessages((prev) => {
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
      setIsPlaygroundTyping(true);

      const response = await executeFlow(msg);

      setIsPlaygroundTyping(false);
      if (response) {
        appendAssistantOutput(response);
      }
    },
    [executeFlow, appendAssistantOutput],
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
    async (name: string) => {
      if (reactFlowInstance) {
        setIsSaving(true);
        const flow = reactFlowInstance.toObject();
        const flowId = currentFlowId || `flow-${Date.now()}`;
        const newFlow: SavedFlow = {
          id: flowId,
          name: name || currentFlowName,
          data: flow,
          updatedAt: Date.now(),
        };

        try {
          const res = await fetch(`${API_BASE}/flows`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFlow),
          });
          
          if (res.ok) {
            setCurrentFlowId(newFlow.id);
            setCurrentFlowName(newFlow.name);
            fetchFlows();
            if (!currentFlowId) {
              navigate(`/flow/${newFlow.id}`);
            }
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
    [reactFlowInstance, currentFlowId, currentFlowName, navigate, fetchFlows],
  );

  const onDeleteFlow = useCallback(async (flowId: string) => {
    if (!window.confirm("Are you sure you want to delete this flow?")) return;
    try {
      const res = await fetch(`${API_BASE}/flows/${flowId}`, { method: "DELETE" });
      if (res.ok) {
        fetchFlows();
        if (currentFlowId === flowId) {
          navigate("/flow/new");
        }
      }
    } catch (err) {
      console.error("Failed to delete flow", err);
    }
  }, [currentFlowId, navigate, fetchFlows]);

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

  const onPaste = useCallback(() => {
    if (copiedNodes.length > 0) {
      takeSnapshot();

      const idMap = new Map<string, string>();

      const newNodes = copiedNodes.map((node) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
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
  }, [copiedNodes, copiedEdges, setNodes, setEdges, takeSnapshot]);

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

  const onLayout = useCallback(
    (direction: "LR" | "TB" | "SMART" = "LR") => {
      takeSnapshot();

      if (direction === "SMART") {
        const runSmartLayoutWithElk = async () => {
          type LayoutHandlePlacement = {
            position: "top" | "right" | "bottom" | "left";
            index: number;
            count: number;
            offsetRatio: number;
          };

          const getNodeType = (node: Node): string => {
            const dataType =
              typeof (node.data as { type?: unknown })?.type === "string"
                ? ((node.data as { type?: string }).type as string)
                : undefined;
            if (dataType) return dataType;
            return typeof node.type === "string" ? node.type : "cyberNode";
          };

          const getNodeSize = (node: Node) => ({
            width:
              typeof node.measured?.width === "number"
                ? node.measured.width
                : getNodeType(node) === "Agent"
                  ? 350
                  : 300,
            height:
              typeof node.measured?.height === "number"
                ? node.measured.height
                : getNodeType(node) === "Agent"
                  ? 250
                  : 150,
          });

          const extractPromptVariables = (node: Node): string[] => {
            const nodeType = getNodeType(node);
            if (nodeType !== "Prompt Template" && nodeType !== "PromptTemplate") {
              return [];
            }
            const template = String(
              getNodeFieldValue(
                node.data as CustomNodeType["data"],
                "template",
              ) || "",
            );
            return Array.from(
              new Set(
                Array.from(template.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g)).map(
                  (match) => match[1],
                ),
              ),
            ).slice(0, 8);
          };

          const normalizeOffsetRatio = (
            index: number,
            count: number,
            explicitOffsetPercent?: number,
          ) => {
            if (typeof explicitOffsetPercent === "number") {
              return Math.max(0, Math.min(1, explicitOffsetPercent / 100));
            }
            if (count <= 1) return 0.5;
            return (index + 1) / (count + 1);
          };

          const resolveSourcePlacement = (
            node: Node,
            handleId?: string | null,
          ): LayoutHandlePlacement => {
            const nodeType = getNodeType(node);
            const registryHandles = getNodeSourceHandles(nodeType);
            if (registryHandles.length > 0) {
              const index = handleId
                ? registryHandles.findIndex((handle) => handle.id === handleId)
                : registryHandles.findIndex((handle) => !handle.id);
              const safeIndex = index >= 0 ? index : 0;
              const handle = registryHandles[safeIndex];
              return {
                position: handle.position,
                index: safeIndex,
                count: registryHandles.length,
                offsetRatio: normalizeOffsetRatio(
                  safeIndex,
                  registryHandles.length,
                  handle.offsetPercent,
                ),
              };
            }

            return {
              position: handleId === "as_tool" ? "top" : "right",
              index: 0,
              count: 1,
              offsetRatio: 0.5,
            };
          };

          const resolveTargetPlacement = (
            node: Node,
            handleId?: string | null,
          ): LayoutHandlePlacement => {
            const nodeType = getNodeType(node);
            if (nodeType === "Prompt Template" || nodeType === "PromptTemplate") {
              const promptVariables = extractPromptVariables(node);
              if (promptVariables.length > 0 && handleId) {
                const variableIndex = promptVariables.indexOf(handleId);
                if (variableIndex >= 0) {
                  return {
                    position: "left",
                    index: variableIndex,
                    count: promptVariables.length,
                    offsetRatio: normalizeOffsetRatio(
                      variableIndex,
                      promptVariables.length,
                    ),
                  };
                }
              }
            }

            const registryHandles = getNodeInputHandles(nodeType);
            if (registryHandles.length > 0) {
              const index = handleId
                ? registryHandles.findIndex((handle) => handle.id === handleId)
                : registryHandles.findIndex((handle) => !handle.id);
              const safeIndex = index >= 0 ? index : 0;
              const handle = registryHandles[safeIndex];
              return {
                position: handle.position,
                index: safeIndex,
                count: registryHandles.length,
                offsetRatio: normalizeOffsetRatio(
                  safeIndex,
                  registryHandles.length,
                  handle.offsetPercent,
                ),
              };
            }

            return {
              position: "left",
              index: 0,
              count: 1,
              offsetRatio: 0.5,
            };
          };

          const sideByPosition = (
            position: LayoutHandlePlacement["position"],
          ): "NORTH" | "EAST" | "SOUTH" | "WEST" => {
            if (position === "top") return "NORTH";
            if (position === "right") return "EAST";
            if (position === "bottom") return "SOUTH";
            return "WEST";
          };

          const nodeById = new Map(nodes.map((node) => [node.id, node]));
          const portsByNode = new Map<string, any[]>();
          const portIdByKey = new Map<string, string>();

          const ensurePort = (
            nodeId: string,
            kind: "source" | "target",
            handleId: string | null | undefined,
            placement: LayoutHandlePlacement,
          ) => {
            const normalizedHandle = handleId || "__default__";
            const key = `${nodeId}|${kind}|${normalizedHandle}`;
            const existing = portIdByKey.get(key);
            if (existing) return existing;

            const portId = `${nodeId}::${kind}::${normalizedHandle}`;
            const ports = portsByNode.get(nodeId) || [];
            ports.push({
              id: portId,
              width: 10,
              height: 10,
              layoutOptions: {
                "org.eclipse.elk.port.side": sideByPosition(placement.position),
                "org.eclipse.elk.port.index": String(placement.index),
              },
            });
            portsByNode.set(nodeId, ports);
            portIdByKey.set(key, portId);
            return portId;
          };

          const elkEdges = edges
            .map((edge) => {
              const sourceNode = nodeById.get(edge.source);
              const targetNode = nodeById.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const sourcePlacement = resolveSourcePlacement(
                sourceNode,
                edge.sourceHandle,
              );
              const targetPlacement = resolveTargetPlacement(
                targetNode,
                edge.targetHandle,
              );

              const sourcePort = ensurePort(
                edge.source,
                "source",
                edge.sourceHandle,
                sourcePlacement,
              );
              const targetPort = ensurePort(
                edge.target,
                "target",
                edge.targetHandle,
                targetPlacement,
              );

              return {
                id: edge.id,
                sources: [sourcePort],
                targets: [targetPort],
              };
            })
            .filter((edge): edge is { id: string; sources: string[]; targets: string[] } => !!edge);

          const elkNodes = nodes.map((node) => {
            const size = getNodeSize(node);
            return {
              id: node.id,
              width: size.width,
              height: size.height,
              ports: portsByNode.get(node.id) || [],
              layoutOptions: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
              },
            };
          });

          const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
          const elk = new ELK();
          const result = await elk.layout({
            id: "root",
            layoutOptions: {
              "elk.algorithm": "layered",
              "elk.direction": "RIGHT",
              "elk.edgeRouting": "ORTHOGONAL",
              "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
              "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
              "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
              "elk.layered.spacing.nodeNodeBetweenLayers": "160",
              "elk.spacing.nodeNode": "95",
              "elk.spacing.edgeNode": "40",
            },
            children: elkNodes,
            edges: elkEdges,
          } as any);

          const positionById = new Map(
            ((result.children || []) as Array<{ id: string; x: number; y: number }>).map(
              (child) => [child.id, { x: child.x, y: child.y }],
            ),
          );

          setNodes((nds) =>
            nds.map((node) => {
              const next = positionById.get(node.id);
              if (!next) return node;
              return {
                ...node,
                position: {
                  x: Math.round(next.x),
                  y: Math.round(next.y),
                },
              };
            }),
          );

          setTimeout(() => {
            reactFlowInstance?.fitView({ duration: 700, padding: 0.2 });
          }, 50);
        };

        void runSmartLayoutWithElk().catch((error) => {
          console.error("SMART layout (ELK) failed", error);
        });

        return;
      }

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 });

      nodes.forEach((node) => {
        const width = node.type === "Agent" ? 350 : 300;
        const height = node.type === "Agent" ? 250 : 150;
        dagreGraph.setNode(node.id, { width, height });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      setNodes((nds) =>
        nds.map((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);
          const width = node.type === "Agent" ? 350 : 300;
          const height = node.type === "Agent" ? 250 : 150;

          return {
            ...node,
            position: {
              x: nodeWithPosition.x - width / 2,
              y: nodeWithPosition.y - height / 2,
            },
          };
        }),
      );

      setTimeout(() => {
        reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
      }, 50);
    },
    [nodes, edges, setNodes, reactFlowInstance, takeSnapshot],
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
    () => [
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
        id: "smart-layout",
        label: "Smart Layout",
        group: "Layout",
        shortcut: "Ctrl/Cmd+Shift+L",
        keywords: "layout smart auto",
        run: () => onLayout("SMART"),
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
        id: "toggle-shortcuts",
        label: "Toggle Shortcut Help",
        group: "Help",
        shortcut: "Ctrl/Cmd+Shift+/",
        keywords: "shortcuts help",
        run: () => setShowShortcutHelp((prev) => !prev),
      },
    ],
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
    setCommandQuery("");
    setCommandIndex(0);
    setTimeout(() => {
      commandInputRef.current?.focus();
      commandInputRef.current?.select();
    }, 0);
  }, [showCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

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

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (key === "escape") {
        setIsToolsMenuOpen(false);
        setShowShortcutHelp(false);
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
        setShowShortcutHelp((prev) => !prev);
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

  return (
    <div className="w-full h-screen bg-cyber-dark text-white overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="h-16 border-b border-cyber-border bg-cyber-panel/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-cyber-primary/10 hover:bg-cyber-primary/20 rounded-lg border border-cyber-primary/20 transition-colors"
            title="Back to Home"
          >
            <Home className="text-cyber-primary" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight uppercase">
                n2flow
              </h1>
              <input
                type="text"
                value={currentFlowName}
                onChange={(e) => setCurrentFlowName(e.target.value)}
                className="text-xs font-normal text-cyber-primary bg-cyber-primary/10 px-2 py-0.5 rounded border border-cyber-primary/20 outline-none focus:border-cyber-primary/50 w-48"
                placeholder="Flow Name"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsFlowManagerOpen(true)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex items-center gap-2 border border-white/10"
            title="Open Flows"
          >
            <FolderOpen size={16} />
          </button>

          <button
            onClick={() => onSave(currentFlowName)}
            disabled={isSaving}
            className={`p-2 rounded-lg transition-colors border ${
              isSaving 
                ? "bg-cyber-primary/40 text-white border-cyber-primary/50 cursor-wait" 
                : "bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary border-cyber-primary/30"
            }`}
            title="Save (Ctrl/Cmd+S)"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </button>

          <button
            onClick={onRunAll}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
            title="Deploy (Ctrl/Cmd+Enter)"
          >
            <Play size={14} fill="currentColor" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Deploy
            </span>
          </button>

          <button
            onClick={() => setIsPlaygroundOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-cyber-primary text-black rounded-lg hover:bg-cyan-300 transition-all"
          >
            <Terminal size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Playground
            </span>
          </button>

          <select
            value={validationLocale}
            onChange={(e) =>
              setValidationLocale(e.target.value as ValidationLocale)
            }
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-gray-300 focus:outline-none focus:border-cyber-primary/50"
            title="Validation language"
          >
            <option value="vi" className="bg-cyber-panel text-white">
              VI
            </option>
            <option value="en" className="bg-cyber-panel text-white">
              EN
            </option>
          </select>

          <button
            onClick={onValidateFlow}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg hover:bg-orange-500 hover:text-black transition-all"
            title="Validate (Ctrl/Cmd+Shift+K)"
          >
            <AlertTriangle size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Validate
            </span>
          </button>

          <button
            onClick={() => setIsToolsMenuOpen((prev) => !prev)}
            className={`p-2 rounded-lg border transition-colors ${isToolsMenuOpen ? "bg-cyber-primary/20 border-cyber-primary/30 text-cyber-primary" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
            title="Advanced Tools"
          >
            <Settings2 size={16} />
          </button>

          <button
            onClick={() => setShowShortcutHelp((prev) => !prev)}
            className={`p-2 rounded-lg border transition-colors ${showShortcutHelp ? "bg-cyber-primary/20 border-cyber-primary/30 text-cyber-primary" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
            title="Keyboard Shortcuts (Ctrl/Cmd+Shift+/)"
          >
            <Keyboard size={16} />
          </button>

          <button
            onClick={() => setShowCommandPalette(true)}
            className={`px-3 py-2 rounded-lg border transition-colors text-[11px] font-bold uppercase tracking-wider ${showCommandPalette ? "bg-cyber-primary/20 border-cyber-primary/30 text-cyber-primary" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
            title="Command Palette (Ctrl/Cmd+K)"
          >
            Cmd
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImport}
          />

          {isToolsMenuOpen && (
            <div className="absolute right-0 top-12 w-[300px] bg-cyber-panel/95 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-3 z-30 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-cyber-muted">
                Edit
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onCopy();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Copy size={12} />
                  Copy
                </button>
                <button
                  onClick={() => {
                    onPaste();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <ClipboardPaste size={12} />
                  Paste
                </button>
                <button
                  onClick={() => {
                    undo();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Undo2 size={12} />
                  Undo
                </button>
                <button
                  onClick={() => {
                    redo();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Redo2 size={12} />
                  Redo
                </button>
              </div>

              <div className="text-[10px] uppercase tracking-wider text-cyber-muted">
                Layout / View
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onLayout("SMART");
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <Wand2 size={12} />
                </button>
                <button
                  onClick={() => {
                    onLayout("LR");
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => {
                    onLayout("TB");
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  onClick={() => {
                    setShowMinimap((prev) => !prev);
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <MapIcon size={12} />
                </button>
                <button
                  onClick={() => {
                    reactFlowInstance?.fitView({ duration: 800 });
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <Maximize size={12} />
                </button>
                <button
                  onClick={() => {
                    setIsLiveMode((prev) => !prev);
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                >
                  <Activity size={12} />
                </button>
              </div>

              <div className="text-[10px] uppercase tracking-wider text-cyber-muted">
                Canvas / IO
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onGroupNodes();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Layers size={12} />
                  Group
                </button>
                <button
                  onClick={() => {
                    onUngroupNodes();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Ungroup size={12} />
                  Ungroup
                </button>
                <button
                  onClick={() => {
                    onExport();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <FileDown size={12} />
                  Export
                </button>
                <button
                  onClick={() => {
                    importInputRef.current?.click();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <Upload size={12} />
                  Import
                </button>
                <button
                  onClick={() => {
                    onDownloadImage();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <ImageIcon size={12} />
                  Image
                </button>
                <button
                  onClick={() => {
                    onClear();
                    setIsToolsMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddNode={onAddNode} />

        {/* React Flow Canvas */}
        <div
          className="flex-1 relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={renderedNodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapper}
            onEdgesChange={onEdgesChangeWrapper}
            onNodeDragStart={takeSnapshot}
            onSelectionDragStart={takeSnapshot}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
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

            <Controls className="!bg-cyber-panel !border-cyber-border !rounded-lg overflow-hidden !m-6 shadow-2xl" />

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

            <Panel position="top-right" className="m-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${
                  flowIssues.some((issue) => issue.level === "error")
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-green-500/10 border-green-500/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    flowIssues.some((issue) => issue.level === "error")
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span
                  className={`text-[10px] font-mono font-bold tracking-widest ${
                    flowIssues.some((issue) => issue.level === "error")
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {flowIssues.some((issue) => issue.level === "error")
                    ? `FLOW_INVALID (${flowIssues.filter((issue) => issue.level === "error").length})`
                    : "FLOW_READY"}
                </span>
              </div>
            </Panel>

            {flowIssues.length > 0 && (
              <Panel position="top-left" className="m-4 max-w-[420px]">
                <div className="bg-cyber-panel/90 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-primary">
                      Flow Validation
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {flowIssues.filter((i) => i.level === "error").length} ERR
                      · {flowIssues.filter((i) => i.level === "warning").length}{" "}
                      WARN
                    </span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto p-2 space-y-1">
                    {flowIssues.slice(0, 12).map((issue, idx) => (
                      <button
                        key={`${issue.level}-${issue.nodeId || "global"}-${idx}`}
                        type="button"
                        onClick={() =>
                          focusIssueNode(issue.nodeId, issue.fieldName)
                        }
                        className={`w-full text-left px-2 py-1.5 rounded-md border transition-colors ${
                          issue.level === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/20"
                        } ${issue.nodeId ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div className="text-[9px] font-mono uppercase opacity-80">
                          {issue.level}
                          {issue.nodeId ? ` · ${issue.nodeId}` : ""}
                        </div>
                        <div className="text-[11px] leading-tight">
                          {issue.message}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {showShortcutHelp && (
              <Panel position="bottom-left" className="m-4 max-w-[360px]">
                <div className="bg-cyber-panel/95 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-primary">
                      Keyboard Shortcuts
                    </span>
                    <button
                      onClick={() => setShowShortcutHelp(false)}
                      className="text-[10px] text-gray-400 hover:text-white"
                    >
                      ESC
                    </button>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <span className="text-gray-300">Save</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+S</span>
                    <span className="text-gray-300">Validate</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+Shift+K</span>
                    <span className="text-gray-300">Deploy</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+Enter</span>
                    <span className="text-gray-300">Smart Layout</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+Shift+L</span>
                    <span className="text-gray-300">Group/Ungroup</span>
                    <span className="text-cyber-primary">
                      Ctrl/Cmd+Shift+G/U
                    </span>
                    <span className="text-gray-300">Minimap/Fit</span>
                    <span className="text-cyber-primary">
                      Ctrl/Cmd+Shift+M/F
                    </span>
                    <span className="text-gray-300">Export/Import</span>
                    <span className="text-cyber-primary">
                      Ctrl/Cmd+Shift+E/I
                    </span>
                    <span className="text-gray-300">Undo/Redo</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+Z/Y</span>
                    <span className="text-gray-300">Copy/Paste</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+C/V</span>
                    <span className="text-gray-300">Toggle Help</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+Shift+/</span>
                    <span className="text-gray-300">Command Palette</span>
                    <span className="text-cyber-primary">Ctrl/Cmd+K</span>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Execution Logs Panel */}
        <div className={`fixed bottom-0 left-0 z-50 transition-all duration-300 ${isLogsOpen ? 'w-[45vw] h-[25vh]' : 'w-40 h-8'} bg-cyber-panel/90 backdrop-blur-xl border-t border-r border-cyber-border rounded-tr-xl shadow-2xl flex flex-col overflow-hidden m-0`}>
          <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2 text-cyber-primary">
              <Terminal size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">System Logs</span>
            </div>
            <button 
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 transition-colors"
            >
              {isLogsOpen ? <ArrowDown size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
          {isLogsOpen && (
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1 custom-scrollbar">
              {executionLogs.length === 0 ? (
                <div className="text-gray-600 italic p-2">Ready for execution...</div>
              ) : (
                executionLogs.map(log => (
                  <div key={log.id} className="flex gap-2 leading-relaxed border-b border-white/5 pb-1 last:border-0">
                    <span className="text-gray-600 shrink-0">[{log.time}]</span>
                    <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'nodeUpdate' ? 'text-cyber-primary' : 'text-gray-300'} break-all`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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

      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-start justify-center pt-[12vh] px-4">
          <div className="w-full max-w-[680px] bg-cyber-panel/95 border border-cyber-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-cyber-primary">
                Command Palette
              </span>
              <span className="text-[10px] text-gray-400">
                Enter to run · Esc to close
              </span>
            </div>
            <div className="p-3 border-b border-white/10">
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setCommandIndex(0);
                }}
                placeholder="Type a command: save, validate, layout, export..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyber-primary/50"
              />
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-gray-400">
                  No command found.
                </div>
              ) : (
                filteredCommands.map((command, idx) => (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.run();
                      setShowCommandPalette(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      idx === commandIndex
                        ? "bg-cyber-primary/20 border-cyber-primary/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm text-white">
                          {command.label}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-cyber-muted">
                          {command.group}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-cyber-primary/90">
                        {command.shortcut}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {isFlowManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2 text-cyber-primary">
                <FolderOpen size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">Flow Manager</h2>
              </div>
              <button 
                onClick={() => setIsFlowManagerOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors underline decoration-cyber-primary/30 underline-offset-4"
              >
                ESC (Close)
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {savedFlows.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">
                  No flows found on server. Create your first protocol.
                </div>
              ) : (
                savedFlows.map(flow => (
                  <div 
                    key={flow.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                      currentFlowId === flow.id 
                        ? 'bg-cyber-primary/10 border-cyber-primary/40' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => {
                        navigate(`/flow/${flow.id}`);
                        setIsFlowManagerOpen(false);
                    }}>
                      <div className="text-sm font-bold text-white group-hover:text-cyber-primary transition-colors">
                        {flow.name}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-mono">
                        ID: {flow.id} • Updated: {new Date(flow.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDeleteFlow(flow.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-all font-bold text-[10px]"
                        title="Delete Flow"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
              <button 
                onClick={() => {
                  navigate('/flow/new');
                  setIsFlowManagerOpen(false);
                }}
                className="px-4 py-2 bg-cyber-primary text-black rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                + New Protocol
              </button>
            </div>
          </div>
        </div>
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
