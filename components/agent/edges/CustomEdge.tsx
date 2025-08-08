import { BaseEdge, EdgeProps } from '@xyflow/react';
import React, { memo, useState } from 'react';
import { useCustomEdge, CustomEdgeData } from './useCustomEdge';
import { theme } from 'antd';

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = (props) => {
  const { id } = props;
  const { edgePath, labelX, labelY, markerEnd, effectiveStyle, isDragging } = useCustomEdge(props);
  const [hovered, setHovered] = useState(false);
  const { token } = theme.useToken();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = props.data as any;
    if (data?.onDelete) data.onDelete(id);
  };

  // During drag, render only the path (skip heavy DOM like foreignObject)
  if (isDragging) {
    return <BaseEdge path={edgePath} markerEnd={markerEnd} style={effectiveStyle} />;
  }

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={effectiveStyle} />

      {/* only show delete UI on hover */}
      {hovered && (
        <>
          <foreignObject onClick={handleDelete} x={labelX - 6} y={labelY - 6} width={12} height={12}>
            <span
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                alignSelf: 'center',
                justifySelf: 'center',
                height: '100%',
                fontSize: 24,
                color: token.colorError,
                cursor: 'pointer',
                userSelect: 'none',
                lineHeight: 1,
              }}>
              ×
            </span>
          </foreignObject>
        </>
      )}
    </g>
  );
};

export default memo(CustomEdge);
