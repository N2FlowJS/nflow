import { ReactFlowInstance } from "@xyflow/react";

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

export type GlobalVariable = {
  id: string;
  name: string;
  value: string;
};

export type SavedFlow = {
  id: string;
  name: string;
  data?: ReturnType<ReactFlowInstance["toObject"]> & {
    globalVariables?: GlobalVariable[];
  };
  updatedAt: number;
};

export type LogEntry = {
  id: string;
  time: string;
  type: string;
  message: string;
  nodeId?: string;
};
