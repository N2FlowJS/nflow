import React from 'react';
import type { CustomNodeType } from '@n2flow/types';
import { PanelSkeleton } from '../shared/CyberUI';
import { CyberErrorBoundary } from '../shared/CyberErrorBoundary';
import type { DockTabId } from '../../hooks/useFlowEditor';
import type { useFlowEditor } from '../../hooks/useFlowEditor';

const LazyFlowManager = React.lazy(() => import('./FlowManager'));
const LazyLogViewer = React.lazy(() => import('./LogViewer'));
const LazyShortcutHelp = React.lazy(() => import('./ShortcutHelp'));
const LazyValidationPanel = React.lazy(() => import('./ValidationPanel'));
const LazyVariablesPanel = React.lazy(() => import('./VariablesPanel'));
const LazyVersionHistoryPanel = React.lazy(() => import('./VersionHistoryPanel'));
const LazyGlobalPreview = React.lazy(() => import('../GlobalPreview'));
const LazyExecutionPanel = React.lazy(() => import('../node-parts/NodeDataModal'));
const LazyNodeConfigPanel = React.lazy(() => import('./NodeConfigPanel'));
const LazyPlayground = React.lazy(() => import('../Playground'));

type Editor = ReturnType<typeof useFlowEditor>;

interface DockContentPanelProps {
  activeTab: DockTabId | null;
  editor: Editor;
}

/**
 * Renders the appropriate dock panel for the given active tab.
 * Extracted from FlowEditor to eliminate the 33-dependency useMemo.
 * Each panel is lazy-loaded and wrapped in an ErrorBoundary.
 */
const DockContentPanel: React.FC<DockContentPanelProps> = ({ activeTab, editor }) => {
  if (!activeTab) return null;

  switch (String(activeTab)) {
    case 'config':
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
              data={editor.currentConfigNode?.data as CustomNodeType['data'] | null}
              updateNodeData={editor.updateNodeDataById}
              handleParamChange={editor.handleConfigParamChange}
              globalVariables={editor.globalVariables}
            />
          </React.Suspense>
        </CyberErrorBoundary>
      );

    case 'playground':
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

    case 'preview':
      return (
        <CyberErrorBoundary name="Result Preview Module">
          <React.Suspense fallback={<PanelSkeleton />}>
            <LazyGlobalPreview />
          </React.Suspense>
        </CyberErrorBoundary>
      );

    case 'execution':
      return (
        <CyberErrorBoundary name="Execution Details Module">
          <React.Suspense fallback={<PanelSkeleton />}>
            <LazyExecutionPanel />
          </React.Suspense>
        </CyberErrorBoundary>
      );

    case 'logs':
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

    case 'validation':
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

    case 'shortcuts':
      return (
        <CyberErrorBoundary name="Shortcuts Reference Module">
          <React.Suspense fallback={<PanelSkeleton />}>
            <LazyShortcutHelp
              showShortcutHelp={editor.showShortcutHelp}
              setShowShortcutHelp={editor.setShowShortcutHelp}
            />
          </React.Suspense>
        </CyberErrorBoundary>
      );

    case 'flows':
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

    case 'history':
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

    case 'variables':
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
};

export default DockContentPanel;
