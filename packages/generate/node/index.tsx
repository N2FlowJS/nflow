import React, { useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { GenerateNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Tooltip, Spin } from 'antd';
import { RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ModelInfo from './ModelInfo';
import PromptInfo from './PromptInfo';
import { useModelDetails } from '../../../hooks/useModelDetails';
import HistoryChatSize from '../../@flow/share/history-chat-size';
import { GenerateNodeDefinition } from '../definition';
import { createDynamicInputPorts } from '../../@flow/ports';

const GenerateNode = ({ data, id, selected }: NodeProps<Node<GenerateNodeData>>) => {
  const { form } = data;
  const { loading, error, getModelDisplayName, getProviderName, modelDetails } = useModelDetails(form?.model);

  // Generate dynamic input ports from prompt template variables
  const inputPorts = useMemo(() => {
    if (form?.prompt) {
      return createDynamicInputPorts(form.prompt, GenerateNodeDefinition.inputs);
    }
    return GenerateNodeDefinition.inputs;
  }, [form?.prompt]);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      inputPorts={inputPorts}
      outputPorts={GenerateNodeDefinition.outputs}
      icon={<RobotOutlined style={{ color: '#52c41a' }} />}
      role={form?.role}>
      <Flex vertical gap={8}>
        <Flex align="center" justify="space-between">
          {loading ? (
            <Spin size="small" />
          ) : (
            <ModelInfo
              model={getModelDisplayName()}
              provider={getProviderName()}
              contextWindow={modelDetails?.contextWindow}
            />
          )}

          {error && (
            <Tooltip title={error}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Flex>

        <PromptInfo prompt={form?.prompt || ''} />
        <HistoryChatSize numberHistory={form?.numberHistory || 0} />
      </Flex>
    </BaseNode>
  );
};

export default GenerateNode;
