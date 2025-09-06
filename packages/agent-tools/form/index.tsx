import React from 'react';
import { Space, Alert } from 'antd';
import InputField from '../../@input/InputField';
import { ToolOutlined } from '@ant-design/icons';
import BaseNodeForm from '../../@flow/form';
import { FlowNode } from '../../../models/flowTypes';
import { useReactFlow } from '@xyflow/react';

interface AgentToolsNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentToolsNodeForm: React.FC<AgentToolsNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {

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
    if (toolsNodeId.startsWith('agent-tools_')) {
      agentId = toolsNodeId.substring('agent-tools_'.length);
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
        <InputField
          name={["form", "toolIds"]}
          label="Tools"
          placeholder="Select tools"
        />
        {/* If you want to keep the Select for multi-tool selection, you can wrap InputField or extend it for multi-select. */}
      </Space>
    </BaseNodeForm>
  );
};

export default AgentToolsNodeForm;
