import { CommentOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Background,
  ConnectionLineType,
  ControlButton,
  Controls,
  Edge,
  EdgeTypes,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, Drawer, Form, Layout, Modal, Button } from 'antd';
import React, { memo, useCallback, useMemo, useState } from 'react';

import NodeForm from '../forms/node-form';
// Removed NodePalette

import { useFlowState } from '../../../context/FlowStateContext';
import { FlowNode, NodeTypeString } from '../../../models/flowTypes';
import { useTheme } from '../../../theme';
import CustomEdge from '../edges/CustomEdge';
// Additional node imports would be added

import { isConnectionAllowed } from '../../../utils/client/connectionRules';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { parseFlowConfig } from '../../../utils/server/parseFlowConfig';
import { nodeTypes } from './nodeTypes';
import { FlowEditorContext, FlowEditorContextType } from '../../../packages/@flow/editor-context';
import { useConversationStateLoader } from './hooks/useConversationStateLoader';
import { useEdgeCleanup } from './hooks/useEdgeCleanup';
import { useEdgeDeletion } from './hooks/useEdgeDeletion';
import { useNodeConnection } from './hooks/useNodeConnection';
import { useFlowSaver } from './hooks/useFlowSaver';
import { useValidConnection } from './hooks/useValidConnection';
import { useNodeDropper } from './hooks/useNodeDropper';
import { useDragOverHandler } from './hooks/useDragOverHandler';
import { useNodeClickHandler } from './hooks/useNodeClickHandler';
import { useEdgesWithDragFlag } from './hooks/useEdgesWithDragFlag';
import { getOppositePosition, slugify } from '../../../packages/@flow/flow-helpers';

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
  smoothstep: CustomEdge,
  floating: CustomEdge,
};

interface FlowEditorProps {
  flowConfig: string;
  onStartConversation?: () => void;
  agentId?: string;
  activeConversationId?: string;
}

const { Content } = Layout;

type NextStepContext = {
  nodeId: string;
  handleId: string;
  handleType: 'source' | 'target';
  position: Position;
  nodeType: NodeTypeString;
  clientX: number;
  clientY: number;
  sourceW: number;
  sourceH: number;
} | null;

const FlowEditor: React.FC<FlowEditorProps> = ({ flowConfig, onStartConversation, agentId, activeConversationId }) => {
  const { theme } = useTheme();
  const initialFlow = parseFlowConfig(flowConfig);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nodeForm] = Form.useForm();
  const { screenToFlowPosition } = useReactFlow();
  // Removed palette state
  // Add lightweight drag flag
  const [isDragging, setIsDragging] = useState(false);

  const { setFlowState } = useFlowState();

  // Next step modal state
  const [isNextStepOpen, setIsNextStepOpen] = useState(false);
  const [nextStepCtx, setNextStepCtx] = useState<NextStepContext>(null);

  const noNodes = nodes.length === 0;

  // Helpers for smart positioning
  const getDirVector = useCallback((p: Position) => {
    switch (p) {
      case Position.Bottom:
        return { x: 0, y: 1 };
      case Position.Top:
        return { x: 0, y: -1 };
      case Position.Left:
        return { x: -1, y: 0 };
      case Position.Right:
        return { x: 1, y: 0 };
      default:
        return { x: 0, y: 1 };
    }
  }, []);

  const estimateSize = useCallback((_: NodeTypeString) => {
    // Fallback estimate; if measured sizes exist on nodes, use them where possible
    // Could be refined per type
    return { width: 320, height: 180 };
  }, []);

  const snapToGrid = useCallback((pos: { x: number; y: number }) => {
    const grid = 20;
    return {
      x: Math.round(pos.x / grid) * grid,
      y: Math.round(pos.y / grid) * grid,
    };
  }, []);

  const rectsOverlap = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ) => {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  };

  const collides = useCallback(
    (pos: { x: number; y: number }, size: { width: number; height: number }) => {
      const a = { x: pos.x, y: pos.y, w: size.width, h: size.height };
      for (const n of nodes) {
        const w = (n as any).width ?? estimateSize(n.type as NodeTypeString).width;
        const h = (n as any).height ?? estimateSize(n.type as NodeTypeString).height;
        const b = { x: n.position.x, y: n.position.y, w, h };
        if (rectsOverlap(a, b)) return true;
      }
      return false;
    },
    [nodes, estimateSize]
  );

  const availableNextTypes = useMemo(() => {
    if (nextStepCtx) {
      const sourceType = nextStepCtx.nodeType;
      return Object.entries(NODE_REGISTRY).filter(([type]) =>
        isConnectionAllowed(sourceType, type as NodeTypeString)
      ) as Array<[NodeTypeString, any]>;
    }
    // Initial state (no source). Allow "begin" and types connectable from begin
    return Object.entries(NODE_REGISTRY).filter(
      ([type]) => type === 'begin' || isConnectionAllowed('begin' as NodeTypeString, type as NodeTypeString)
    ) as Array<[NodeTypeString, any]>;
  }, [nextStepCtx]);

  useConversationStateLoader(activeConversationId, setFlowState);
  useEdgeCleanup(nodes, setEdges);

  const onEdgeDelete = useEdgeDeletion(setEdges);
  const onConnect = useNodeConnection(nodes, setNodes, setEdges);
  const handleSaveFlow = useFlowSaver(agentId, nodes, edges);
  const isValidConnection = useValidConnection(nodes);
  const onDrop = useNodeDropper(screenToFlowPosition, setNodes, nodes);
  const onDragOver = useDragOverHandler();
  const onNodeClick = useNodeClickHandler(setSelectedNode);

  const openConfigDrawer = useCallback(() => {
    if (selectedNode) {
      setIsDrawerOpen(true);
    }
  }, [selectedNode]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    },
    [setNodes]
  );

  const openNextStepModal = useCallback<FlowEditorContextType['openNextStepModal']>((info) => {
    // Only react to source handle clicks
    if (info.handleType !== 'source') return;
    setNextStepCtx(info);
    setIsNextStepOpen(true);
  }, []);

  const openInitialAddModal = useCallback(() => {
    setNextStepCtx(null);
    setIsNextStepOpen(true);
  }, []);

  const addNextNode = useCallback(
    (nodeType: NodeTypeString) => {
      // Initial add (no source context)
      if (!nextStepCtx) {
        const defaultData = NODE_REGISTRY[nodeType].data as any;
        const form = defaultData.form || {};
        const baseName = form.name || nodeType;
        let newName = baseName;
        let counter = 1;
        while (nodes.some((node) => node.data.form?.name === newName)) {
          newName = `${baseName}_${counter}`;
          counter++;
        }

        const size = estimateSize(nodeType);
        const centerFlow = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        let pos = snapToGrid({ x: centerFlow.x - size.width / 2, y: centerFlow.y - size.height / 2 });
        // push down if colliding (unlikely with empty canvas)
        let attempts = 0;
        while (collides(pos, size) && attempts < 10) {
          pos = { x: pos.x, y: pos.y + 20 };
          attempts++;
        }

        const newNode: FlowNode = {
          id: `node_${Date.now()}`,
          type: nodeType,
          data: {
            ...defaultData,
            form: {
              ...form,
              name: newName,
            },
          },
          position: pos,
        };
        setNodes((nds) => [...nds, newNode]);
        setIsNextStepOpen(false);
        setNextStepCtx(null);
        return;
      }

      const source = nodes.find((n) => n.id === nextStepCtx.nodeId);
      if (!source) return;

      const defaultData = NODE_REGISTRY[nodeType].data as any;
      const form = defaultData.form || {};
      const baseName = form.name || nodeType;
      let newName = baseName;
      let counter = 1;
      while (nodes.some((node) => node.data.form?.name === newName)) {
        newName = `${baseName}_${counter}`;
        counter++;
      }

      // Desired anchor is the clicked handle location in flow coords
      const clickFlow = screenToFlowPosition({ x: nextStepCtx.clientX, y: nextStepCtx.clientY });
      const dir = getDirVector(nextStepCtx.position);
      const size = estimateSize(nodeType);

      // Place new node using source node size for smarter spacing
      const GAP = 16; // gap between source node bbox and new node bbox
      const sW = nextStepCtx.sourceW ?? (source as any).width ?? estimateSize(source.type as NodeTypeString).width;
      const sH = nextStepCtx.sourceH ?? (source as any).height ?? estimateSize(source.type as NodeTypeString).height;

      let pos: { x: number; y: number };
      switch (nextStepCtx.position) {
        case Position.Bottom:
          pos = {
            x: clickFlow.x - size.width / 2,
            y: source.position.y + sH + GAP,
          };
          break;
        case Position.Top:
          pos = {
            x: clickFlow.x - size.width / 2,
            y: source.position.y - GAP - size.height,
          };
          break;
        case Position.Left:
          pos = {
            x: source.position.x + GAP,
            y: clickFlow.y - size.height / 2,
          };
          break;
        case Position.Right:
        default:
          pos = {
            x: source.position.x + sW + GAP,
            y: clickFlow.y - size.height / 2,
          };
          break;
      }

      // Snap to grid
      pos = snapToGrid(pos);

      // Avoid collisions by pushing along the direction vector
      const STEP = 20; // reduced step from 40 so adjustments are less far
      let attempts = 0;
      while (collides(pos, size) && attempts < 20) {
        pos = { x: pos.x + dir.x * STEP, y: pos.y + dir.y * STEP };
        attempts++;
      }

      const newNode: FlowNode = {
        id: `node_${Date.now()}`,
        type: nodeType,
        data: {
          ...defaultData,
          form: {
            ...form,
            name: newName,
          },
        },
        position: pos,
      };

      setNodes((nds) => [...nds, newNode]);

      // Choose target handle: SubAgent -> Top; otherwise opposite of clicked source handle; fallback Top
      let targetHandle: string | undefined;
      if (nodeType === 'subagent') {
        targetHandle = `in-${Position.Top}-0`;
      } else {
        const opposite = getOppositePosition(nextStepCtx.position);
        targetHandle = `in-${opposite}-0`;
      }

      const sourceHandle = nextStepCtx.handleId;
      const newEdge: Edge = {
        id: `edge-${nextStepCtx.nodeId}-to-${newNode.id}`,
        source: nextStepCtx.nodeId,
        sourceHandle,
        target: newNode.id,
        ...(targetHandle ? { targetHandle } : {}),
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
      } as Edge;

      // If source is categorize, persist routing in form
      if (nextStepCtx.nodeType === 'categorize' && sourceHandle?.startsWith('out-')) {
        const categoryName = sourceHandle.substring(4);
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== nextStepCtx.nodeId || n.type !== 'categorize') return n;
            const form = n.data.form as any;
            if (!Array.isArray(form?.categories)) return n;
            return {
              ...n,
              data: {
                ...n.data,
                form: {
                  ...form,
                  categories: form.categories.map((c: any) =>
                    c.name === categoryName ? { ...c, targetNode: newNode.id } : c
                  ),
                },
              },
            } as FlowNode;
          })
        );
      }

      // If source is decision, persist target in form (branch or default)
      if (nextStepCtx.nodeType === 'decision' && sourceHandle) {
        const branchName = sourceHandle.startsWith('out-') ? sourceHandle.substring(4) : '';
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== nextStepCtx.nodeId || n.type !== 'decision') return n;
            const form: any = { ...(n.data.form || {}) };
            if (branchName === 'default') {
              form.defaultTarget = newNode.id;
            } else if (branchName) {
              form.branches = (form.branches || []).map((b: any) =>
                slugify((b as any).name) === branchName ? { ...b, targetNode: newNode.id } : b
              );
            }
            return { ...n, data: { ...n.data, form } } as FlowNode;
          })
        );
      }

      setEdges((eds) => [...eds, newEdge]);

      setIsNextStepOpen(false);
      setNextStepCtx(null);
    },
    [nextStepCtx, nodes, setNodes, setEdges, screenToFlowPosition, getDirVector, estimateSize, snapToGrid, collides]
  );

  React.useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        data: { ...edge.data, onDelete: onEdgeDelete },
      }))
    );
  }, [onEdgeDelete, setEdges]);

  // Replace inline useMemo with the hook
  const edgesForRender = useEdgesWithDragFlag(edges, isDragging);

  const modalTitle = nextStepCtx ? 'Select Next Step' : 'Add First Node';

  return (
    <FlowEditorContext.Provider value={{ openConfigDrawer, deleteNode, openNextStepModal }}>
      <Layout style={{ height: '100%', position: 'relative' }}>
        {/* NodePalette removed */}

        <Content style={{ position: 'relative' }}>
          <ReactFlow
            // fitViewOptions={{ padding: 0.1 }}
            colorMode={theme}
            nodes={nodes}
            edges={edgesForRender}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            // Toggle performance mode for edges while dragging nodes
            onNodeDragStart={() => setIsDragging(true)}
            onNodeDragStop={() => setIsDragging(false)}
            connectionLineType={ConnectionLineType.Bezier}
            isValidConnection={isValidConnection}
            fitView
            nodeOrigin={[0.5, 0]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid={true}
            defaultEdgeOptions={{
              type: 'default',
              data: {
                onDelete: onEdgeDelete,
              },
            }}>
            <Controls
              orientation="horizontal"
              position="top-left"
              showZoom={true}
              showFitView={true}
              showInteractive={true}>
              <ControlButton onClick={handleSaveFlow}>
                <SaveOutlined />
              </ControlButton>
              <ControlButton onClick={onStartConversation}>
                <CommentOutlined />
              </ControlButton>
            </Controls>
            <Background />
          </ReactFlow>

          {noNodes && !isNextStepOpen && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
              <Button type="primary" size="large" onClick={openInitialAddModal} style={{ pointerEvents: 'auto' }}>
                Start building your N-Flow
              </Button>
            </div>
          )}
        </Content>

        <Drawer
          title="Node Configuration"
          placement="right"
          onClose={() => nodeForm.submit()}
          open={isDrawerOpen}
          width={window.innerWidth > 768 ? '45%' : '80%'}
          styles={{
            body: {
              paddingTop: 12,
              paddingBottom: 60,
            },
          }}>
          <NodeForm form={nodeForm} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen} />
        </Drawer>

        <Modal
          title={modalTitle}
          open={isNextStepOpen}
          onCancel={() => {
            setIsNextStepOpen(false);
            setNextStepCtx(null);
          }}
          footer={null}>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {availableNextTypes.map(([type, config]) => (
              <Card
                key={type}
                onClick={() => addNextNode(type as NodeTypeString)}
                style={{
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginBottom: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <span style={{ fontSize: 20 }}>{config.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{config.data.form?.name || type}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{config.data.form?.description || ''}</div>
                </div>
              </Card>
            ))}
            {availableNextTypes.length === 0 && <div style={{ color: '#999' }}>No compatible nodes</div>}
          </div>
        </Modal>
      </Layout>
    </FlowEditorContext.Provider>
  );
};

export default memo(FlowEditor);
