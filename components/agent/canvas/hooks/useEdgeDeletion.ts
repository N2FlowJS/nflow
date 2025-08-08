import { useCallback } from 'react';

export const useEdgeDeletion = (setEdges: React.Dispatch<React.SetStateAction<any[]>>) => {
  return useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );
};
