import React from "react";
import { FlowNode } from "../../../models/flowTypes";
import BeginNodeForm from "./begin-node-form";
import InterfaceNodeForm from "./Interface-node-form";
import GenerateNodeForm from "./generate-node-form";
import CategorizeNodeForm from "./categorize-node-form";
import RetrievalNodeForm from "./retrieval-node-form";
import DecisionNodeForm from "./decision-node-form";
import KeywordsNodeForm from "./keywords-node-form";

interface NodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NodeForm: React.FC<NodeFormProps> = (props) => {
  const { selectedNode } = props;

  if (!selectedNode) return null;

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
    case "keywords":
      return <KeywordsNodeForm {...props} selectedNode={selectedNode} />;
    default:
      return null;
  }
};

export default NodeForm;
