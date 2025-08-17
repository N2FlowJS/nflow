import { TeamOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Collapse, Space, Typography, Alert, Select, Button } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useRouter } from 'next/router';

const { Text } = Typography;

interface SubAgentNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubAgentNodeForm: React.FC<SubAgentNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const currentAgentId = router.query.id as string;

  // Load user's agents using direct API call like AgentsList page
  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      // Get auth token from localStorage like AgentsList
      const token = localStorage.getItem('token');

      // Build query params for filtering (exclude current agent)
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

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }

      const agentsData = await response.json();

      if (!Array.isArray(agentsData)) {
        throw new Error('Invalid response format');
      }

      // Filter out the current agent to prevent circular references (backup filter)
      const filteredAgents = agentsData.filter((agent: any) => agent.id !== currentAgentId);

      const formattedAgents = filteredAgents.map((agent: any) => ({
        id: agent.id,
        name: agent.name || 'Unnamed Agent',
      }));

      setAgents(formattedAgents);
    } catch (error) {
      console.error('Failed to load user agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [currentAgentId]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Sub Agent Node"
        description="Execute another agent/flow as a sub-process and return its results to continue the current flow."
        type="info"
        showIcon
        icon={<TeamOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['agent', 'config', 'variables']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'agent',
            label: (
              <Text strong>
                <TeamOutlined style={{ marginRight: 8 }} />
                Agent Selection
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="agentId"
                  label="Target Agent"
                  rules={[{ required: true, message: 'Please select an agent' }]}>
                  <Select
                    placeholder="Select an agent to execute"
                    loading={loading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(_value, option: any) => {
                      props.form.setFieldsValue({
                        agentName: option?.children || '',
                      });
                    }}>
                    {agents.map((agent) => (
                      <Select.Option key={agent.id} value={agent.id}>
                        {agent.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="agentName" label="Agent Name" help="Display name for the selected agent">
                  <Input placeholder="Agent display name" disabled />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Execution Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="timeout"
                  label="Execution Timeout (seconds)"
                  help="Maximum time to wait for sub-agent execution"
                  initialValue={300}>
                  <InputNumber min={30} max={1800} style={{ width: '100%' }} placeholder="300" />
                </Form.Item>

                <Form.Item
                  name="inheritContext"
                  label="Inherit Context"
                  help="Whether the sub-agent should inherit conversation context from the current flow"
                  valuePropName="checked"
                  initialValue={true}>
                  <Switch />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'variables',
            label: (
              <Text strong>
                <LinkOutlined style={{ marginRight: 8 }} />
                Variable Mapping
              </Text>
            ),
            children: (
              <div>
                <Alert
                  message="Variable Mapping"
                  description="Map variables from the current flow to the sub-agent. Use ${variableName} syntax to reference variables from previous nodes."
                  type="info"
                  style={{ marginBottom: 16 }}
                />

                <Form.List name="variableMappings">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: 'Missing variable name' }]}>
                            <Input placeholder="Variable name" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Missing variable value' }]}>
                            <Input placeholder="Value or ${reference}" />
                          </Form.Item>
                          <Button type="link" onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Variable Mapping
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default SubAgentNodeForm;
