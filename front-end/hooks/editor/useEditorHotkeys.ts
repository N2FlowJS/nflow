import { useMemo, useEffect, useRef } from 'react';
import type {
  CommandAction,
  EditorUIState,
  GraphState,
  FlowPersistenceState,
  FlowExecutionState,
  LayoutMode,
} from '../../types/editor';
import nodeRegistry from '../../../back-end/node-registry';
import { prettifyLabel } from '../../lib/utils';

interface UseEditorHotkeysOptions {
  ui: EditorUIState;
  graph: GraphState;
  persistence: FlowPersistenceState;
  execution: FlowExecutionState;
  onLayout: (mode?: LayoutMode) => void;
}

export const useEditorHotkeys = ({
  ui,
  graph,
  persistence,
  execution,
  onLayout,
}: UseEditorHotkeysOptions) => {
  const { showCommandPalette, setShowCommandPalette, commandQuery, commandIndex, setCommandIndex } =
    ui;

  const commandActions = useMemo<CommandAction[]>(() => {
    const nodeActions: CommandAction[] = Object.keys(nodeRegistry)
      .sort((left, right) => prettifyLabel(left).localeCompare(prettifyLabel(right)))
      .map((type) => {
        const label = prettifyLabel(type);
        return {
          id: `add-node-${type}`,
          label: `Add ${label}`,
          group: 'Nodes',
          shortcut: '-',
          keywords: `add node create ${type} ${label.toLowerCase()}`,
          run: () => {
            const connectFrom = window.__lastConnectionStart;
            const pos = graph.pendingNodeInsertPosition || {
              x: Math.random() * 400 + 100,
              y: Math.random() * 400 + 100,
            };
            graph.onAddNode(type, label, pos, connectFrom ?? undefined);

            // Clear the temp state
            window.__lastConnectionStart = null;
            graph.setPendingNodeInsertPosition(null);
          },
        };
      });

    return [
      {
        id: 'save',
        label: 'Save Flow',
        group: 'Flow',
        shortcut: 'Ctrl/Cmd+S',
        keywords: 'save flow persist',
        run: () => {
          void persistence.onSave(persistence.currentFlowName);
        },
      },
      {
        id: 'deploy',
        label: 'Deploy Flow',
        group: 'Flow',
        shortcut: 'Ctrl/Cmd+Enter',
        keywords: 'deploy run execute',
        run: () => void execution.onRunAll(),
      },
      {
        id: 'undo',
        label: 'Undo',
        group: 'Edit',
        shortcut: 'Ctrl/Cmd+Z',
        keywords: 'undo',
        run: () => graph.undo(),
      },
      {
        id: 'redo',
        label: 'Redo',
        group: 'Edit',
        shortcut: 'Ctrl/Cmd+Y',
        keywords: 'redo',
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
    graph,
    persistence,
    execution,
    ui,
    onLayout,
    filteredCommands,
    commandIndex,
    setCommandIndex,
    setShowCommandPalette,
    showCommandPalette,
  });

  useEffect(() => {
    latestRef.current = {
      graph,
      persistence,
      execution,
      ui,
      onLayout,
      filteredCommands,
      commandIndex,
      setCommandIndex,
      setShowCommandPalette,
      showCommandPalette,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      // Read through the ref so the handler always sees current values. The
      // members are deliberately not destructured: every name would shadow the
      // hook's own bindings, and the alias keeps `no-shadow` honest.
      const latest = latestRef.current;

      if (latest.showCommandPalette) {
        if (key === 'escape') {
          e.preventDefault();
          latest.setShowCommandPalette(false);
          return;
        }
        if (key === 'arrowdown') {
          e.preventDefault();
          latest.setCommandIndex((prev: number) =>
            latest.filteredCommands.length === 0 ? 0 : (prev + 1) % latest.filteredCommands.length,
          );
          return;
        }
        if (key === 'arrowup') {
          e.preventDefault();
          latest.setCommandIndex((prev: number) =>
            latest.filteredCommands.length === 0
              ? 0
              : (prev - 1 + latest.filteredCommands.length) % latest.filteredCommands.length,
          );
          return;
        }
        if (key === 'enter') {
          e.preventDefault();
          const command = latest.filteredCommands[latest.commandIndex];
          if (command) {
            command.run();
            latest.setShowCommandPalette(false);
          }
          return;
        }
      }

      if (isMod && key === 'k') {
        e.preventDefault();
        latest.setShowCommandPalette(!latest.showCommandPalette);
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (isMod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) latest.graph.redo();
        else latest.graph.undo();
      } else if (isMod && key === 's') {
        e.preventDefault();
        void latest.persistence.onSave(latest.persistence.currentFlowName);
      } else if (isMod && key === 'enter') {
        e.preventDefault();
        void latest.execution.onRunAll();
      } else if (key === 'delete' || key === 'backspace') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          latest.graph.onDeleteSelected();
        }
      } else if (isMod && key === 'a') {
        e.preventDefault();
        latest.graph.onSelectAll();
      } else if (isMod && key === 'c') {
        latest.graph.onCopy();
      } else if (isMod && key === 'v') {
        latest.graph.onPaste();
      } else if (isMod && key === 'd') {
        e.preventDefault();
        latest.graph.onDuplicate();
      } else if (isMod && e.shiftKey && key === 'm') {
        // Advertised in the shortcuts panel; the minimap is otherwise unreachable.
        e.preventDefault();
        latest.ui.setShowMinimap(!latest.ui.showMinimap);
      } else if (isMod && e.shiftKey && key === 'l') {
        // Advertised in the shortcuts panel: auto-layout.
        e.preventDefault();
        latest.onLayout('SMART');
      } else if (isMod && key === 'f') {
        e.preventDefault();
        latest.ui.setIsCanvasSearchOpen(!latest.ui.isCanvasSearchOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    commandActions,
    filteredCommands,
  };
};
