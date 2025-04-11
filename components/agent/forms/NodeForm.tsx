import React from "react";
import { FlowNode } from "../types/flowTypes";
import BeginNodeForm from "./BeginNodeForm";
import InterfaceNodeForm from "./InterfaceNodeForm";
import GenerateNodeForm from "./GenerateNodeForm";
import CategorizeNodeForm from "./categorize-node-form";
import RetrievalNodeForm from "./RetrievalNodeForm";
import DecisionNodeForm from "./DecisionNodeForm";

interface NodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NodeForm: React.FC<NodeFormProps> = (props) => {
  const { selectedNode } = props;
  
  if (!selectedNode) return null;

  // Render the appropriate form based on node type
  switch (selectedNode.type) {
    case "begin":
      return <BeginNodeForm {...props} selectedNode={selectedNode} />;
    case "interface":
      return <InterfaceNodeForm {...props} selectedNode={selectedNode} />;
    case "generate":
      return <GenerateNodeForm {...props} selectedNode={selectedNode} />;
    case "categorize":
      return <CategorizeNodeForm {...props} selectedNode={selectedNode} />;
    case "retrieval":
      return <RetrievalNodeForm {...props} selectedNode={selectedNode} />;
    case "decision":
      return <DecisionNodeForm {...props} selectedNode={selectedNode} />;
    default:
      return null;
  }
};

export default NodeForm;
