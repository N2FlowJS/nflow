import { ReactFlowInstance } from "@xyflow/react";
import { 
  NodeData as BaseNodeData, 
  GlobalVariable as BaseGlobalVariable,
  FlowData as BaseFlowData,
  FlowVersion as BaseFlowVersion,
  SavedFlow as BaseSavedFlow
} from "@n2flow/types";

export type RuntimeStatus = "idle" | "running" | "success" | "error" | "cancelled";

export type PlaygroundMessage = {
  role: string;
  text: string;
};

export type PlaygroundWorkerOutput =
  | string
  | {
      text?: string;
    };

export type CommandAction = {
  id: string;
  label: string;
  group: string;
  shortcut: string;
  keywords: string;
  run: () => void;
};

export type GlobalVariable = BaseGlobalVariable;
export type FlowData = BaseFlowData;
export type FlowVersion = BaseFlowVersion;
export type SavedFlow = BaseSavedFlow;

export type LogEntry = {
  id: string;
  time: string;
  type: string;
  message: string;
  nodeId?: string;
};

export interface EditorUIState {
  activeDockTab: string | null;
  setActiveDockTab: (tab: string | null) => void;
  showMinimap: boolean;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveMode: boolean;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  isCanvasSearchOpen: boolean;
  setIsCanvasSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isToolsMenuOpen: boolean;
  setIsToolsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showCommandPalette: boolean;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  commandQuery: string;
  setCommandQuery: (query: string) => void;
  commandIndex: number;
  setCommandIndex: React.Dispatch<React.SetStateAction<number>>;
  contextMenu: { x: number; y: number; node?: any } | null;
  setContextMenu: (menu: { x: number; y: number; node?: any } | null) => void;
  isPlaygroundOpen: boolean;
  isFlowManagerOpen: boolean;
  isVariablesPanelOpen: boolean;
  isVersionHistoryOpen: boolean;
  showShortcutHelp: boolean;
  isLogsOpen: boolean;
  isNodeConfigOpen: boolean;
  setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVariablesPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVersionHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLogsOpenExclusive: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface GraphState {
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  onNodesChange: (changes: any[]) => void;
  edges: any[];
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  onEdgesChange: (changes: any[]) => void;
  reactFlowInstance: any | null;
  setReactFlowInstance: (instance: any | null) => void;
  runtimeStatus: RuntimeStatus;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  configNodeId: string | null;
  setConfigNodeId: (id: string | null) => void;
  currentConfigNode: any | null;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  onConnect: (params: any) => void;
  onAddNode: (type: string, label: string, position?: { x: number; y: number }) => void;
  updateNodeDataById: (nodeId: string, newData: any) => void;
  handleParamChange: (nodeId: string, name: string, value: any) => void;
  onCopy: () => void;
  onPaste: (targetPos?: { x: number; y: number }) => void;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onGroupNodes: () => void;
  onUngroupNodes: (targetGroupId?: string) => void;
  pendingNodeInsertPosition: { x: number; y: number } | null;
  setPendingNodeInsertPosition: (pos: { x: number; y: number } | null) => void;
}

export interface FlowPersistenceState {
  currentFlowId: string | null;
  setCurrentFlowId: (id: string | null) => void;
  currentFlowName: string;
  setCurrentFlowName: (name: string) => void;
  savedFlows: SavedFlow[];
  flowVersions: FlowVersion[];
  globalVariables: GlobalVariable[];
  setGlobalVariables: React.Dispatch<React.SetStateAction<GlobalVariable[]>>;
  isSaving: boolean;
  isAutoSaving: boolean;
  setIsAutoSaving: (saving: boolean) => void;
  lastAutoSave: number | null;
  setLastAutoSave: (time: number | null) => void;
  isRestoringVersion: boolean;
  onSave: (name: string, versionLabel?: string, isAutoSave?: boolean) => Promise<string>;
  onLoadVersion: (version: FlowVersion) => Promise<void>;
  onDeleteFlow: (flowId: string) => Promise<void>;
  fetchFlows: () => Promise<SavedFlow[]>;
}

export interface FlowExecutionState {
  runtimeStatus: RuntimeStatus;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  playgroundMessages: PlaygroundMessage[];
  setPlaygroundMessages: React.Dispatch<React.SetStateAction<PlaygroundMessage[]>>;
  isPlaygroundTyping: boolean;
  playgroundError: string | null;
  setPlaygroundError: (error: string | null) => void;
  executionLogs: LogEntry[];
  setExecutionLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  flowIssues: any[];
  validationLocale: any;
  setValidationLocale: React.Dispatch<React.SetStateAction<any>>;
  onValidateFlow: (openDock?: boolean) => boolean;
  executeFlow: (inputMessage?: string, isSilent?: boolean, options?: { showLogs?: boolean }) => Promise<string | null>;
  onSendMessage: (msg: string) => Promise<void>;
  onRunAll: () => Promise<void>;
  onClearPlaygroundMessages: () => void;
  executeNodeSubgraph: (nodeId: string) => Promise<void>;
}

export interface EditorContextProps extends EditorUIState, GraphState, FlowPersistenceState, FlowExecutionState {
  id?: string;
  navigate: (path: string) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  dockTabs: any[];
  renderedEdges: any[];
  onLayout: (mode?: any) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadImage: () => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  commandActions: CommandAction[];
  filteredCommands: CommandAction[];
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onNodeContextMenu: (event: React.MouseEvent | MouseEvent, node: any) => void;
  onPaneContextMenu: (event: React.MouseEvent | MouseEvent) => void;
  onClear: () => void;
  onLayoutHandler: (type: string) => void;
  onNodesChangeWrapper: (changes: any[]) => void;
  onEdgesChangeWrapper: (changes: any[]) => void;
  handleConfigParamChange: (name: string, val: any) => void;
  updateNodeDataById: (data: any) => void;
  onSelectionChange: (params: { nodes: any[] }) => void;
  focusNode: (node: any) => void;
  focusIssueNode: (issue: any) => void;
  highlightedConfigField: string | null;
  setHighlightedConfigField: (field: string | null) => void;
  commandInputRef: React.RefObject<HTMLInputElement>;
  deleteElements: (elements: { nodes?: any[]; edges?: any[] }) => void;
}
