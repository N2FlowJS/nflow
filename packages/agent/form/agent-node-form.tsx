import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Form, Input, Select, Collapse, Typography, Alert, Space } from 'antd';
import {
  SettingOutlined,
  ApartmentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import BaseNodeForm from '../../../components/agent/forms/base-node-form';
import { FlowNode } from '../../../models/flowTypes';
import { useRouter } from 'next/router';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { Edge, MarkerType, Position, useReactFlow } from '@xyflow/react';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface AgentNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentNodeForm: React.FC<AgentNodeFormProps> = (props) => {
  const { selectedNode, form, setIsDrawerOpen } = props;
  const { setNodes, getNodes, setEdges, getEdges } = useReactFlow<FlowNode, Edge>();

  const tools = useMemo(
    () =>
      Object.entries(NODE_REGISTRY)
        .filter(([type]) => type !== 'agent' && type !== 'subagent')
        .map(([type, config]) => ({
          id: type,
          name: config.data?.form?.name || type,
          type: config.type,
        })),
    []
  );

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
      const nodesSnapshot = getNodes();
      const edgesSnapshot = getEdges?.() ?? [];

      const existingSubAgentNodes = nodesSnapshot.filter(
        (n) => n.type === 'subagent' && agentIds.includes((n as any)?.data?.form?.agentId)
      );
      const existingSubAgentIds = existingSubAgentNodes.map((n) => (n as any)?.data?.form?.agentId);

      const agentNode = nodesSnapshot.find((n) => n.id === selectedNode.id);
      const baseX = agentNode?.position?.x ?? selectedNode.position?.x ?? 200;
      const baseY = agentNode?.position?.y ?? selectedNode.position?.y ?? 200;

      // Prepare new SubAgent nodes directly below the Agent
      const newSubAgentNodes: FlowNode[] = agentIds
        .filter((id) => !existingSubAgentIds.includes(id))
        .map((id, idx) => {
          const agentMeta = agents.find((a) => a.id === id);
          const nodeId = `subagent_${id}_${Date.now()}_${idx}`;
          const nodeLabel = agentMeta?.name || 'Sub Agent';
          const nodePosition = { x: baseX, y: baseY + 220 + idx * 120 };
          return {
            id: nodeId,
            type: 'subagent',
            data: {
              id: nodeId,
              label: nodeLabel,
              position: nodePosition,
              type: 'subagent',
              form: {
                agentId: id,
                agentName: agentMeta?.name || '',
                variables: {},
                timeout: 300,
                inheritContext: true,
                name: nodeLabel,
                description: 'Auto-created subagent',
                output: '',
                role: 'developer',
                inputRefs: [],
              },
            },
            position: nodePosition,
          } as FlowNode;
        });

      const allTargetNodes: FlowNode[] = [...existingSubAgentNodes, ...newSubAgentNodes];

      if (newSubAgentNodes.length) {
        // Append new nodes first
        setNodes((current) => [...current, ...newSubAgentNodes]);
      }

      // Create edges Agent -> each SubAgent (use the first bottom handle of Agent, and top handle of SubAgent)
      const sourceHandleId = `out-${Position.Bottom}-0`; // out-bottom-0
      const targetHandleId = `in-${Position.Top}-0`; // in-top-0
      const existingEdgeIds = new Set(edgesSnapshot.map((e: any) => e.id));
      const newEdges: Edge[] = allTargetNodes.map((n) => ({
        id: `edge-${selectedNode.id}-to-${n.id}`,
        source: selectedNode.id,
        target: n.id,
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
      }));

      setEdges((current) => {
        const next = [...current];
        newEdges.forEach((e) => {
          if (!existingEdgeIds.has(e.id)) next.push(e);
        });
        return next;
      });
    }

  // Auto-create (or update) an AgentTools node for selected delegationTools, keep both in sync
  const toolIds: string[] = Array.isArray(formData?.delegationTools) ? formData.delegationTools : [];
    if (toolIds.length > 0) {
      const nodesSnapshot = getNodes();
      const edgesSnapshot = getEdges?.() ?? [];

      const agentNode = nodesSnapshot.find((n) => n.id === selectedNode.id);
      const baseX = agentNode?.position?.x ?? selectedNode.position?.x ?? 200;
      const baseY = agentNode?.position?.y ?? selectedNode.position?.y ?? 200;

      const toolsNodeId = `agenttools_${selectedNode.id}`;
      const existingToolsNode = nodesSnapshot.find((n) => n.id === toolsNodeId);
      const toolsNodePosition = { x: baseX + 300, y: baseY + 220 };

      if (existingToolsNode) {
        // Update toolIds on existing AgentTools node AND reflect back into Agent node delegationTools to keep consistent
        setNodes((nds) =>
          nds.map((n: any) => {
            if (n.id === toolsNodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  form: {
                    ...(n as any).data?.form,
                    name: (n as any).data?.form?.name || 'Agent Tools',
                    toolIds,
                  },
                },
              };
            }
            if (n.id === selectedNode.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  form: {
                    ...(n as any).data?.form,
                    delegationTools: toolIds,
                  },
                },
              };
            }
            return n;
          })
        );
      } else {
        // Create a new AgentTools node
        const newToolsNode: FlowNode = {
          id: toolsNodeId,
          type: 'agenttools',
          data: {
            id: toolsNodeId,
            label: 'Agent Tools',
            position: toolsNodePosition,
            type: 'agenttools',
            form: {
              role: 'developer',
              name: 'Agent Tools',
              description: 'Display and manage tools associated with an agent',
              toolIds,
              inputRefs: [],
              output: '',
            },
          },
          position: toolsNodePosition,
        } as FlowNode;

        setNodes((current) => [...current, newToolsNode]);
      }

      // Connect Agent -> AgentTools (use second bottom handle index 1, and tools top handle)
      const sourceHandleId = `out-${Position.Bottom}-1`;
      const targetHandleId = `in-${Position.Top}-0`;
      const edgeId = `edge-${selectedNode.id}-to-${toolsNodeId}`;
      const existingEdgeIds = new Set(edgesSnapshot.map((e: any) => e.id));
      const newEdge: Edge = {
        id: edgeId,
        source: selectedNode.id,
        target: toolsNodeId,
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((current) => (existingEdgeIds.has(edgeId) ? current : [...current, newEdge]));
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
