import { DatabaseOutlined } from '@ant-design/icons';
import { Node, NodeProps, Position } from '@xyflow/react';
import { Flex } from 'antd';
import { ExecMysqlNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import ConnectionInfo from './ConnectionInfo';
import QueryInfo from './QueryInfo';

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
