import React from "react";
import { Form, Input } from "antd";

interface KnowledgeDetailFormProps {
  form: any;
}

const KnowledgeDetailForm: React.FC<KnowledgeDetailFormProps> = ({
  form,
}) => {
  return (
    <Form form={form} layout="vertical" >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter a name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[
          { required: true, message: "Please enter a description" },
        ]}
      >
        <Input.TextArea rows={6} />
      </Form.Item>
    </Form>
  );
};

export default KnowledgeDetailForm;
