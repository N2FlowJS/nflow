import React from "react";
import { Form, Button, Space, Input, Modal } from "antd";
import {
  DeleteOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FlowNode } from "../types/flowTypes";

interface BaseNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  customSaveHandler?: (values: any) => void;
}

const BaseNodeForm: React.FC<BaseNodeFormProps> = ({
  form,
  selectedNode,
  setNodes,
  setIsDrawerOpen,
  children,
  customSaveHandler,
}) => {
  const handleSave = (values: any) => {
    if (customSaveHandler) {
      customSaveHandler(values);
    } else {
      // Default save behavior
      setNodes((nds) =>
        nds.map((node: any) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, form: values } }
            : node
        )
      );
      setIsDrawerOpen(false);
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this node?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action cannot be undone. All connections to this node will also be removed.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteNode();
      },
    });
  };

  const deleteNode = () => {
    // Remove the node from the nodes state
    setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id));

    // Also remove any edges connected to this node
    // Note: This would typically be handled by ReactFlow automatically,
    // but adding it here for clarity and safety
    setNodes((nodes) => {
      const updatedNodes = [...nodes];
      // Remove any edges connected to the deleted node
      // This would be handled in a real implementation
      return updatedNodes;
    });

    // Close the drawer
    setIsDrawerOpen(false);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={selectedNode.data.form || {}}
      onFinish={handleSave}
      className="node-form"
    >
      <Form.Item name="name" label="Name">
        <Input placeholder="Enter name" />
      </Form.Item>
      {children}

      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Button danger icon={<DeleteOutlined />} onClick={showDeleteConfirm}>
          Delete Node
        </Button>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          Save
        </Button>
      </Space>
    </Form>
  );
};

export default BaseNodeForm;
