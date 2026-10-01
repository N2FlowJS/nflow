import type {
  Connection,
  EdgeChange,
  HandleType,
  NodeChange,
  OnConnectEnd,
  OnConnectStart,
  ReactFlowInstance,
} from '@xyflow/react';
import {
  type GlobalVariable as BaseGlobalVariable,
  type FlowData as BaseFlowData,
  type FlowVersion as BaseFlowVersion,
  type SavedFlow as BaseSavedFlow,
  type CustomNodeType,
  type CustomEdgeType,
  type FlowValidationIssue,
  type ValidationLocale,
} from '@n2flow/types';
import type { LucideIcon } from 'lucide-react';

export type RuntimeStatus = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export type LayoutMode =
  | 'LR'
  | 'TB'
  | 'SMART'
  | 'LAYERED'
  | 'FORCE'
  | 'RADIAL'
  | 'ORTHOGONAL'
  | 'TREE'
  | 'DAGRE_LR'
  | 'DAGRE_TB'
  | 'DAGRE_RL'
  | 'DAGRE_BT';

export type EditorDockTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

/** Handle a connection drag started from, used to auto-wire a node dropped on the pane. */
export type PendingConnection = {
  nodeId: string;
  handleId: string;
  handleType: HandleType;
};

/** Value accepted by a node's config schema field. */
export type ConfigFieldValue = string | number | boolean;

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

export type DockTabId =
  | 'playground'
  | 'preview'
  | 'execution'
  | 'logs'
  | 'validation'
  | 'shortcuts'
  | 'flows'
  | 'variables'
  | 'history'
  | 'config';

export interface EditorUIState {
  activeDockTab: DockTabId | null;
  setActiveDockTab: React.Dispatch<React.SetStateAction<DockTabId | null>>;
  showMinimap: boolean;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveMode: boolean;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  isCanvasSearchOpen: boolean;
  setIsCanvasSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showCommandPalette: boolean;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  commandQuery: string;
  setCommandQuery: React.Dispatch<React.SetStateAction<string>>;
  commandIndex: number;
  setCommandIndex: React.Dispatch<React.SetStateAction<number>>;
  contextMenu: { x: number; y: number; node?: CustomNodeType } | null;
  setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number; node?: CustomNodeType } | null>>;
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
  nodes: CustomNodeType[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNodeType[]>>;
  onNodesChange: (changes: NodeChange<CustomNodeType>[]) => void;
  edges: CustomEdgeType[];
  setEdges: React.Dispatch<React.SetStateAction<CustomEdgeType[]>>;
  onEdgesChange: (changes: EdgeChange<CustomEdgeType>[]) => void;
  reactFlowInstance: ReactFlowInstance<CustomNodeType, CustomEdgeType> | null;
  setReactFlowInstance: (instance: ReactFlowInstance<CustomNodeType, CustomEdgeType> | null) => void;
  runtimeStatus: RuntimeStatus;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  configNodeId: string | null;
  setConfigNodeId: (id: string | null) => void;
  currentConfigNode: CustomNodeType | null;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  onConnect: (params: Connection) => void;
  onAddNode: (
    type: string,
    label: string,
    position?: { x: number; y: number },
    connectFrom?: PendingConnection,
  ) => void;
  updateNodeDataById: (nodeId: string, newData: Partial<CustomNodeType['data']>) => void;
  handleParamChange: (nodeId: string, name: string, value: ConfigFieldValue) => void;
  onCopy: () => void;
  onPaste: (targetPos?: { x: number; y: number }) => void;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onGroupNodes: () => void;
  onUngroupNodes: (targetGroupId?: string) => void;
  pendingNodeInsertPosition: { x: number; y: number } | null;
  setPendingNodeInsertPosition: (pos: { x: number; y: number } | null) => void;
  onConnectStart: OnConnectStart;
  onConnectEnd: OnConnectEnd;
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
  flowIssues: FlowValidationIssue[];
  validationLocale: ValidationLocale;
  setValidationLocale: React.Dispatch<React.SetStateAction<ValidationLocale>>;
  onValidateFlow: (openDock?: boolean) => boolean;
  executeFlow: (
    inputMessage?: string,
    isSilent?: boolean,
    options?: { showLogs?: boolean },
  ) => Promise<string | null>;
  onSendMessage: (msg: string) => Promise<void>;
  onRunAll: () => Promise<void>;
  onClearPlaygroundMessages: () => void;
  executeNodeSubgraph: (nodeId: string) => Promise<void>;
}

export interface EditorContextProps
  extends
    EditorUIState,
    Omit<GraphState, 'updateNodeDataById'>,
    FlowPersistenceState,
    FlowExecutionState {
  id?: string | undefined;
  navigate: (path: string) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  dockTabs: EditorDockTab[];
  renderedEdges: CustomEdgeType[];
  onLayout: (mode?: LayoutMode) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadImage: () => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  commandActions: CommandAction[];
  filteredCommands: CommandAction[];
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onNodeContextMenu: (event: React.MouseEvent | MouseEvent, node: CustomNodeType) => void;
  onPaneContextMenu: (event: React.MouseEvent | MouseEvent) => void;
  onClear: () => void;
  onLayoutHandler: (type: string) => void;
  onNodesChangeWrapper: (changes: NodeChange<CustomNodeType>[]) => void;
  onEdgesChangeWrapper: (changes: EdgeChange<CustomEdgeType>[]) => void;
  handleConfigParamChange: (name: string, val: ConfigFieldValue) => void;
  updateNodeDataById: (data: Partial<CustomNodeType['data']>) => void;
  onSelectionChange: (params: { nodes: CustomNodeType[] }) => void;
  focusNode: (node: CustomNodeType) => void;
  focusIssueNode: (nodeId?: string, fieldName?: string) => void;
  highlightedConfigField: string | null;
  setHighlightedConfigField: (field: string | null) => void;
  commandInputRef: React.RefObject<HTMLInputElement>;
  deleteElements: (elements: { nodes?: CustomNodeType[]; edges?: CustomEdgeType[] }) => void;
}
