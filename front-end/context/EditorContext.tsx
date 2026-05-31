import React, { createContext, useContext, ReactNode } from 'react';
import { EditorContextProps } from '../types/editor';
import { useFlowEditor } from '../hooks/useFlowEditor';

const EditorContext = createContext<EditorContextProps | null>(null);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const editor = useFlowEditor();
  return (
    <EditorContext.Provider value={editor}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
