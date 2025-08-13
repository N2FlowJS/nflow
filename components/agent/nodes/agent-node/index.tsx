import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { AgentNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { ApartmentOutlined, ToolOutlined, BranchesOutlined, ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import AgentConfigInfo from './AgentConfigInfo';
import ConfigInfo from './ConfigInfo';
import { Divider, Space, Tag, Tooltip, Typography } from 'antd';
import ToolsList from './ToolsList';

const AgentNode = ({ data, id, selected }: NodeProps<Node<AgentNodeData>>) => {
  const { form } = data;
  const systemMsg = (form?.systemMessage || '').trim();
  const inputRefCount = form?.inputRefs?.length ?? 0;
  const toolIds: string[] = Array.isArray((form as any)?.delegationTools) ? (form as any).delegationTools : [];
  const timeoutSeconds = 30; // default display value
  const inheritContext = true; // keep behavior consistent with current props

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Bottom, Position.Bottom, Position.Right],
      }}
      icon={<ApartmentOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {/* Quick summary row */}
        <Space size={[6, 6]} wrap>
          <Tag color="blue"><ApartmentOutlined /> Agent</Tag>
          {form?.role && <Tag color="geekblue">{form.role}</Tag>}
          <Tag color="purple">Refs: {inputRefCount}</Tag>
          <Tag color={inheritContext ? 'success' : 'default'}>{inheritContext ? 'Inherit Context' : 'Isolated'}</Tag>
        </Space>

        {/* Existing info blocks */}
        {systemMsg && (
          <Tooltip title={systemMsg} placement="top">
            <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
              {systemMsg}
            </Typography.Paragraph>
          </Tooltip>
        )}
        <AgentConfigInfo systemMessage={form?.systemMessage || ''} />
        <ConfigInfo inheritContext={true} timeout={timeoutSeconds} variableCount={inputRefCount} />

        <Divider style={{ margin: '8px 0' }} />

        {/* Tools overview */}
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={6} align="center">
            <ToolOutlined style={{ color: '#999' }} />
            <Typography.Text type="secondary">Tools</Typography.Text>
          </Space>
          <ToolsList toolIds={toolIds} />
        </Space>

        {/* Connection guide */}
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={6} align="center">
            <InfoCircleOutlined style={{ color: '#999' }} />
            <Typography.Text type="secondary">Connection Guide</Typography.Text>
          </Space>
          <Space wrap size={[6, 6]}>
            <Tooltip title="Use the first bottom handle to create and connect Sub-Agents">
              <Tag icon={<BranchesOutlined />} color="processing">Bottom-0: Sub-Agents</Tag>
            </Tooltip>
            <Tooltip title="Use the second bottom handle to create and connect Tools">
              <Tag icon={<ToolOutlined />} color="processing">Bottom-1: Tools</Tag>
            </Tooltip>
            <Tooltip title="Right handle for linear continuation">
              <Tag icon={<ArrowRightOutlined />}>Right: Continue</Tag>
            </Tooltip>
          </Space>
        </Space>
      </Space>
    </BaseNode>
  );
};

export default AgentNode;
