import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeData } from "../../types/flowTypes";
import { NODE_REGISTRY } from '../../util/NODE_REGISTRY';
import NodeHeader from "./node-header";
import {
  LeftHandleStyle,
  RightHandleStyle,
  TopHandleStyle,
  BottomHandleStyle,
} from "./handle-icon";

interface BaseNodeProps {
  data: NodeData;
  id: string;
  selected: boolean;
  handlePositions?: {
    input?: Position;
    output?: Position;
  };
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  id,
  selected,
  handlePositions = {
    input: Position.Top,
    output: Position.Bottom,
  },
  children,
  icon,
}) => {
  // Get the node configuration from the registry
  const nodeConfig = NODE_REGISTRY[data.type];

  // Select appropriate handle styles based on position
  const getHandleStyle = (position: Position) => {
    switch (position) {
      case Position.Left:
        return LeftHandleStyle;
      case Position.Right:
        return RightHandleStyle;
      case Position.Top:
        return TopHandleStyle;
      case Position.Bottom:
        return BottomHandleStyle;
      default:
        return BottomHandleStyle;
    }
  };

  const inputHandleStyle = handlePositions.input
    ? getHandleStyle(handlePositions.input)
    : undefined;
  const outputHandleStyle = handlePositions.output
    ? getHandleStyle(handlePositions.output)
    : undefined;

  return (
    <div
      style={{
        borderColor: selected ? nodeConfig.color.border : "#d9d9d9",
        borderWidth: selected ? "2px" : "1px",
        backgroundColor: nodeConfig.color.background,
        padding: "8px",
        borderRadius: "4px",
        width: "240px",
        boxShadow: selected ? "0 0 10px rgba(0, 0, 0, 0.15)" : "none",
      }}
    >
      <NodeHeader 
        id={id} 
        name={data.form?.name} 
        label={data.label} 
        type={data.type} 
        icon={icon}
      />

      {children}

      {handlePositions.input && (
        <Handle
          type="target"
          position={handlePositions.input}
          style={inputHandleStyle}
          id="in"
        />
      )}

      {handlePositions.output && (
        <Handle
          type="source"
          position={handlePositions.output}
          style={outputHandleStyle}
          id="out"
        />
      )}
    </div>
  );
};

export default memo(BaseNode);
