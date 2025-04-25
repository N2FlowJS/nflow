import { SaveOutlined } from "@ant-design/icons";
import {
  addEdge,
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  EdgeTypes,
  IsValidConnection,
  MarkerType,
  MiniMap,
  ReactFlow,
  NodeTypes as ReactFlowNodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Drawer, Form, message } from "antd";
import React, { useCallback, useState } from "react";

import { saveFlowConfig } from "@services/agentService";
import NodeForm from "../forms/node-form";
import NodePalette from "./node-palette";

import { CategorizeForm, FlowNode, NodeTypeString } from "@models/flowTypes";
import { isConnectionAllowed, NODE_REGISTRY, parseFlowConfig } from "@utils/client";
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
  floating: CustomEdge, // Add floating edge type
};

interface FlowEditorProps {
  flowConfig: string;
  readOnly?: boolean;
  agentId?: string;
}

const FlowEditor: React.FC<FlowEditorProps> = ({
  flowConfig,
  readOnly = false,
  agentId,
}) => {
  const initialFlow = parseFlowConfig(flowConfig);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nodeForm] = Form.useForm();
  const { screenToFlowPosition } = useReactFlow();




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
    } catch (error) {
      console.error("Error saving flow:", error);
      message.error("Failed to save flow");
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      // Find source and target nodes to check their types
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);
      console.log(params);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;

        // Check if connection is allowed based on node types
        if (isConnectionAllowed(sourceType, targetType)) {
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
          // Show error message for invalid connection
          message.error(
            `Cannot connect ${sourceType} node to ${targetType} node`
          );
        }
      }
    },
    [nodes, setEdges, setNodes]  // Added setNodes to dependencies
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
      let baseName = form.name || nodeType; // Use default form name or node type as base
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
    <div style={{ height: "80vh", width: "100%", position: "relative" }}>
      <NodePalette nodes={nodes} />
      <ReactFlow
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          data: {
            onDelete: onEdgeDelete,
          },
        }}
        style={{ background: "#f0f2f5" }}
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={4} />
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

      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={saveFlow}
          disabled={readOnly}
        >
          Save Flow
        </Button>
      </div>
    </div>
  );
};

export default FlowEditor;
