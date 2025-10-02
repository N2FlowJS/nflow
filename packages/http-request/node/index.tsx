import React, { useMemo } from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { HttpRequestNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import RequestInfo from './RequestInfo';
import ConfigInfo from './ConfigInfo';
import { HttpRequestNodeDefinition } from '../definition';

const HttpRequestNode = ({ data, id, selected }: NodeProps<Node<HttpRequestNodeData>>) => {
  const { form } = data;

  // Generate dynamic input ports from URL and body template variables
  const inputPorts = useMemo(() => {
    if (form) {
      return HttpRequestNodeDefinition.getDynamicInputs?.(form) || HttpRequestNodeDefinition.inputs;
    }
    return HttpRequestNodeDefinition.inputs;
  }, [form?.url, form?.body, form?.headers]);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      inputPorts={inputPorts}
      outputPorts={HttpRequestNodeDefinition.outputs}
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
