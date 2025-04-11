import React from "react";
import { Form, Input } from "antd";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";

interface DecisionNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DecisionNodeForm: React.FC<DecisionNodeFormProps> = (props) => {
  return (
    <BaseNodeForm {...props}>
      <Form.Item name="condition" label="Condition">
        <Input.TextArea rows={4} placeholder="Enter decision condition..." />
      </Form.Item>
    </BaseNodeForm>
  );
};

export default DecisionNodeForm;
