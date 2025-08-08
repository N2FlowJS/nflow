import { useCallback } from 'react';

export const useDragOverHandler = () => {
  return useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
};
