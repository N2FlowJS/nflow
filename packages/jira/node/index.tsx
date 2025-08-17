import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { JiraNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { BugOutlined } from '@ant-design/icons';
import JiraConnectionInfo from './JiraConnectionInfo';
import JiraActionInfo from './JiraActionInfo';

const JiraNode = ({ data, id, selected }: NodeProps<Node<JiraNodeData>>) => {
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
      icon={<BugOutlined style={{ color: '#0052CC' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <JiraConnectionInfo 
          serverUrl={form?.serverUrl || ''}
          hasCredentials={!!(form?.username && form?.apiToken)}
        />
        <JiraActionInfo 
          action={form?.action || 'create_issue'}
          projectKey={form?.projectKey}
          issueKey={form?.issueKey}
        />
      </Flex>
    </BaseNode>
  );
};

export default JiraNode;
