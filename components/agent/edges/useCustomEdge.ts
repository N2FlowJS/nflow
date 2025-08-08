import { Edge, EdgeProps, getBezierPath } from '@xyflow/react';
import { theme } from 'antd';
import { useMemo } from 'react';
import { useEdgeExecutionStatus } from '../../../context/FlowStateContext';

export interface CustomEdgeData extends Edge {
  onDelete?: (edgeId: string) => void;
}

export const useCustomEdge = (props: EdgeProps<CustomEdgeData>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    source,
    target,
  } = props;

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
  const isExecutedEdge = useEdgeExecutionStatus(source, target);
  const isDragging = (data as any)?.isDragging;

  const effectiveStyle = useMemo(() => {
    const color = isExecutedEdge ? '#52c41a' : (style as any).stroke || token.colorBorder;
    const width = isExecutedEdge ? 3 : 1;
    return { ...style, stroke: color, strokeWidth: width } as React.CSSProperties;
  }, [isExecutedEdge, style, token.colorBorder]);

  return {
    id,
    edgePath,
    labelX,
    labelY,
    markerEnd,
    effectiveStyle,
    isDragging,
  } as const;
};
