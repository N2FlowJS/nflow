import type { Node } from "@xyflow/react";
import {
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeSourceHandles,
  normalizeNodeWithRegistry,
} from "./index";
import { CustomNodeType } from "../types";

export type PortDataType =
  | "text"
  | "chat_model"
  | "embedding_model"
  | "tool"
  | "boolean_route"
  | "any";

export const PORT_TYPE_OPTIONS: PortDataType[] = [
  "any",
  "text",
  "chat_model",
  "embedding_model",
  "tool",
  "boolean_route",
];

export const readPortType = (
  nodeOrData: CustomNodeType | CustomNodeType["data"],
  key: string,
  fallback: PortDataType,
): PortDataType => {
  const data = "data" in nodeOrData ? nodeOrData.data : nodeOrData;
  const raw = getNodeFieldValue(data, key);
  if (typeof raw !== "string") return fallback;
  
  if (PORT_TYPE_OPTIONS.includes(raw as PortDataType)) {
      return raw as PortDataType;
  }
  return fallback;
};

export const inferSourcePortType = (
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
          matchedHandle.badgeFallback || (matchedHandle.portType as PortDataType),
        );
      }
      return matchedHandle.portType as PortDataType;
    }
  }

  // Fallbacks for hardcoded handles in some nodes
  if (handleId === "as_tool")
    return readPortType(node, "as_tool_output_type", "tool");
  if (handleId === "response")
    return readPortType(node, "response_output_type", "text");
  if (handleId === "true")
    return readPortType(node, "true_output_type", "boolean_route");
  if (handleId === "false")
    return readPortType(node, "false_output_type", "boolean_route");

  // Legacy component fallbacks
  if (nodeType === "ChatModelComponent" || nodeType === "OllamaChatModelComponent" || nodeType === "VLLMChatModelComponent")
    return readPortType(node, "output_type", "chat_model");
  if (nodeType === "EmbeddingModelComponent" || nodeType === "OllamaEmbeddingModelComponent" || nodeType === "VLLMEmbeddingModelComponent")
    return readPortType(node, "output_type", "embedding_model");

  return "any";
};

export const inferTargetPortType = (
  node: CustomNodeType,
  handleId?: string | null,
): PortDataType => {
  const registryInputHandles = getNodeInputHandles(node.data.type);
  if (registryInputHandles.length > 0) {
    const matchedHandle = handleId
      ? registryInputHandles.find((handle) => handle.id === handleId)
      : registryInputHandles.find((handle) => !handle.id);
    if (matchedHandle) {
      return matchedHandle.portType as PortDataType;
    }
  }

  if (handleId === "tools") return "tool";
  if (handleId === "agent_llm") return "chat_model";
  if (handleId === "embedding_model") return "embedding_model";
  if (handleId === "system_prompt" || handleId === "input_value") return "text";

  return "any";
};

export const normalizeModelNode = (node: Node): Node =>
  normalizeNodeWithRegistry(node as any);
