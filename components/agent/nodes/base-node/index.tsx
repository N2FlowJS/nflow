import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeData } from "@/models/flowTypes";
import NodeHeader from "./node-header";
import { getHandleStyle } from "./handle-icon";
import { NODE_REGISTRY } from "@/utils/client";
import { Card } from "antd";

interface BaseNodeProps {
  data: NodeData;
  id: string;
  selected: boolean;
  handlePositions: {
    input: Position[];
    output: Position[];
  };
  children?: React.ReactNode;
  icon?: React.ReactNode;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  id,
  selected,
  handlePositions,
  children,
  icon,
  role,
}) => {
  const nodeConfig = NODE_REGISTRY[data.type];

  return (
    <Card
      style={{
        borderColor: selected ? 'red' : (nodeConfig?.color.border || '#888888'),
        borderWidth: "3px",
      }}
    >
      <NodeHeader
        id={id}
        name={data.form?.name}
        type={data.type}
        icon={icon}
        role={role}
      />
      {children && (
        <div style={{ padding: "10px 0" }}>
          {children}
        </div>
      )}
      {handlePositions.input.flatMap((position: Position) => (
        <Handle
          key={`in-${position}`}
          type="target"
          position={position}
          style={getHandleStyle && getHandleStyle(position, 'target')}
          id={`in-${position}`}
        />
      ))}

      {handlePositions.output.flatMap((position) => (
        <Handle
          key={`out-${position}`}
          type="source"
          position={position}
          style={getHandleStyle && getHandleStyle(position, 'source')}
          id={`out-${position}`}
        />
      ))}
    </Card>
  );
};

export default memo(BaseNode);
