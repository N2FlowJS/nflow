import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ConfluenceNodeData } from '../../../../packages/confluence/types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import ConfluenceConnectionInfo from './ConfluenceConnectionInfo';
import ConfluenceActionInfo from './ConfluenceActionInfo';

const ConfluenceNode = ({ data, id, selected }: NodeProps<Node<ConfluenceNodeData>>) => {
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
      icon={<FileTextOutlined style={{ color: '#172B4D' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <ConfluenceConnectionInfo 
          serverUrl={form?.serverUrl || ''}
          hasCredentials={!!(form?.username && form?.apiToken)}
        />
        <ConfluenceActionInfo 
          action={form?.action || 'create_page'}
          spaceKey={form?.spaceKey}
          pageId={form?.pageId}
        />
      </Flex>
    </BaseNode>
  );
};

export default ConfluenceNode;
