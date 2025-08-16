import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { FileWriteNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import FilePathInfo from './FilePathInfo';
import WriteSettingsInfo from './WriteSettingsInfo';

const FileWriteNode = ({ data, id, selected }: NodeProps<Node<FileWriteNodeData>>) => {
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
      icon={<SaveOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <FilePathInfo 
          filePath={form?.filePath || ''}
          encoding={form?.encoding || 'utf8'}
        />
        <WriteSettingsInfo 
          overwrite={form?.overwrite ?? true}
          hasContent={!!form?.content}
        />
      </Flex>
    </BaseNode>
  );
};

export default FileWriteNode;
