import React, { useMemo } from 'react';
import { Form, Select, Space, Typography, Alert } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import BaseNodeForm from './base-node-form';
import { FlowNode } from '../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';

interface AgentToolsNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const { Text } = Typography;

const AgentToolsNodeForm: React.FC<AgentToolsNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const tools = useMemo(
    () =>
      Object.entries(NODE_REGISTRY)
        .filter(([type]) => type !== 'agent' && type !== 'subagent')
        .map(([type, config]) => ({
          id: type,
          name: (config as any)?.data?.form?.name || (config as any)?.name || type,
        })),
    []
  );

  const handleSave = () => {
    setIsDrawerOpen(false);
  };

  return (
    <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen} onSaveSuccess={handleSave}>
      <Alert
        message="Agent Tools Node"
        description="Display and manage the list of tools associated with an agent."
        type="info"
        showIcon
        icon={<ToolOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item name={['form', 'toolIds']} label="Tools" tooltip="Select tools to display">
          <Select
            mode="multiple"
            placeholder="Select tools"
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
          >
            {tools.map((t) => (
              <Select.Option key={t.id} value={t.id} label={t.name}>
                <span>
                  {t.name}
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                    (tool)
                  </Text>
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Space>
    </BaseNodeForm>
  );
};

export default AgentToolsNodeForm;
