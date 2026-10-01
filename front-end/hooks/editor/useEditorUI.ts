import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import type { CustomNodeType } from '@n2flow/types';
import type { EditorUIState, DockTabId } from '../../types/editor';

export type ContextMenuState = {
  x: number;
  y: number;
  node?: CustomNodeType;
} | null;

/**
 * Build a boolean setter that drives one dock tab.
 *
 * Only one dock tab can be active at a time, so `true` activates `tab` and
 * `false` deactivates it — falling back to `null`, or leaving another tab
 * untouched if it happens to be the active one.
 *
 * `value` is resolved exactly the way React resolves a `SetStateAction`, so
 * callers may pass either a boolean or an updater.
 */
const makeTabToggle = (tab: DockTabId) => {
  return (setActiveDockTab: Dispatch<SetStateAction<DockTabId | null>>) =>
    (value: SetStateAction<boolean>): void => {
      setActiveDockTab((prev) => {
        const isOpen = typeof value === 'function' ? value(prev === tab) : value;
        return isOpen ? tab : prev === tab ? null : prev;
      });
    };
};

export const useEditorUI = (): EditorUIState => {
  const [activeDockTab, setActiveDockTab] = useState<DockTabId | null>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isCanvasSearchOpen, setIsCanvasSearchOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const isPlaygroundOpen = activeDockTab === 'playground';
  const isFlowManagerOpen = activeDockTab === 'flows';
  const isVariablesPanelOpen = activeDockTab === 'variables';
  const isVersionHistoryOpen = activeDockTab === 'history';
  const showShortcutHelp = activeDockTab === 'shortcuts';
  const isLogsOpen = activeDockTab === 'logs';
  const isNodeConfigOpen = activeDockTab === 'config';

  // Memoised together so all six keep a stable identity: they are dependencies of
  // several `useCallback`s upstream, and re-creating them every render would
  // re-run those effects.
  const toggles = useMemo(
    () => ({
      setIsPlaygroundOpen: makeTabToggle('playground')(setActiveDockTab),
      setIsFlowManagerOpen: makeTabToggle('flows')(setActiveDockTab),
      setIsVariablesPanelOpen: makeTabToggle('variables')(setActiveDockTab),
      setIsVersionHistoryOpen: makeTabToggle('history')(setActiveDockTab),
      setShowShortcutHelp: makeTabToggle('shortcuts')(setActiveDockTab),
      setIsLogsOpenExclusive: makeTabToggle('logs')(setActiveDockTab),
    }),
    [setActiveDockTab],
  );

  return {
    activeDockTab,
    setActiveDockTab,
    showMinimap,
    setShowMinimap,
    isLiveMode,
    setIsLiveMode,
    isCanvasSearchOpen,
    setIsCanvasSearchOpen,
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
    ...toggles,
  };
};
