// client UI types removed for backend build
import {
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeSourceHandles,
  normalizeNodeWithRegistry,
} from "./index";
import type { FlowNode as CustomNodeType } from "../flowTypes";

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
  const raw = getNodeFieldValue(data as any, key);
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
  const registrySourceHandles = getNodeSourceHandles(nodeType, node.data);

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

  return "any";
};

export const inferTargetPortType = (
  node: CustomNodeType,
  handleId?: string | null,
): PortDataType => {
  const registryInputHandles = getNodeInputHandles(node.data.type, node.data);
  if (registryInputHandles.length > 0) {
    const matchedHandle = handleId
      ? registryInputHandles.find((handle) => handle.id === handleId)
      : registryInputHandles.find((handle) => !handle.id);
    if (matchedHandle) {
      return matchedHandle.portType as PortDataType;
    }
  }

  return "any";
};

export const normalizeModelNode = (node: any): any =>
  normalizeNodeWithRegistry(node as any);
