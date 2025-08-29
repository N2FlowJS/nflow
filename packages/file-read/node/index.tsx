import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { FileReadNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import FilePathInfo from './FilePathInfo';
import SecurityInfo from './SecurityInfo';

const FileReadNode = ({ data, id, selected }: NodeProps<Node<FileReadNodeData>>) => {
  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <FilePathInfo
          filePath={data.form?.filePath || ''}
          encoding={data.form?.encoding || 'utf8'}
        />
        <SecurityInfo maxSize={data.form?.maxSize || 10485760} />
      </Flex>
    </BaseNode>
  );
};

export default FileReadNode;
