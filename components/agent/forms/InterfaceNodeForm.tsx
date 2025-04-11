import React from "react";
import { Form, Input } from "antd";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";

interface InterfaceNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InterfaceNodeForm: React.FC<InterfaceNodeFormProps> = (props) => {
  return <BaseNodeForm {...props}></BaseNodeForm>;
};

export default InterfaceNodeForm;
