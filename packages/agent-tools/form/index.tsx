import React, { useMemo } from 'react';
import { Form, Select, Space, Typography, Alert } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import BaseNodeForm from '../../@flow/form';
import { FlowNode } from '../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { useReactFlow } from '@xyflow/react';

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

  const { setNodes } = useReactFlow<FlowNode>();

  const handleSave = (values: any) => {
    // values already equals submitted form (BaseNodeForm passes 'values')
    const toolIds: string[] = values?.toolIds || form.getFieldValue(['form', 'toolIds']) || [];

    // Persist toolIds to this AgentTools node (because BaseNodeForm saved entire values directly under form root, adjust if needed)
    setNodes((nds: any[]) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                form: {
                  ...(n as any).data?.form,
                  toolIds,
                },
              },
            }
          : n
      )
    );

    // Attempt to derive agent id from node id pattern agenttools_{agentId}
    const toolsNodeId = selectedNode.id;
    let agentId: string | null = null;
    if (toolsNodeId.startsWith('agenttools_')) {
      agentId = toolsNodeId.substring('agenttools_'.length);
    }

    // Fallback: find an incoming edge source (agent) if pattern not matched
  // If pattern not matched we skip sync for now (could enhance with edge scan)

    if (agentId) {
      setNodes((nds: any[]) =>
        nds.map((n) =>
          n.id === agentId
            ? {
                ...n,
                data: {
                  ...n.data,
                  form: {
                    ...(n as any).data?.form,
                    delegationTools: toolIds,
                  },
                },
              }
            : n
        )
      );
    }

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
