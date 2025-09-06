import { createContext, useContext } from 'react';

export const DragContext = createContext<boolean>(false);
export const useIsDragging = () => useContext(DragContext);
