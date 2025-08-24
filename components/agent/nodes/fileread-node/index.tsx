import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { FileReadNodeData } from '../../../../packages/file-read/types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import FilePathInfo from './FilePathInfo';
import SecurityInfo from './SecurityInfo';

const FileReadNode = ({ data, id, selected }: NodeProps<Node<FileReadNodeData>>) => {
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
      icon={<FileTextOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <FilePathInfo 
          filePath={form?.filePath || ''}
          encoding={form?.encoding || 'utf8'}
        />
        <SecurityInfo 
          maxSize={form?.maxSize || 1048576}
        />
      </Flex>
    </BaseNode>
  );
};

export default FileReadNode;
