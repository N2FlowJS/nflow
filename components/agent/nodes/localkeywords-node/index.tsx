import { TagsOutlined } from '@ant-design/icons';
import { Node, NodeProps, Position } from '@xyflow/react';
import { Flex } from 'antd';
import React from 'react';
import { LocalKeywordsNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';

const LocalKeywordsNode = ({ data, id, selected }: NodeProps<Node<LocalKeywordsNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{ input: [Position.Left, Position.Right], output: [Position.Right, Position.Left] }}
      icon={<TagsOutlined />}
      role={data.form?.role}
    >
      <Flex vertical gap={6}>
        <div style={{ fontSize: 12, color: '#666' }}>Max: {form?.maxResults ?? 10} • Min len: {form?.minLength ?? 3}</div>
        <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {form?.text || '${conversation}'}
        </div>
      </Flex>
    </BaseNode>
  );
};

export default LocalKeywordsNode;
