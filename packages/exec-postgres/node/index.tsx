import { DatabaseOutlined } from '@ant-design/icons';
import { Node, NodeProps, Position } from '@xyflow/react';
import { Flex } from 'antd';
import { ExecPostgresNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import QueryInfo from '../../exec-mysql/node/QueryInfo';
import ConnectionInfo from '../../exec-mysql/node/ConnectionInfo';

const ExecPostgresNode = ({ data, id, selected }: NodeProps<Node<ExecPostgresNodeData>>) => {
  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<DatabaseOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}>
      <Flex vertical gap={8}>
        <QueryInfo query={data.form?.query || ''} />
        <ConnectionInfo
          hasConnection={!!data.form?.server && !!data.form?.database}
          timeout={data.form?.timeout ?? 30}
          maxRows={data.form?.maxRows ?? 100}
        />
      </Flex>
    </BaseNode>
  );
};

export default ExecPostgresNode;
