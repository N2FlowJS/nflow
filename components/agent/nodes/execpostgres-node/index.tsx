import { DatabaseOutlined } from '@ant-design/icons';
import { Node, NodeProps, Position } from '@xyflow/react';
import { Flex } from 'antd';
import { ExecPostgresNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import QueryInfo from '../execmysql-node/QueryInfo';
import ConnectionInfo from '../execmysql-node/ConnectionInfo';

const ExecPostgresNode = ({ data, id, selected }: NodeProps<Node<ExecPostgresNodeData>>) => {
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
      icon={<DatabaseOutlined style={{ color: '#336791' }} />}
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

export default ExecPostgresNode;
