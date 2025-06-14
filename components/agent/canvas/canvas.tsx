import { CommentOutlined, SaveOutlined } from '@ant-design/icons';
import {
  addEdge,
  Background,
  Connection,
  ConnectionLineType,
  ControlButton,
  Controls,
  EdgeTypes,
  MarkerType,
  ReactFlow,
  NodeTypes as ReactFlowNodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Edge, // Import Edge type
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Drawer, Form, Layout, message } from 'antd';
import React, { memo, useCallback, useEffect, useState } from 'react';

import { saveFlowConfig } from '../../../services/agentService';
import NodeForm from '../forms/node-form';
import NodePalette from './node-palette';

import { useFlowState } from '../../../context/FlowStateContext';
import { CategorizeForm, DecisionForm, FlowNode, NodeTypeString } from '../../../models/flowTypes';
import { conversationService } from '../../../services/conversationService';
import { useTheme } from '../../../theme';
import CustomEdge from '../edges/CustomEdge';
import BeginNode from '../nodes/begin-node';
import CategorizeNode from '../nodes/categorize-node';
import DecisionNode from '../nodes/decision-node';
import GenerateNode from '../nodes/generate-node';
import InterfaceNode from '../nodes/interface-node';
import RetrievalNode from '../nodes/retrieval-node';
import KeywordsNode from '../nodes/keywords-node';
import ExecMysqlNode from '../nodes/execmysql-node';
import ExecMssqlNode from '../nodes/execmssql-node';
import SubAgentNode from '../nodes/subagent-node';
import SendMailNode from '../nodes/sendmail-node';
import GoogleSearchNode from '../nodes/googlesearch-node';
import WikipediaSearchNode from '../nodes/wikipediasearch-node';
import RewriteNode from '../nodes/rewrite-node';
import HttpRequestNode from '../nodes/httprequest-node';
import ValidateNode from '../nodes/validate-node';
import ConditionNode from '../nodes/condition-node'; // Import ConditionNode
import TextProcessNode from '../nodes/textprocess-node';
import TransformNode from '../nodes/transform-node';
import FileReadNode from '../nodes/fileread-node';
import FileWriteNode from '../nodes/filewrite-node';
import DelayNode from '../nodes/delay-node';
import JsonParseNode from '../nodes/jsonparse-node';
import MattermostNode from '../nodes/mattermost-node';
import SlackNode from '../nodes/slack-node';
import JiraNode from '../nodes/jira-node';
import GitLabNode from '../nodes/gitlab-node';
import ConfluenceNode from '../nodes/confluence-node';
import GitHubNode from '../nodes/github-node';
import FacebookNode from '../nodes/facebook-node';

import { isConnectionAllowed } from '../../../utils/client/connectionRules';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { parseFlowConfig } from '../../../utils/server/parseFlowConfig';

const nodeTypes: ReactFlowNodeTypes = {
  begin: BeginNode,
  interface: InterfaceNode,
  generate: GenerateNode,
  categorize: CategorizeNode,
  retrieval: RetrievalNode,
  decision: DecisionNode,
  keywords: KeywordsNode,
  execmysql: ExecMysqlNode,
  execmssql: ExecMssqlNode,
  subagent: SubAgentNode,
  sendmail: SendMailNode,
  googlesearch: GoogleSearchNode,
  wikipediasearch: WikipediaSearchNode,
  rewrite: RewriteNode,
  httprequest: HttpRequestNode,
  validate: ValidateNode,
  condition: ConditionNode,
  textprocess: TextProcessNode,
  transform: TransformNode,
  fileread: FileReadNode,
  filewrite: FileWriteNode,
  delay: DelayNode,
  jsonparse: JsonParseNode,
  mattermost: MattermostNode,
  slack: SlackNode,
  jira: JiraNode,
  gitlab: GitLabNode,
  confluence: ConfluenceNode,
  github: GitHubNode,
  facebook: FacebookNode,
};

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

const useConversationStateLoader = (activeConversationId: string | undefined, setFlowState: (state: any) => void) => {
  useEffect(() => {
    const loadConversationState = async () => {
      if (activeConversationId) {
        const conversation = await conversationService.getConversation(activeConversationId);
        console.log({ conversation });

        if (conversation && conversation.flowState) {
          setFlowState(conversation.flowState);
        } else {
          setFlowState(null);
        }
      } else {
        setFlowState(null);
      }
    };
    loadConversationState();
  }, [activeConversationId, setFlowState]);
};

const useEdgeCleanup = (nodes: FlowNode[], setEdges: React.Dispatch<React.SetStateAction<any[]>>) => {
  React.useEffect(() => {
    const nodeIds = nodes.map((node) => node.id);
    setEdges((edges) => edges.filter((edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)));
  }, [nodes, setEdges]);
};

const useEdgeDeletion = (setEdges: React.Dispatch<React.SetStateAction<any[]>>) => {
  return useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );
};

const useNodeConnection = (
  nodes: FlowNode[],
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<any[]>>
) => {
  return useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;

        if (isConnectionAllowed(sourceType, targetType)) {
          if (sourceType === 'decision') {
            const branchName = params.sourceHandle?.startsWith('out-') ? params.sourceHandle.substring(4) : '';

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source) {
                  const form: DecisionForm = { ...n.data.form } as DecisionForm;

                  if (params.sourceHandle === 'out-default') {
                    form.defaultTarget = params.target;
                  } else {
                    form.branches = form.branches.map((branch: any) =>
                      branch.name === branchName ? { ...branch, targetNode: params.target } : branch
                    );
                  }

                  return {
                    ...n,
                    data: {
                      ...n.data,
                      form,
                    },
                  } as FlowNode;
                }
                return n;
              })
            );
          }
          if (sourceType === 'categorize' && params.sourceHandle) {
            const categoryName = params.sourceHandle.startsWith('out-')
              ? params.sourceHandle.substring(4)
              : params.sourceHandle;

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source && n.type === 'categorize') {
                  const form = n.data.form as CategorizeForm;
                  if (!form.categories) return n;

                  return {
                    ...n,
                    data: {
                      ...n.data,
                      form: {
                        ...form,
                        categories: form.categories.map((c) =>
                          c.name === categoryName ? { ...c, targetNode: params.target } : c
                        ),
                      },
                    },
                  } as FlowNode;
                }
                return n;
              })
            );
          }

          setEdges((eds) =>
            addEdge(
              {
                ...params,
                type: 'default',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              },
              eds
            )
          );
        } else {
          message.error(`Cannot connect ${sourceType} node to ${targetType} node`);
        }
      }
    },
    [nodes, setEdges, setNodes]
  );
};

const useFlowSaver = (agentId: string | undefined, nodes: FlowNode[], edges: any[]) => {
  return async () => {
    if (!agentId) {
      message.error('Agent ID is missing');
      return;
    }
    try {
      const flow = { nodes, edges };
      await saveFlowConfig(agentId, flow);
      message.success('Flow saved successfully');
    } catch (error: unknown) {
      console.error('Error saving flow:', error);
      message.error('Failed to save flow');
    }
  };
};

const useValidConnection = (nodes: FlowNode[]) => {
  return useCallback(
    (params: Connection | Edge) => {
      // Changed Connection to Connection | Edge
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;
        return isConnectionAllowed(sourceType, targetType);
      }

      return false;
    },
    [nodes]
  );
};

const useNodeDropper = (
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>,
  nodes: FlowNode[]
) => {
  return useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('nflow.application.reactflow') as NodeTypeString;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultData = NODE_REGISTRY[nodeType].data as any;

      const form = defaultData.form || {};
      const baseName = form.name || nodeType;
      let newName = baseName;
      let counter = 1;

      while (nodes.some((node) => node.data.form?.name === newName)) {
        newName = `${baseName}_${counter}`;
        counter++;
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
        position,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, nodes]
  );
};

const useDragOverHandler = () => {
  return useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
};

const useNodeClickHandler = (
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNode | null>>,
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      setSelectedNode(node);
      setIsDrawerOpen(true);
    },
    [setSelectedNode, setIsDrawerOpen]
  );
};

const FlowEditor: React.FC<FlowEditorProps> = ({ flowConfig, onStartConversation, agentId, activeConversationId }) => {
  const { theme } = useTheme();
  const initialFlow = parseFlowConfig(flowConfig);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nodeForm] = Form.useForm();
  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  const { setFlowState } = useFlowState();

  useConversationStateLoader(activeConversationId, setFlowState);
  useEdgeCleanup(nodes, setEdges);

  const onEdgeDelete = useEdgeDeletion(setEdges);
  const onConnect = useNodeConnection(nodes, setNodes, setEdges);
  const handleSaveFlow = useFlowSaver(agentId, nodes, edges);
  const isValidConnection = useValidConnection(nodes);
  const onDrop = useNodeDropper(screenToFlowPosition, setNodes, nodes);
  const onDragOver = useDragOverHandler();
  const onNodeClick = useNodeClickHandler(setSelectedNode, setIsDrawerOpen);

  React.useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        data: { ...edge.data, onDelete: onEdgeDelete },
      }))
    );
  }, [onEdgeDelete, setEdges]);

  return (
    <Layout style={{ height: '100%', position: 'relative' }}>
      <NodePalette
        hasBeginNode={nodes.some((node) => node.type === 'begin')}
        isCollapsed={isPaletteCollapsed}
        onCollapsedChange={setIsPaletteCollapsed}
      />

      <Content
        style={{
          marginLeft: isPaletteCollapsed ? 50 : 250,
          transition: 'margin-left 0.2s',
          height: '100%',
          position: 'relative',
        }}>
        <ReactFlow
          colorMode={theme}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
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
          }}
          // end Marker for edges
        >
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
    </Layout>
  );
};

export default memo(FlowEditor);
