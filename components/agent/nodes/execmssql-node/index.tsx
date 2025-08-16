import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ExecMssqlNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import QueryInfo from './QueryInfo';
import ConnectionInfo from './ConnectionInfo';

const ExecMssqlNode = ({ data, id, selected }: NodeProps<Node<ExecMssqlNodeData>>) => {
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
      icon={<DatabaseOutlined style={{ color: '#0078d4' }} />}
      role={data.form?.role}
    >
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

export default ExecMssqlNode;
