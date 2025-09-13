import {
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { FlowNode } from "../../../models/flowTypes";
import { useReactFlow } from "@xyflow/react";
import { Button, Form, Input, Modal, Space, Typography } from "antd";
import React, { useEffect } from "react"; // Import useEffect
import { useLocale } from "../../../locale";
const { Text } = Typography
interface BaseNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  // setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>; // Remove setNodes prop
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  onSaveSuccess?: (values: any) => void; // Add onSaveSuccess callback
}

const BaseNodeForm: React.FC<BaseNodeFormProps> = ({
  form,
  selectedNode,
  // setNodes, // Remove setNodes from destructuring
  setIsDrawerOpen,
  children,
  onSaveSuccess, // Destructure onSaveSuccess
}) => {
  const { setNodes, deleteElements } = useReactFlow(); // Use the hook
  const { t } = useLocale('form.nodeForm');

  // Add useEffect to reset form fields when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      form.setFieldsValue(selectedNode.data.form || {});
    }
  }, [selectedNode, form]);

  const handleSave = (values: any) => {

    // Always perform the default save behavior
    setNodes((nds) =>
      nds.map((node: any) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, form: values } }
          : node
      )
    );
    setIsDrawerOpen(false);

    // Call the success callback if provided
    if (onSaveSuccess) {
      onSaveSuccess(values);
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: t('deleteNodeConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('deleteNodeConfirmContent'),
      okText: t('deleteButton'),
      okType: "danger",
      cancelText: t('cancel'),
      onOk() {
        deleteNodeAndEdges(); // Call the updated delete function
      },
    });
  };

  // Rename deleteNode to deleteNodeAndEdges and use deleteElements
  const deleteNodeAndEdges = () => {
    // Use deleteElements to remove the node and connected edges
    deleteElements({ nodes: [{ id: selectedNode.id }] });

    // Close the drawer
    setIsDrawerOpen(false);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      className="node-form"
    >
      <Text>{t('nodeIdLabel', { nodeId: selectedNode.id })}</Text>
      <Form.Item name="name" label={t('nameLabel')}>
        <Input placeholder={t('namePlaceholder')} />
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
          {t('deleteNodeButton')}
        </Button>

      </Space>
    </Form>
  );
};

export default BaseNodeForm;
