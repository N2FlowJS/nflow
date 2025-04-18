import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  ConnectionLineType,
  Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
  NodeTypes as ReactFlowNodeTypes,
  Edge,
  EdgeTypes,
  IsValidConnection,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Drawer, Form, Space, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";

import { parseFlowConfig, isConnectionAllowed } from "../util";
import { NODE_REGISTRY } from "../util";
import { saveFlowConfig } from "../../../services/agentService";
import NodePalette from "./NodePalette";
import NodeForm from "../forms/NodeForm";

import BeginNode from "../nodes/begin-node";
import InterfaceNode from "../nodes/interface-node";
import GenerateNode from "../nodes/generate-node";
import CategorizeNode from "../nodes/categorize-node";
import RetrievalNode from "../nodes/retrieval-node";
import DecisionNode from "../nodes/decision-node";
import CustomEdge from "../edges/CustomEdge";
import { FlowNode, NodeTypeString } from "../types/flowTypes";

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

  // Watch for node deletions and remove connected edges
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

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;

        // Check if connection is allowed based on node types
        if (isConnectionAllowed(sourceType, targetType)) {
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
    [nodes, setEdges]
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

      const newNode: FlowNode = {
        id: `node_${Date.now()}`,
        type: nodeType,
        data: NODE_REGISTRY[nodeType].defaultData as any,
        position,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
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
      <NodePalette />
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
        onClose={() => setIsDrawerOpen(false)}
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
          setNodes={setNodes}
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
