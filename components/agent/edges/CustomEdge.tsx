import React from "react";
import { EdgeProps, BaseEdge, getSmoothStepPath, Edge } from "@xyflow/react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, ArrowRightOutlined } from "@ant-design/icons";

interface CustomEdgeData extends Edge {
  onDelete?: (edgeId: string) => void;
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data, // Ensure data is initialized with a default empty object and properly typed
}): React.JSX.Element => {
  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate midpoint for the arrow marker
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((data as any).onDelete) {
      (data as any).onDelete(id);
    }
  };

  return (
    <g>
      {/* Base edge with consistent styling */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 1.5,
          stroke: "#d9d9d9",
        }}
      />

      {/* Permanent circle indicator */}
      <circle
        cx={midX}
        cy={midY}
        r={6}
        fill="#f0f7ff"
        stroke="red"
        strokeWidth={1}
      />
      <foreignObject
        onClick={handleDelete}
        x={midX - 6}
        y={midY - 6}
        width={12}
        height={12}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: 0,
          }}
        >
          ×
        </div>
      </foreignObject>
    </g>
  );
};

export default CustomEdge;
