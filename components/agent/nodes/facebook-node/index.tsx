import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { FacebookNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { FacebookOutlined } from '@ant-design/icons';
import FacebookConnectionInfo from './FacebookConnectionInfo';
import FacebookActionInfo from './FacebookActionInfo';

const FacebookNode = ({ data, id, selected }: NodeProps<Node<FacebookNodeData>>) => {
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
      icon={<FacebookOutlined style={{ color: '#1877F2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <FacebookConnectionInfo 
          pageId={form?.pageId || ''}
          hasToken={!!form?.accessToken}
        />
        <FacebookActionInfo 
          action={form?.action || 'create_post'}
          postId={form?.postId}
          scheduled={form?.scheduled}
        />
      </Flex>
    </BaseNode>
  );
};

export default FacebookNode;
