import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Select, Collapse, Typography, Alert, Space } from 'antd';
import {
  SettingOutlined,
  ApartmentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import BaseNodeForm from './base-node-form';
import { FlowNode } from '../../../models/flowTypes';
import RoleSelector from './shared/RoleSelector';
import InputReferences from './shared/InputReferences';
import { useRouter } from 'next/router';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { useReactFlow } from '@xyflow/react';

const { Text } = Typography;

interface AgentNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentNodeForm: React.FC<AgentNodeFormProps> = (props) => {
  const { selectedNode, form, setIsDrawerOpen } = props;
  const { setNodes, getNodes } = useReactFlow();

  const tools = Object.entries(NODE_REGISTRY)
    .filter(([type]) => type !== 'agent' && type !== 'subagent')
    .map(([type, config]) => ({
      id: type,
      name: config.data?.form?.name || type,
      type: config.type,
    }));

  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const router = useRouter();
  const currentAgentId = router.query.id as string;

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (currentAgentId) {
        params.append('excludeId', currentAgentId);
      }
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/agent${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch agents: ${response.status}`);
      const agentsData = await response.json();
      if (!Array.isArray(agentsData)) throw new Error('Invalid response format');
      const filteredAgents = agentsData.filter((agent: any) => agent.id !== currentAgentId);
      const formattedAgents = filteredAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name || 'Unnamed Agent',
      }));
      setAgents(formattedAgents);
    } catch (error) {
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [currentAgentId]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    // Use saved form data instead of spreading selectedNode.data
    const formData = selectedNode?.data?.form || {};
    form.setFieldsValue({
      form: {
        systemMessage: 'You are a helpful assistant.',
        ...formData,
      },
    });
  }, [form, selectedNode]);

  // Save changes, normalize payload, and create subagent nodes if needed
  const handleSave = (values: any) => {
    const formData = values?.form ?? values;

    // Update the agent node's data.form
    setNodes((nds) =>
      nds.map((node: any) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, form: formData } }
          : node
      )
    );
    setIsDrawerOpen(false);

    // Auto-create subagent nodes for selected delegationAgents if not present
    const agentIds: string[] = formData?.delegationAgents || [];
    if (agentIds.length > 0) {
      setNodes((currentNodes) => {
        const existingSubAgentIds = currentNodes
          .filter((n) => n.type === 'subagent')
          .map((n) => n?.data?.form?.agentId);

        const newNodes = agentIds
          .filter((id) => !existingSubAgentIds.includes(id))
          .map((id, idx) => {
            const agentMeta = agents.find((a) => a.id === id);
            return {
              id: `subagent_${id}_${Date.now()}_${idx}`,
              type: 'subagent',
              data: {
                type: 'subagent',
                form: {
                  agentId: id,
                  agentName: agentMeta?.name || '',
                  variables: {},
                  timeout: 300,
                  inheritContext: true,
                  name: 'Sub Agent',
                  description: 'Auto-created subagent',
                  output: '',
                  role: 'developer',
                  inputRefs: [],
                },
              },
              position: { x: 200, y: 200 + Math.random() * 200 },
            };
          });

        return newNodes.length ? [...currentNodes, ...newNodes] : currentNodes;
      });
    }
  };

  return (
    <BaseNodeForm
      form={form}
      selectedNode={selectedNode}
      setIsDrawerOpen={setIsDrawerOpen}
      onSaveSuccess={handleSave}
    >
      <Alert
        message="Agent (Dispatcher) Node"
        description="Acts as a central coordinator that can execute tools and delegate tasks to other agents based on the input."
        type="info"
        showIcon
        icon={<ApartmentOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['config', 'tools']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Agent Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name={['form', 'systemMessage']}
                  label="System Message"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please define the agent's role and instructions.",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="e.g., You are a helpful assistant."
                  />
                </Form.Item>
                <Form.Item name={['form', 'model']} label="LLM Model">
                  <Select placeholder="Select a model (coming soon)" disabled />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'tools',
            label: (
              <Text strong>
                <ToolOutlined style={{ marginRight: 8 }} />
                Tools & Delegation
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name={['form', 'delegationTools']}
                  label="Delegation Tools"
                  tooltip="Select tools this agent can call"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select tools"
                    optionLabelProp="label"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {tools.map((node) => (
                      <Select.Option
                        key={node.id}
                        value={node.id}
                        label={node.name}
                      >
                        <span>
                          {node.name}{' '}
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            (tool)
                          </Text>
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['form', 'delegationAgents']}
                  label="Delegation Agents"
                  tooltip="Select agents this agent can delegate to"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select agents"
                    optionLabelProp="label"
                    loading={loadingAgents}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // Removed value/onChange to let Form control this field
                  >
                    {agents.map((agent) => (
                      <Select.Option
                        key={agent.id}
                        value={agent.id}
                        label={agent.name}
                      >
                        <span>
                          {agent.name}{' '}
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            (agent)
                          </Text>
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default AgentNodeForm;
