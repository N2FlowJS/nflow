import { CommentOutlined, SaveOutlined, ToolOutlined } from "@ant-design/icons";
import {
  addEdge,
  Background,
  Connection,
  ConnectionLineType,
  ControlButton,
  Controls,
  EdgeTypes,
  IsValidConnection,
  MarkerType,
  ReactFlow,
  NodeTypes as ReactFlowNodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Drawer, Form, message } from "antd";
import React, { useCallback, useState } from "react";

import { saveFlowConfig } from "../../../services/agentService";
import NodeForm from "../forms/node-form";
import NodePalette from "./node-palette";

import { CategorizeForm, DecisionForm, FlowNode, NodeTypeString } from "../../../models/flowTypes";
import { isConnectionAllowed, NODE_REGISTRY, parseFlowConfig } from "../../../utils/client";
import { useTheme } from "../../../theme";
import CustomEdge from "../edges/CustomEdge";
import BeginNode from "../nodes/begin-node";
import CategorizeNode from "../nodes/categorize-node";
import DecisionNode from "../nodes/decision-node";
import GenerateNode from "../nodes/generate-node";
import InterfaceNode from "../nodes/interface-node";
import RetrievalNode from "../nodes/retrieval-node";

const nodeTypes: ReactFlowNodeTypes = {
  begin: BeginNode,
  interface: InterfaceNode,
  generate: GenerateNode,
  categorize: CategorizeNode,
  retrieval: RetrievalNode,
  decision: DecisionNode,
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
}

const FlowEditor: React.FC<FlowEditorProps> = ({
  flowConfig,
  onStartConversation,
  agentId,
}) => {
  const { theme } = useTheme();
  const initialFlow = parseFlowConfig(flowConfig);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nodeForm] = Form.useForm();
  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  React.useEffect(() => {
    // This effect removes any edges connected to nodes that have been deleted
    const nodeIds = nodes.map((node) => node.id);
    setEdges((edges) =>
      edges.filter(
        (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
      )
    );
  }, [nodes, setEdges]);

  // Handle edge deletion
  const onEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const saveFlow = async () => {
    if (!agentId) {
      message.error("Agent ID is missing");
      return;
    }

    try {
      const flow = { nodes, edges };
      await saveFlowConfig(agentId, JSON.stringify(flow));
      message.success("Flow saved successfully");
    } catch (error: unknown) {
      console.error("Error saving flow:", error);
      message.error("Failed to save flow");
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;

        if (isConnectionAllowed(sourceType, targetType)) {
          // Handle decision node connections
          if (sourceType === "decision") {
            // We'll let the form's syncEdgesWithBranches handle the edge creation
            // Just update the node data
            const branchName = params.sourceHandle?.startsWith("out-")
              ? params.sourceHandle.substring(4)
              : "";

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source) {
                  const form: DecisionForm = { ...n.data.form } as DecisionForm;

                  if (params.sourceHandle === "out-default") {
                    form.defaultTarget = params.target;
                  } else {
                    form.branches = form.branches.map((branch: any) =>
                      branch.name === branchName
                        ? { ...branch, targetNode: params.target }
                        : branch
                    );
                  }

                  return {
                    ...n,
                    data: {
                      ...n.data,
                      form
                    }
                  } as FlowNode;
                }
                return n;
              })
            );
          }
          // Update the targetNode for categorize nodes
          if (sourceType === "categorize" && params.sourceHandle) {
            // Extract category name from the sourceHandle (assuming format "out-categoryName")
            const categoryName = params.sourceHandle.startsWith("out-")
              ? params.sourceHandle.substring(4)
              : params.sourceHandle;

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source && n.type === "categorize") {
                  const form = n.data.form as CategorizeForm;
                  if (!form.categories) return n;

                  return {
                    ...n,
                    data: {
                      ...n.data,
                      form: {
                        ...form,
                        categories: form.categories.map((c) =>
                          c.name === categoryName
                            ? { ...c, targetNode: params.target }
                            : c
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
                type: "default",
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              },
              eds
            )
          );
        } else {
          message.error(
            `Cannot connect ${sourceType} node to ${targetType} node`
          );
        }
      }
    },
    [nodes, setEdges, setNodes]
  );

  // Update to match the expected IsValidConnection type
  const isValidConnection: IsValidConnection = useCallback(
    (params) => {
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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData(
        "nflow.application.reactflow"
      ) as NodeTypeString;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultData = NODE_REGISTRY[nodeType].data as any;

      const form = defaultData.form || {};
      const baseName = form.name || nodeType; // Use default form name or node type as base
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
      // Đóng Drawer NodePalette sau khi kéo thả thành công
      setIsPaletteOpen(false);
    },
    [screenToFlowPosition, setNodes, nodes] // Add nodes to dependency array
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      setSelectedNode(node);
      setIsDrawerOpen(true);
    },
    [setSelectedNode, setIsDrawerOpen]
  );

  // Add onDelete handler to all existing edges
  React.useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        data: { ...edge.data, onDelete: onEdgeDelete },
      }))
    );
  }, [onEdgeDelete, setEdges]);

  return (
    <div style={{ height: "100%", width: "100%" }}>


      <Drawer
        title="Node Palette"
        placement="left"
        onClose={() => setIsPaletteOpen(false)}
        open={isPaletteOpen}
        width={window.innerWidth > 768 ? '22%' : "60%"}
        styles={{
          body: {
            paddingTop: 12,
            paddingBottom: 12,
          },
        }}
        mask={false}
        maskClosable={false}
        closable={true}
        keyboard={true}
        push={true} // Nếu muốn Drawer dạng push, bỏ comment dòng này (nếu AntD hỗ trợ)
      >
        <NodePalette nodes={nodes} />
      </Drawer>

      <ReactFlow

        colorMode={theme}
        nodes={nodes}
        title=""
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "default",
          data: {
            onDelete: onEdgeDelete,
          },
        }}
      >
        <Controls
          orientation="horizontal"
          position="top-left"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        >
          <ControlButton onClick={saveFlow}>
            <SaveOutlined
            />
          </ControlButton>
          <ControlButton onClick={onStartConversation}>
            <CommentOutlined />
          </ControlButton>
          <ControlButton onClick={() => setIsPaletteOpen(true)}>
            <ToolOutlined />
          </ControlButton>
        </Controls>
        <Background />

      </ReactFlow>

      <Drawer
        title="Node Configuration"
        placement="right"
        onClose={() => nodeForm.submit()} // Changed this line
        open={isDrawerOpen}
        width={window.innerWidth > 768 ? '45%' : "80%"}
        styles={{
          body: {
            paddingTop: 12,
            paddingBottom: 60, // Extra space for buttons at bottom
          },
        }}
      >
        <NodeForm
          form={nodeForm}
          selectedNode={selectedNode}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      </Drawer>


    </div>
  );
};

export default FlowEditor;
