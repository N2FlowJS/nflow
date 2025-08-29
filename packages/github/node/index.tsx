import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { GitHubNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import GitHubConnectionInfo from './GitHubConnectionInfo';
import GitHubActionInfo from './GitHubActionInfo';

const GitHubNode = ({ data, id, selected }: NodeProps<Node<GitHubNodeData>>) => {
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
      icon={<GithubOutlined style={{ color: '#24292f' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <GitHubConnectionInfo
          owner={form?.owner || ''}
          repository={form?.repository || ''}
          hasToken={!!form?.token}
        />
        <GitHubActionInfo
          action={form?.action || 'create_issue'}
          issueNumber={form?.issueNumber}
          pullNumber={form?.pullNumber}
        />
      </Flex>
    </BaseNode>
  );
};

export default GitHubNode;
