import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { GitLabNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { GitlabOutlined } from '@ant-design/icons';
import GitLabConnectionInfo from './GitLabConnectionInfo';
import GitLabActionInfo from './GitLabActionInfo';

const GitLabNode = ({ data, id, selected }: NodeProps<Node<GitLabNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<GitlabOutlined style={{ color: '#FC6D26' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <GitLabConnectionInfo 
          serverUrl={form?.serverUrl || ''}
          hasToken={!!form?.accessToken}
        />
        <GitLabActionInfo 
          action={form?.action || 'create_issue'}
          projectId={form?.projectId}
          title={form?.title}
        />
      </Flex>
    </BaseNode>
  );
};

export default GitLabNode;
