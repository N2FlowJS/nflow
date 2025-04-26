import { BaseEdge, Edge, EdgeProps, getBezierPath } from "@xyflow/react";
import { theme } from "antd";
import React from "react";

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 1
  });

  const { token } = theme.useToken();


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
          stroke: token.colorBgBase,
        }}
      />

      {/* Permanent circle indicator */}
      <circle
        cx={labelX}
        cy={labelY}
        r={6}
        fill={token.colorBgBase}
        stroke="red"
        strokeWidth={1}
      />
      <foreignObject
        onClick={handleDelete}
        x={labelX - 5}
        y={labelY - 5}
        width={10}
        height={10}
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
