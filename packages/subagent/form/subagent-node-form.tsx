import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React, { useState, useEffect, useCallback } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useRouter } from 'next/router';

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

  const agentOptions = agents.map(agent => ({
    label: agent.name,
    value: agent.id
  }));

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Sub Agent Node</div>
        <div>Execute another agent/flow as a sub-process and return its results to continue the current flow.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Agent Selection
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="agentId"
            label="Target Agent"
            required
            options={agentOptions}
            placeholder={loading ? "Loading agents..." : "Select an agent to execute"}
          />
          <TextInputField
            name="agentName"
            label="Agent Name"
            placeholder="Agent display name (auto-filled)"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Execution Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="timeout"
            label="Execution Timeout (seconds)"
            placeholder="300"
          />
          <DropdownField
            name="inheritContext"
            label="Inherit Context"
            options={[
              { label: 'Inherit conversation context', value: 'true' },
              { label: 'Start with clean context', value: 'false' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Variable Mapping
        </div>
        <div style={{ padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Variable Mapping</div>
          <div>Map variables from the current flow to the sub-agent. Use ${`{variableName}`} syntax to reference variables from previous nodes.</div>
        </div>
        <TextAreaField
          name="variableMappings"
          label="Variable Mappings (JSON)"
          rows={6}
          placeholder={`[
  {"key": "userName", "value": "\${userName}"},
  {"key": "orderId", "value": "\${orderId}"}
]`}
        />
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default SubAgentNodeForm;
