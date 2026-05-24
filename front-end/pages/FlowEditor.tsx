import {
  Background,
  BackgroundVariant,
  Controls,
  EdgeTypes,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import React, { useMemo } from "react";
import CyberEdge from "../components/CyberEdge";
import CyberGroupNode from "../components/CyberGroupNode";
import CyberNode from "../components/CyberNode";
import CyberNoteNode from "../components/CyberNoteNode";
import CanvasSearch from "../components/editor/CanvasSearch";
import CommandPalette from "../components/editor/CommandPalette";
import ContextMenu from "../components/editor/ContextMenu";
import EditorDock, { type EditorDockTab } from "../components/editor/EditorDock";
import FlowHeader from "../components/editor/FlowHeader";
import { Sidebar } from "../components/Sidebar";
import { PanelSkeleton } from "../components/shared/CyberUI";
import { CyberErrorBoundary } from "../components/shared/CyberErrorBoundary";
import { useFlowEditor, DockTabId } from "../hooks/useFlowEditor";
import type { CustomNodeType } from "@n2flow/types";

const LazyFlowManager = React.lazy(() => import("../components/editor/FlowManager"));
const LazyLogViewer = React.lazy(() => import("../components/editor/LogViewer"));
const LazyShortcutHelp = React.lazy(() => import("../components/editor/ShortcutHelp"));
const LazyValidationPanel = React.lazy(() => import("../components/editor/ValidationPanel"));
const LazyVariablesPanel = React.lazy(() => import("../components/editor/VariablesPanel"));
const LazyVersionHistoryPanel = React.lazy(() => import("../components/editor/VersionHistoryPanel"));
const LazyGlobalPreview = React.lazy(() => import("../components/GlobalPreview"));
const LazyExecutionPanel = React.lazy(() => import("../components/node-parts/NodeDataModal"));
const LazyNodeConfigPanel = React.lazy(() => import("../components/editor/NodeConfigPanel"));
const LazyPlayground = React.lazy(() => import("../components/Playground"));

const nodeTypes: NodeTypes = {
  cyberNode: CyberNode as any,
  cyberGroup: CyberGroupNode as any,
  cyberNote: CyberNoteNode as any,
};

const edgeTypes: EdgeTypes = {
  cyberEdge: CyberEdge,
};

const Flow = () => {
  const editor = useFlowEditor();

  const dockContent = useMemo(() => {
    if (!editor.activeDockTab) return null;
    switch (String(editor.activeDockTab)) {
      case "config":
        return (
          <CyberErrorBoundary name="Config Panel Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyNodeConfigPanel
                isOpen={editor.isNodeConfigOpen}
                onClose={() => {
                  editor.setActiveDockTab(null);
                  editor.setConfigNodeId(null);
                  editor.setHighlightedConfigField(null);
                }}
                data={editor.currentConfigNode?.data as CustomNodeType["data"] | null}
                updateNodeData={editor.updateNodeDataById}
                handleParamChange={editor.handleConfigParamChange}
                globalVariables={editor.globalVariables}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "playground":
        return (
          <CyberErrorBoundary name="Playground Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyPlayground
                isOpen={editor.isPlaygroundOpen}
                onClose={() => editor.setIsPlaygroundOpen(false)}
                messages={editor.playgroundMessages}
                isTyping={editor.isPlaygroundTyping}
                runtimeStatus={editor.runtimeStatus}
                error={editor.playgroundError}
                onErrorDismiss={() => editor.setPlaygroundError(null)}
                onSendMessage={editor.onSendMessage}
                onClearMessages={editor.onClearPlaygroundMessages}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "preview":
        return (
          <CyberErrorBoundary name="Result Preview Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyGlobalPreview />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "execution":
        return (
          <CyberErrorBoundary name="Execution Details Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyExecutionPanel />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "logs":
        return (
          <CyberErrorBoundary name="Execution Logs Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyLogViewer
                isLogsOpen={editor.isLogsOpen}
                setIsLogsOpen={editor.setIsLogsOpenExclusive}
                executionLogs={editor.executionLogs}
                onClear={() => editor.setExecutionLogs([])}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "validation":
        return (
          <CyberErrorBoundary name="Flow Validator Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyValidationPanel
                flowIssues={editor.flowIssues}
                focusIssueNode={editor.focusIssueNode}
                onClose={() => editor.setActiveDockTab(null)}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "shortcuts":
        return (
          <CyberErrorBoundary name="Shortcuts Reference Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyShortcutHelp
                showShortcutHelp={editor.showShortcutHelp}
                setShowShortcutHelp={editor.setShowShortcutHelpExclusive}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "flows":
        return (
          <CyberErrorBoundary name="Flow Manager Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyFlowManager
                isFlowManagerOpen={editor.isFlowManagerOpen}
                setIsFlowManagerOpen={editor.setIsFlowManagerOpen}
                savedFlows={editor.savedFlows}
                onDeleteFlow={editor.onDeleteFlow}
                navigate={editor.navigate}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "history":
        return (
          <CyberErrorBoundary name="Version History Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyVersionHistoryPanel
                isOpen={editor.isVersionHistoryOpen}
                onClose={() => editor.setIsVersionHistoryOpen(false)}
                versions={editor.flowVersions}
                onLoadVersion={editor.onLoadVersion}
                isRestoring={editor.isRestoringVersion}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      case "variables":
        return (
          <CyberErrorBoundary name="Global Variables Module">
            <React.Suspense fallback={<PanelSkeleton />}>
              <LazyVariablesPanel
                isOpen={editor.isVariablesPanelOpen}
                onClose={() => editor.setIsVariablesPanelOpen(false)}
                variables={editor.globalVariables}
                onVariablesChange={editor.setGlobalVariables}
              />
            </React.Suspense>
          </CyberErrorBoundary>
        );
      default:
        return null;
    }
  }, [
    editor.activeDockTab,
    editor.isNodeConfigOpen,
    editor.currentConfigNode,
    editor.updateNodeDataById,
    editor.handleConfigParamChange,
    editor.globalVariables,
    editor.isPlaygroundOpen,
    editor.playgroundMessages,
    editor.isPlaygroundTyping,
    editor.runtimeStatus,
    editor.playgroundError,
    editor.onSendMessage,
    editor.onClearPlaygroundMessages,
    editor.isLogsOpen,
    editor.setIsLogsOpenExclusive,
    editor.executionLogs,
    editor.flowIssues,
    editor.focusIssueNode,
    editor.showShortcutHelp,
    editor.setShowShortcutHelpExclusive,
    editor.isFlowManagerOpen,
    editor.setIsFlowManagerOpen,
    editor.savedFlows,
    editor.onDeleteFlow,
    editor.navigate,
    editor.isVersionHistoryOpen,
    editor.setIsVersionHistoryOpen,
    editor.flowVersions,
    editor.onLoadVersion,
    editor.isRestoringVersion,
    editor.isVariablesPanelOpen,
    editor.setIsVariablesPanelOpen,
    editor.setGlobalVariables,
  ]);

  return (
    <div className="w-full h-screen min-h-0 bg-cyber-dark text-white overflow-hidden flex flex-col">
      <FlowHeader
        currentFlowName={editor.currentFlowName}
        setCurrentFlowName={editor.setCurrentFlowName}
        isSaving={editor.isSaving}
        onSave={editor.onSave}
        onRunAll={editor.onRunAll}
        onValidateFlow={editor.onValidateFlow}
        setIsPlaygroundOpen={editor.setIsPlaygroundOpen}
        setIsFlowManagerOpen={editor.setIsFlowManagerOpen}
        setIsVariablesPanelOpen={editor.setIsVariablesPanelOpen}
        setIsVersionHistoryOpen={editor.setIsVersionHistoryOpen}
        validationLocale={editor.validationLocale}
        setValidationLocale={editor.setValidationLocale}
        setShowShortcutHelp={editor.setShowShortcutHelpExclusive}
        setShowCommandPalette={editor.setShowCommandPalette}
        importInputRef={editor.importInputRef}
        onImport={editor.onImport}
        onExport={editor.onExport}
        onCopy={editor.onCopy}
        onPaste={editor.onPaste}
        onDuplicate={editor.onDuplicate}
        undo={editor.undo}
        redo={editor.redo}
        onLayout={editor.onLayoutHandler}
        onGroupNodes={editor.onGroupNodes}
        onUngroupNodes={editor.onUngroupNodes}
        onDownloadImage={editor.onDownloadImage}
        onClear={editor.onClear}
        setShowMinimap={editor.setShowMinimap}
        setIsLiveMode={editor.setIsLiveMode}
        isLiveMode={editor.isLiveMode}
        reactFlowInstance={editor.reactFlowInstance}
        navigate={editor.navigate}
        lastAutoSave={editor.lastAutoSave}
        isAutoSaving={editor.isAutoSaving}
        isOnline={editor.isOnline}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar onAddNode={editor.onAddNode} />

        {/* React Flow Canvas */}
        <div
          className="flex-1 min-h-0 min-w-0 relative"
          onDragOver={editor.onDragOver}
          onDrop={editor.onDrop}
        >
          <ReactFlow
            nodes={editor.nodes}
            edges={editor.renderedEdges}
            onNodesChange={editor.onNodesChangeWrapper}
            onEdgesChange={editor.onEdgesChangeWrapper}
            onSelectionChange={editor.onSelectionChange}
            onNodeDragStart={editor.takeSnapshot}
            onSelectionDragStart={editor.takeSnapshot}
            onConnect={editor.onConnect}
            onNodeContextMenu={editor.onNodeContextMenu}
            onPaneContextMenu={editor.onPaneContextMenuHandler}
            onInit={editor.setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            autoPanOnNodeDrag={true}
            autoPanOnConnect={true}
            className="bg-cyber-dark"
            minZoom={0.1}
            maxZoom={4}
            defaultEdgeOptions={{
              type: "cyberEdge",
              animated: true,
              style: { stroke: "rgba(0, 240, 255, 0.2)", strokeWidth: 1 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={0.5}
              color="#111"
              className="bg-black"
            />

            <Controls
              position="top-right"
              className="!bg-black/40 !backdrop-blur-md !border-white/5 !rounded-lg !m-4 !shadow-none opacity-20 hover:opacity-100 transition-all duration-500 scale-75 origin-top-right"
            />

            {editor.showMinimap && (
              <MiniMap
                nodeStrokeWidth={3}
                nodeColor={(n) => {
                  if (n.type === "cyberGroup") return "rgba(255, 255, 255, 0.02)";
                  const node = n as CustomNodeType;
                  const type = node.data.type || "";
                  if (type === "Agent") return "#7000ff";
                  if (type.includes("LLM") || type.includes("LanguageModel")) return "#a855f7";
                  if (type.includes("Tool")) return "#f59e0b";
                  return "#00f0ff";
                }}
                maskColor="rgba(0, 0, 0, 0.8)"
                className="!bg-black/40 !backdrop-blur-md !border-white/5 !rounded-lg !bottom-4 !right-4 !shadow-none !w-[140px] !h-[100px] opacity-40 hover:opacity-100 transition-opacity"
              />
            )}
          </ReactFlow>

          <CanvasSearch
            isOpen={editor.isCanvasSearchOpen}
            onClose={() => editor.setIsCanvasSearchOpen(false)}
            nodes={editor.nodes}
            setNodes={editor.setNodes}
          />
          <EditorDock
            tabs={editor.dockTabs}
            activeTab={editor.activeDockTab}
            onTabChange={(tabId) => {
              if (tabId === null) {
                editor.setActiveDockTab(null);
                return;
              }
              editor.setActiveDockTab((prev) => (prev === tabId ? null : (tabId as DockTabId)));
            }}
          >
            {dockContent}
          </EditorDock>
        </div>
      </div>

      <CommandPalette
        showCommandPalette={editor.showCommandPalette}
        setShowCommandPalette={editor.setShowCommandPalette}
        commandQuery={editor.commandQuery}
        setCommandQuery={editor.setCommandQuery}
        commandIndex={editor.commandIndex}
        setCommandIndex={editor.setCommandIndex}
        filteredCommands={editor.filteredCommands}
        commandInputRef={editor.commandInputRef}
      />

      {editor.contextMenu && (
        <ContextMenu
          x={editor.contextMenu.x}
          y={editor.contextMenu.y}
          node={editor.contextMenu.node}
          onClose={() => editor.setContextMenu(null)}
          actions={{
            onFocus: () => {
              const node = editor.contextMenu?.node;
              if (node) editor.focusNode(node);
            },
            onRun: () => {
              const node = editor.contextMenu?.node;
              if (node) {
                editor.setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? { ...n, data: { ...n.data, status: "running" } }
                      : n,
                  ),
                );
                setTimeout(() => {
                  editor.setNodes((nds) =>
                    nds.map((n) =>
                      n.id === node.id
                        ? { ...n, data: { ...n.data, status: "success" } }
                        : n,
                  ),
                );
                  setTimeout(() => {
                    editor.setNodes((nds) =>
                      nds.map((n) =>
                        n.id === node.id
                          ? { ...n, data: { ...n.data, status: "idle" } }
                          : n,
                      ),
                    );
                  }, 3000);
                }, 1000);
              }
            },
            onOpenConfig: () => {
              const node = editor.contextMenu?.node;
              if (node) {
                editor.setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            __openConfigToken: Date.now(),
                          },
                        }
                      : n,
                  ),
                );
              }
            },
            onOpenData: () => {
              const node = editor.contextMenu?.node;
              if (node) {
                editor.setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            __openDataToken: Date.now(),
                          },
                        }
                      : n,
                  ),
                );
              }
            },
            onCopy: () => editor.onCopy(),
            onPaste: (pos) => {
              if (editor.reactFlowInstance) {
                const project = editor.reactFlowInstance.screenToFlowPosition(pos);
                editor.onPaste(project);
              } else {
                editor.onPaste();
              }
            },
            onDuplicate: () => editor.onDuplicate(),
            onDelete: () => {
              const node = editor.contextMenu?.node;
              if (node) {
                editor.takeSnapshot();
                editor.deleteElements?.({ nodes: [node] });
              }
            },
            onUngroup: () => {
              const node = editor.contextMenu?.node;
              if (node && node.type === "cyberGroup") {
                editor.onUngroupNodes(node.id);
              }
            },
            onLayout: (type?: string) => {
              if (type) {
                editor.onLayout(type as any);
              } else {
                editor.onLayout("LR");
              }
            },
            onAddNode: (pos) => {
              if (editor.reactFlowInstance) {
                const project = editor.reactFlowInstance.screenToFlowPosition(pos);
                editor.setPendingNodeInsertPosition(project);
                editor.setCommandQuery("add node ");
                editor.setCommandIndex(0);
                editor.setShowCommandPalette(true);
              }
            },
            onAddNote: (pos) => {
              if (editor.reactFlowInstance) {
                const project = editor.reactFlowInstance.screenToFlowPosition(pos);
                const newNode: Node = {
                  id: `note-${Date.now()}`,
                  type: "cyberNote",
                  position: project,
                  data: { label: "", type: "cyberNote", status: "idle" },
                };
                editor.takeSnapshot();
                editor.setNodes((nds) => nds.concat(newNode));
              }
            },
            onSelectAll: editor.onSelectAll,
          }}
        />
      )}
    </div>
  );
};

const FlowEditor = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default FlowEditor;
