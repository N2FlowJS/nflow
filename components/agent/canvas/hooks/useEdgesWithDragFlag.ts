import { useMemo } from 'react';

export const useEdgesWithDragFlag = (edges: any[], isDragging: boolean) => {
  return useMemo(() => edges.map((e) => ({ ...e, data: { ...(e.data || {}), isDragging } })), [edges, isDragging]);
};
