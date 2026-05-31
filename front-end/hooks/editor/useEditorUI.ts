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

  const setIsPlaygroundOpen = useCallback((open: boolean) => {
    setActiveDockTab(open ? "playground" : null);
  }, []);

  const setIsFlowManagerOpen = useCallback((open: boolean) => {
    setActiveDockTab(open ? "flows" : null);
  }, []);

  const setIsVariablesPanelOpen = useCallback((open: boolean) => {
    setActiveDockTab(open ? "variables" : null);
  }, []);

  const setIsVersionHistoryOpen = useCallback((open: boolean) => {
    setActiveDockTab(open ? "history" : null);
  }, []);

  const setShowShortcutHelp = useCallback((open: boolean) => {
    setActiveDockTab(open ? "shortcuts" : null);
  }, []);

  const setIsLogsOpenExclusive = useCallback((open: boolean) => {
    setActiveDockTab(open ? "logs" : null);
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
