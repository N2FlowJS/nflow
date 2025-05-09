import { BaseEdge, Edge, EdgeProps, getBezierPath } from '@xyflow/react';
import { theme } from 'antd';
import React, { useMemo } from 'react'; // Added useMemo
import { useFlowState } from '../../../context/FlowStateContext'; // Import the context

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
  source, // Added source and target from EdgeProps
  target, // Added target from EdgeProps
}): React.JSX.Element => {
  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 1,
  });

  const { token } = theme.useToken();
  const { flowState } = useFlowState(); // Consume the context

  // Determine if the edge is connected to the active node

  const isExecutedEdge = useMemo(() => {
    if (!flowState) return false;
    let ac: boolean = false;
    Object.keys(flowState?.components).forEach((e: string) => {
      if (e != target && e == source && flowState.components[target].executionTime > flowState.executionTime && flowState.components[source].executionTime > flowState.executionTime && flowState.components[e].executionTime > flowState.executionTime) {
        ac = true;
        return;
      }
    });

    return ac;
  }, [flowState, source, target]);

  // Example: Log flowState when an edge is rendered or updated
  React.useEffect(() => {
    if (flowState) {
      // console.log(`CustomEdge ${id} has access to flowState:`, flowState);
    }
  }, [flowState, id]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((data as any).onDelete) {
      (data as any).onDelete(id);
    }
  };

  const edgeStrokeColor = () => {
    if (isExecutedEdge) return '#52c41a'; // Executed path
    return style.stroke || token.colorBorder; // Default
  };

  const edgeStrokeWidth = () => {
    if (isExecutedEdge) return 3;
    return 1.5;
  };

  return (
    <g>
      {/* Base edge with consistent styling */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: edgeStrokeWidth(),
          stroke: edgeStrokeColor(),
        }}
      />

      {/* Permanent circle indicator */}
      <circle cx={labelX} cy={labelY} r={6} fill={token.colorBgBase} stroke="red" strokeWidth={1} />
      <foreignObject onClick={handleDelete} x={labelX - 5} y={labelY - 5} width={10} height={10}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: 0,
          }}>
          ×
        </div>
      </foreignObject>
    </g>
  );
};

export default CustomEdge;
