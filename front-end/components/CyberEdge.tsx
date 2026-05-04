import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

export default function CyberEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  // Use SmoothStep for a circuit-board feel
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Extract color from style for the label border/text match
  const strokeColor = selected ? '#00f0ff' : (style.stroke || '#64748b');
  const edgeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth: selected ? 3 : (style.strokeWidth || 1.5),
    filter: selected ? 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.5))' : 'none',
  };

  const onEdgeDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('takeSnapshot'));
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group flex items-center gap-1"
        >
          {label && (
            <div 
              className="px-2 py-1 rounded bg-black/80 backdrop-blur-sm border shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all group-hover:scale-105"
              style={{ 
                borderColor: strokeColor as string,
                color: (labelStyle?.fill as string) || '#e0e0e0',
                borderWidth: '1px'
              }}
            >
              <div className="text-[10px] font-bold font-mono tracking-wide uppercase whitespace-nowrap">
                {label}
              </div>
            </div>
          )}
          <button
            onClick={onEdgeDelete}
            className={`p-1 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title="Delete Edge"
          >
            <X size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}