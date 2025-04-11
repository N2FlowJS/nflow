import React from "react";
import { Form, Input, Select } from "antd";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";

interface GenerateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GenerateNodeForm: React.FC<GenerateNodeFormProps> = (props) => {
    
  return (
    <BaseNodeForm {...props}>
      <Form.Item name="model" label="Model">
        <Select placeholder="Select a model">
          <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
          <Select.Option value="gpt-4">GPT-4</Select.Option>
          <Select.Option value="claude-2">Claude 2</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="prompt" label="Prompt Template">
        <Input.TextArea rows={10} placeholder="Enter prompt template..." />
      </Form.Item>
    </BaseNodeForm>
  );
};

export default GenerateNodeForm;
