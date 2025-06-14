import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ExecMysqlNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { Flex, Typography, Tag } from 'antd';
import { DatabaseOutlined, CodeOutlined } from '@ant-design/icons';
import QueryInfo from './QueryInfo';
import ConnectionInfo from './ConnectionInfo';

const ExecMysqlNode = ({ data, id, selected }: NodeProps<Node<ExecMysqlNodeData>>) => {
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
      icon={<DatabaseOutlined style={{ color: '#ff7a00' }} />}
      role={data.form?.role}>
      <Flex vertical gap={8}>
        <QueryInfo query={form?.query || ''} />
        <ConnectionInfo
          hasConnection={!!form?.server && !!form?.database}
          timeout={form?.timeout ?? 30}
          maxRows={form?.maxRows ?? 100}
        />
      </Flex>
    </BaseNode>
  );
};

export default ExecMysqlNode;
