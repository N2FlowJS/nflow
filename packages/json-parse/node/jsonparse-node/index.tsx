import React, { useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { JsonParseNodeData } from '../../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import JsonOperationInfo from './JsonOperationInfo';
import JsonPathInfo from './JsonPathInfo';
import { JsonParseNodeDefinition } from '../../definition';

const JsonParseNode = ({ data, id, selected }: NodeProps<Node<JsonParseNodeData>>) => {
  const { form } = data;

  // Compute dynamic input ports based on template variables
  const inputPorts = useMemo(() => {
    if (form) {
      return JsonParseNodeDefinition.getDynamicInputs?.(form) || JsonParseNodeDefinition.inputs;
    }
    return JsonParseNodeDefinition.inputs;
  }, [form?.jsonData, form?.jsonPath]);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      inputPorts={inputPorts}
      outputPorts={JsonParseNodeDefinition.outputs}
      icon={<CodeOutlined />}
      role={data.form?.role}>
      <Flex vertical gap={8}>
        <JsonOperationInfo operation={form?.operation || 'parse'} outputFormat={form?.outputFormat || 'object'} />
        {form?.operation === 'extract' && <JsonPathInfo jsonPath={form?.jsonPath || ''} />}
      </Flex>
    </BaseNode>
  );
};

export default JsonParseNode;
