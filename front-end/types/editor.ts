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
