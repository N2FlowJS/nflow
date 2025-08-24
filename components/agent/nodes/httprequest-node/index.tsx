import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { HttpRequestNodeData } from '../../../../packages/http-request/types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import RequestInfo from './RequestInfo';
import ConfigInfo from './ConfigInfo';

const HttpRequestNode = ({ data, id, selected }: NodeProps<Node<HttpRequestNodeData>>) => {
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
      icon={<ApiOutlined style={{ color: '#fa8c16' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <RequestInfo 
          method={form?.method || 'GET'}
          url={form?.url || ''}
          hasBody={!!form?.body}
        />
        <ConfigInfo 
          timeout={form?.timeout || 30}
          followRedirects={form?.followRedirects ?? true}
        />
      </Flex>
    </BaseNode>
  );
};

export default HttpRequestNode;
