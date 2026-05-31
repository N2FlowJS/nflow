import { useMemo, useEffect, useRef } from 'react';
import type { CommandAction } from '../../types/editor';
import nodeRegistry from '../../../back-end/node-registry';
import { prettifyLabel } from '../../lib/utils';

interface UseEditorHotkeysOptions {
  ui: any;
  graph: any;
  persistence: any;
  execution: any;
  onLayout: (mode?: any) => void;
  onExport: () => void;
  importInputRef: React.MutableRefObject<HTMLInputElement>;
}

export const useEditorHotkeys = ({
  ui,
  graph,
  persistence,
  execution,
  onLayout,
  onExport,
  importInputRef,
}: UseEditorHotkeysOptions) => {
  const {
    showCommandPalette, setShowCommandPalette,
    commandQuery, commandIndex, setCommandIndex,
    setIsCanvasSearchOpen, setIsToolsMenuOpen,
    setShowShortcutHelpExclusive,
    setShowMinimap
  } = ui;

  const commandActions = useMemo<CommandAction[]>(() => {
    const nodeActions: CommandAction[] = Object.keys(nodeRegistry)
      .sort((left, right) => prettifyLabel(left).localeCompare(prettifyLabel(right)))
      .map((type) => {
        const label = prettifyLabel(type);
        return {
          id: `add-node-${type}`,
          label: `Add ${label}`,
          group: "Nodes",
          shortcut: "-",
          keywords: `add node create ${type} ${label.toLowerCase()}`,
          run: () => graph.onAddNode(type, label),
        };
      });

    return [
      {
        id: "save",
        label: "Save Flow",
        group: "Flow",
        shortcut: "Ctrl/Cmd+S",
        keywords: "save flow persist",
        run: () => persistence.onSave(persistence.currentFlowName),
      },
      {
        id: "deploy",
        label: "Deploy Flow",
        group: "Flow",
        shortcut: "Ctrl/Cmd+Enter",
        keywords: "deploy run execute",
        run: () => void execution.onRunAll(),
      },
      {
        id: "undo",
        label: "Undo",
        group: "Edit",
        shortcut: "Ctrl/Cmd+Z",
        keywords: "undo",
        run: () => graph.undo(),
      },
      {
        id: "redo",
        label: "Redo",
        group: "Edit",
        shortcut: "Ctrl/Cmd+Y",
        keywords: "redo",
        run: () => graph.redo(),
      },
      // ... more actions could be added here
      ...nodeActions,
    ] as CommandAction[];
  }, [graph, persistence, execution]);

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return commandActions;
    return commandActions.filter((command) => {
      const haystack = `${command.label} ${command.group} ${command.keywords}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [commandActions, commandQuery]);

  const latestRef = useRef({
    ui, graph, persistence, execution, onLayout, onExport, importInputRef,
    filteredCommands, commandIndex, setCommandIndex, setShowCommandPalette, showCommandPalette
  });

  useEffect(() => {
    latestRef.current = {
      ui, graph, persistence, execution, onLayout, onExport, importInputRef,
      filteredCommands, commandIndex, setCommandIndex, setShowCommandPalette, showCommandPalette
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const {
        ui, graph, persistence, execution, onLayout, onExport, importInputRef,
        filteredCommands, commandIndex, setCommandIndex, setShowCommandPalette, showCommandPalette
      } = latestRef.current;

      if (showCommandPalette) {
        if (key === "escape") {
          e.preventDefault();
          setShowCommandPalette(false);
          return;
        }
        if (key === "arrowdown") {
          e.preventDefault();
          setCommandIndex((prev: number) => filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length);
          return;
        }
        if (key === "arrowup") {
          e.preventDefault();
          setCommandIndex((prev: number) => filteredCommands.length === 0 ? 0 : (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return;
        }
        if (key === "enter") {
          e.preventDefault();
          const command = filteredCommands[commandIndex];
          if (command) {
            command.run();
            setShowCommandPalette(false);
          }
          return;
        }
      }

      if (isMod && key === "k") {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (isMod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) graph.redo(); else graph.undo();
      } else if (isMod && key === "s") {
        e.preventDefault();
        persistence.onSave(persistence.currentFlowName);
      } else if (isMod && key === "enter") {
        e.preventDefault();
        execution.onRunAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    commandActions,
    filteredCommands,
  };
};
