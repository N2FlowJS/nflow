import { useState, useCallback, useEffect } from 'react';

export type DockTabId =
  | "playground"
  | "preview"
  | "execution"
  | "logs"
  | "validation"
  | "shortcuts"
  | "flows"
  | "variables"
  | "history"
  | "config";

export const useEditorUI = () => {
  const [activeDockTab, setActiveDockTab] = useState<DockTabId | null>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isCanvasSearchOpen, setIsCanvasSearchOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node?: any;
  } | null>(null);

  const isPlaygroundOpen = activeDockTab === "playground";
  const isFlowManagerOpen = activeDockTab === "flows";
  const isVariablesPanelOpen = activeDockTab === "variables";
  const isVersionHistoryOpen = activeDockTab === "history";
  const showShortcutHelp = activeDockTab === "shortcuts";
  const isLogsOpen = activeDockTab === "logs";
  const isNodeConfigOpen = activeDockTab === "config";

  const setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "playground") : value;
      return open ? "playground" : (prev === "playground" ? null : prev);
    });
  }, []);

  const setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "flows") : value;
      return open ? "flows" : (prev === "flows" ? null : prev);
    });
  }, []);

  const setIsVariablesPanelOpen: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "variables") : value;
      return open ? "variables" : (prev === "variables" ? null : prev);
    });
  }, []);

  const setIsVersionHistoryOpen: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "history") : value;
      return open ? "history" : (prev === "history" ? null : prev);
    });
  }, []);

  const setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "shortcuts") : value;
      return open ? "shortcuts" : (prev === "shortcuts" ? null : prev);
    });
  }, []);

  const setIsLogsOpenExclusive: React.Dispatch<React.SetStateAction<boolean>> = useCallback((value: React.SetStateAction<boolean>) => {
    setActiveDockTab((prev) => {
      const open = typeof value === 'function' ? (value as any)(prev === "logs") : value;
      return open ? "logs" : (prev === "logs" ? null : prev);
    });
  }, []);

  return {
    activeDockTab,
    setActiveDockTab,
    showMinimap,
    setShowMinimap,
    isLiveMode,
    setIsLiveMode,
    isCanvasSearchOpen,
    setIsCanvasSearchOpen,
    isToolsMenuOpen,
    setIsToolsMenuOpen,
    showCommandPalette,
    setShowCommandPalette,
    commandQuery,
    setCommandQuery,
    commandIndex,
    setCommandIndex,
    contextMenu,
    setContextMenu,

    // Helper flags
    isPlaygroundOpen,
    isFlowManagerOpen,
    isVariablesPanelOpen,
    isVersionHistoryOpen,
    showShortcutHelp,
    isLogsOpen,
    isNodeConfigOpen,

    // Helper setters
    setIsPlaygroundOpen,
    setIsFlowManagerOpen,
    setIsVariablesPanelOpen,
    setIsVersionHistoryOpen,
    setShowShortcutHelp,
    setIsLogsOpenExclusive,
  };
};
